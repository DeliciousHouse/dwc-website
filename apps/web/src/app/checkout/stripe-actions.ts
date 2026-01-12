"use server";

import { getCart } from "@/lib/cart";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export type CreatePaymentIntentResult =
  | { ok: true; clientSecret: string; amountCents: number; currency: string }
  | { ok: false; error: string };

export async function createPaymentIntentAction(): Promise<CreatePaymentIntentResult> {
  if (!stripe) return { ok: false, error: "Stripe is not configured (missing STRIPE_SECRET_KEY)." };

  const cart = await getCart();
  if (cart.items.length === 0) return { ok: false, error: "Your cart is empty." };

  const products = await prisma.product.findMany({
    where: { id: { in: cart.items.map((i) => i.productId) } },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  // Validate cart contents.
  for (const item of cart.items) {
    const p = byId.get(item.productId);
    if (!p || !p.isActive) return { ok: false, error: "One or more items are no longer available." };
    if (p.inventoryOnHand <= 0) return { ok: false, error: `Out of stock: ${p.name}` };
  }

  const currency = "usd";
  const amountCents = cart.items.reduce((sum, i) => {
    const p = byId.get(i.productId)!;
    return sum + p.priceCents * i.qty;
  }, 0);

  if (amountCents <= 0) return { ok: false, error: "Your cart total is invalid." };

  const pi = await stripe.paymentIntents.create({
    amount: amountCents,
    currency,
    // This enables Apple Pay / Google Pay (and other methods) when supported.
    automatic_payment_methods: { enabled: true },
    metadata: {
      source: "dwc_checkout",
    },
  });

  if (!pi.client_secret) return { ok: false, error: "Unable to initialize payment." };
  return { ok: true, clientSecret: pi.client_secret, amountCents, currency };
}

