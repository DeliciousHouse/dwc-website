import { getPrisma } from "@/lib/db";
import { AppError } from "@/lib/errors";

export async function assertStateAllowed(stateRaw: string) {
  const state = stateRaw.trim().toUpperCase();
  if (state.length !== 2) {
    throw new AppError("Invalid US state code.", { code: "INVALID_STATE", status: 400 });
  }

  const rule = await getPrisma().shippingRule.findUnique({ where: { state } });
  // Per plan: allow all by default unless explicitly denied.
  if (rule && !rule.isAllowed) {
    throw new AppError("Shipping is not available to this state.", {
      code: "STATE_NOT_ALLOWED",
      status: 403,
      details: { state, reason: rule.reason ?? null },
    });
  }
}

