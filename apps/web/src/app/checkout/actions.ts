"use server";

import { prisma } from "@/lib/db";
import { getCart, clearCart } from "@/lib/cart";
import { isStateAllowed } from "@/lib/shipping";
import { writeAuditLog } from "@/lib/audit";
import { redirect } from "next/navigation";

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

  const products = await prisma.product.findMany({
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

  await clearCart();
  redirect("/checkout/success");
}

