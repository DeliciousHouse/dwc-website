"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function requireString(value: FormDataEntryValue | null, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing ${field}.`);
  }
  return value.trim();
}

function optionalNullableString(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  return v.length ? v : null;
}

function parseIntField(value: FormDataEntryValue | null, field: string): number {
  if (typeof value !== "string") throw new Error(`Missing ${field}.`);
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) throw new Error(`Invalid ${field}.`);
  return parsed;
}

export async function createProductAction(formData: FormData) {
  const name = requireString(formData.get("name"), "name");
  const slugRaw = optionalNullableString(formData.get("slug"));
  const slug = slugRaw ? slugify(slugRaw) : slugify(name);

  const priceCents = parseIntField(formData.get("priceCents"), "priceCents");
  const currency = (optionalNullableString(formData.get("currency")) ?? "USD").toUpperCase();
  const description = optionalNullableString(formData.get("description"));
  const imageUrl = optionalNullableString(formData.get("imageUrl"));
  const inventoryOnHand = parseIntField(formData.get("inventoryOnHand"), "inventoryOnHand");
  const isActive = formData.get("isActive") === "on";

  if (priceCents < 0) throw new Error("priceCents must be >= 0.");
  if (inventoryOnHand < 0) throw new Error("inventoryOnHand must be >= 0.");

  const created = await prisma.product.create({
    data: {
      name,
      slug,
      priceCents,
      currency,
      description,
      imageUrl,
      inventoryOnHand,
      isActive,
    },
  });

  revalidatePath("/shop");
  revalidatePath("/admin/products");
  redirect(`/admin/products/${created.id}/edit`);
}

export async function updateProductAction(productId: string, formData: FormData) {
  const name = requireString(formData.get("name"), "name");
  const slug = slugify(requireString(formData.get("slug"), "slug"));

  const priceCents = parseIntField(formData.get("priceCents"), "priceCents");
  const currency = (optionalNullableString(formData.get("currency")) ?? "USD").toUpperCase();
  const description = optionalNullableString(formData.get("description"));
  const imageUrl = optionalNullableString(formData.get("imageUrl"));
  const inventoryOnHand = parseIntField(formData.get("inventoryOnHand"), "inventoryOnHand");
  const isActive = formData.get("isActive") === "on";

  if (priceCents < 0) throw new Error("priceCents must be >= 0.");
  if (inventoryOnHand < 0) throw new Error("inventoryOnHand must be >= 0.");

  const previous = await prisma.product.findUnique({
    where: { id: productId },
    select: { slug: true },
  });
  if (!previous) throw new Error("Product not found.");

  await prisma.product.update({
    where: { id: productId },
    data: {
      name,
      slug,
      priceCents,
      currency,
      description,
      imageUrl,
      inventoryOnHand,
      isActive,
    },
  });

  revalidatePath("/shop");
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath(`/shop/${previous.slug}`);
  revalidatePath(`/shop/${slug}`);
}

export async function deleteProductAction(productId: string) {
  await prisma.product.delete({ where: { id: productId } });
  revalidatePath("/shop");
  revalidatePath("/admin/products");
}

