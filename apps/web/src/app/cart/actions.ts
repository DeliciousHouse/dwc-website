"use server";

import { revalidatePath } from "next/cache";
import { clearCart, removeFromCart, updateCartItem } from "@/lib/cart";

export async function updateCartItemAction(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const qty = Number(formData.get("qty") ?? 0);
  if (!productId) return;
  await updateCartItem(productId, Number.isFinite(qty) ? qty : 0);
  revalidatePath("/cart");
}

export async function removeFromCartAction(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  if (!productId) return;
  await removeFromCart(productId);
  revalidatePath("/cart");
}

export async function clearCartAction() {
  await clearCart();
  revalidatePath("/cart");
}

