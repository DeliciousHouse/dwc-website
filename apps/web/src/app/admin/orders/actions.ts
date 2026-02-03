"use server";

import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";

export async function updateOrderStatusAction(formData: FormData) {
  const session = await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  if (!orderId || !status) return;

  await getPrisma().order.update({
    where: { id: orderId },
    data: { status: status as "pending" | "paid" | "fulfilled" | "cancelled" | "refunded" },
  });

  await writeAuditLog({
    action: "admin_order_status_updated",
    entityType: "order",
    entityId: orderId,
    actorUserId: session.user.id,
    data: { status },
  });

  revalidatePath("/admin/orders");
}
