"use server";

import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";

function readString(formData: FormData, field: string) {
  return String(formData.get(field) ?? "").trim();
}

function readInt(formData: FormData, field: string) {
  const value = readString(formData, field);
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) throw new Error(`Invalid ${field}.`);
  return parsed;
}

export async function adjustInventoryAction(formData: FormData) {
  const session = await requireAdmin();
  const productId = readString(formData, "productId");
  const delta = readInt(formData, "delta");
  const note = readString(formData, "note");

  if (!productId || !delta) return;

  const prisma = getPrisma();
  await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error("Product not found.");
    const next = product.inventoryOnHand + delta;
    if (next < 0) throw new Error("Inventory cannot go below zero.");

    await tx.inventoryAdjustment.create({
      data: {
        productId,
        delta,
        note: note || null,
      },
    });

    await tx.product.update({
      where: { id: productId },
      data: { inventoryOnHand: next },
    });
  });

  await writeAuditLog({
    action: "admin_inventory_adjusted",
    entityType: "product",
    entityId: productId,
    actorUserId: session.user.id,
    data: { delta, note: note || null },
  });

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}
