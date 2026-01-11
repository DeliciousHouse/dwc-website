import { prisma } from "@/lib/db";

export async function isStateAllowed(stateRaw: string): Promise<{ allowed: boolean; reason?: string }> {
  const state = stateRaw.trim().toUpperCase();
  if (!state) return { allowed: false, reason: "Missing state" };

  const rule = await prisma.shippingRule.findUnique({ where: { state } });
  if (!rule) return { allowed: true };
  return { allowed: rule.isAllowed, reason: rule.reason ?? undefined };
}

