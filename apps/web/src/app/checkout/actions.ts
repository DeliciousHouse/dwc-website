"use server";

import { getPrisma } from "@/lib/db";
import { getCart } from "@/lib/cart";
import { isStateAllowed } from "@/lib/shipping";
import { writeAuditLog } from "@/lib/audit";
import { stripe } from "@/lib/stripe";
import { auth } from "@/auth";

export type CheckoutResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitCheckoutAction(_prev: CheckoutResult | null, formData: FormData): Promise<CheckoutResult> {
  const email = String(formData.get("email") ?? "").trim();
  const shippingState = String(formData.get("shippingState") ?? "").trim().toUpperCase();
  const ageAffirmed = Boolean(formData.get("ageAffirmed"));
  const adultSignatureDisclosure = Boolean(formData.get("adultSignatureDisclosure"));

  if (!email.includes("@")) return { ok: false, error: "Please enter a valid email." };
  if (!shippingState) return { ok: false, error: "Please select a shipping state." };
  if (!ageAffirmed) return { ok: false, error: "You must affirm you are 21+ to continue." };
  if (!adultSignatureDisclosure) return { ok: false, error: "You must acknowledge the adult signature requirement." };

  const cart = await getCart();
  if (cart.items.length === 0) return { ok: false, error: "Your cart is empty." };

  const eligibility = await isStateAllowed(shippingState);
  if (!eligibility.allowed) {
    return { ok: false, error: eligibility.reason ? `Shipping blocked: ${eligibility.reason}` : "Shipping is not allowed for that state." };
  }

  const products = await getPrisma().product.findMany({
    where: { id: { in: cart.items.map((i) => i.productId) } },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  // Ensure products still exist + are active.
  for (const item of cart.items) {
    const p = byId.get(item.productId);
    if (!p || !p.isActive) return { ok: false, error: "One or more items are no longer available." };
    if (p.inventoryOnHand <= 0) return { ok: false, error: `Out of stock: ${p.name}` };
  }

  await writeAuditLog({
    action: "checkout_compliance_acknowledged",
    entityType: "checkout",
    entityId: null,
    data: {
      email,
      shippingState,
      ageAffirmedAt: new Date().toISOString(),
      adultSignatureRequired: true,
      cart: cart.items,
    },
  });

  return { ok: true };
}

export type CreateOrderResult =
  | { ok: true; clientSecret: string; orderId: string }
  | { ok: false; error: string };

function readString(formData: FormData, field: string) {
  const value = String(formData.get(field) ?? "").trim();
  return value;
}

function readOptionalString(formData: FormData, field: string) {
  const value = String(formData.get(field) ?? "").trim();
  return value.length ? value : null;
}

export async function createOrderAndPaymentIntentAction(formData: FormData): Promise<CreateOrderResult> {
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const email = readString(formData, "email");
  const name = readString(formData, "shippingName");
  const phone = readOptionalString(formData, "shippingPhone");
  const line1 = readString(formData, "shippingLine1");
  const line2 = readOptionalString(formData, "shippingLine2");
  const city = readString(formData, "shippingCity");
  const shippingState = readString(formData, "shippingState").toUpperCase();
  const postalCode = readString(formData, "shippingPostal");
  const ageAffirmed = Boolean(formData.get("ageAffirmed"));
  const adultSignatureDisclosure = Boolean(formData.get("adultSignatureDisclosure"));

  if (!email.includes("@")) return { ok: false, error: "Please enter a valid email." };
  if (!name) return { ok: false, error: "Please enter the recipient name." };
  if (!line1) return { ok: false, error: "Please enter a shipping address." };
  if (!city) return { ok: false, error: "Please enter a shipping city." };
  if (!shippingState || shippingState.length !== 2) return { ok: false, error: "Please select a shipping state." };
  if (!postalCode) return { ok: false, error: "Please enter a postal code." };
  if (!ageAffirmed) return { ok: false, error: "You must affirm you are 21+ to continue." };
  if (!adultSignatureDisclosure) return { ok: false, error: "You must acknowledge the adult signature requirement." };
  if (!stripe) return { ok: false, error: "Stripe is not configured (missing STRIPE_SECRET_KEY)." };

  const cart = await getCart();
  if (cart.items.length === 0) return { ok: false, error: "Your cart is empty." };

  const eligibility = await isStateAllowed(shippingState);
  if (!eligibility.allowed) {
    return {
      ok: false,
      error: eligibility.reason ? `Shipping blocked: ${eligibility.reason}` : "Shipping is not allowed for that state.",
    };
  }

  const prisma = getPrisma();
  const productIds = cart.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  let currency = "USD";
  let subtotalCents = 0;
  for (const item of cart.items) {
    const p = byId.get(item.productId);
    if (!p || !p.isActive) return { ok: false, error: "One or more items are no longer available." };
    if (p.inventoryOnHand < item.qty) return { ok: false, error: `Insufficient stock: ${p.name}` };
    if (p.currency && p.currency !== currency) {
      return { ok: false, error: "Mixed currencies are not supported." };
    }
    currency = p.currency ?? currency;
    subtotalCents += p.priceCents * item.qty;
  }

  if (subtotalCents <= 0) return { ok: false, error: "Your cart total is invalid." };

  const shippingCents = 0;
  const taxCents = 0;
  const totalCents = subtotalCents + shippingCents + taxCents;
  const addressSnapshot = {
    name,
    phone,
    line1,
    line2,
    city,
    state: shippingState,
    postalCode,
    country: "US",
  };

  let orderId: string | null = null;
  try {
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          email,
          userId,
          status: "pending",
          subtotalCents,
          shippingCents,
          taxCents,
          totalCents,
          currency,
          shippingState,
          shippingAddressSnapshot: addressSnapshot,
          ageAffirmedAt: new Date(),
          adultSignatureRequired: true,
        },
      });

      const items = cart.items.map((item) => {
        const p = byId.get(item.productId)!;
        return {
          orderId: created.id,
          productId: p.id,
          nameSnapshot: p.name,
          unitPriceCents: p.priceCents,
          qty: item.qty,
          lineTotalCents: p.priceCents * item.qty,
        };
      });
      if (items.length) {
        await tx.orderItem.createMany({ data: items });
      }

      const reservations = cart.items.map((item) => ({
        productId: item.productId,
        qty: item.qty,
        status: "reserved",
        reason: "order",
        orderId: created.id,
      }));
      if (reservations.length) {
        await tx.inventoryReservation.createMany({ data: reservations });
      }

      return created;
    });

    orderId = order.id;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId,
        email,
      },
    });

    if (!paymentIntent.client_secret) {
      throw new Error("Missing client secret from Stripe.");
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    await writeAuditLog({
      action: "checkout_order_created",
      entityType: "order",
      entityId: orderId,
      data: {
        email,
        shippingState,
        totalCents,
      },
    });

    return { ok: true, clientSecret: paymentIntent.client_secret, orderId };
  } catch (error) {
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "cancelled" },
      });
      await prisma.inventoryReservation.updateMany({
        where: { orderId },
        data: { status: "released" },
      });
    }
    return { ok: false, error: error instanceof Error ? error.message : "Unable to start checkout. Please try again." };
  }
}

