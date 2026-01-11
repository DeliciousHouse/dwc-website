"use server";

import { revalidatePath } from "next/cache";
import { addToCart } from "@/lib/cart";

export async function addToCartAction(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const qty = Number(formData.get("qty") ?? 1);
  if (!productId) return;
  await addToCart(productId, Number.isFinite(qty) ? qty : 1);
  revalidatePath("/cart");
}

