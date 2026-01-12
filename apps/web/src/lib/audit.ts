import { headers } from "next/headers";
import { getPrisma } from "@/lib/db";

export type AuditLogInput = {
  action: string;
  entityType: string;
  entityId?: string | null;
  userId?: string | null;
  actorUserId?: string | null;
  data?: unknown;
};

export async function writeAuditLog(input: AuditLogInput) {
  const h = await headers();
  const userAgent = h.get("user-agent");
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip");

  await getPrisma().auditLog.create({
    data: {
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      userId: input.userId ?? null,
      actorUserId: input.actorUserId ?? null,
      data: input.data as any,
      ip: ip ?? null,
      userAgent: userAgent ?? null,
    },
  });
}

