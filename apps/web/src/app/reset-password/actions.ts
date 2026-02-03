"use server";

import { getPrisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";

export type ResetPasswordState = {
  ok: boolean;
  message?: string;
  error?: string;
};

function isExpired(expires: Date) {
  return expires.getTime() < Date.now();
}

export async function resetPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!token) return { ok: false, error: "Missing reset token." };
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };

  const prisma = getPrisma();
  const record = await prisma.verificationToken.findUnique({ where: { token } });

  if (!record || isExpired(record.expires) || !record.identifier.startsWith("reset:")) {
    return { ok: false, error: "This reset link is invalid or expired." };
  }

  const email = record.identifier.replace("reset:", "");
  const passwordHash = await hashPassword(password);

  await prisma.user.update({
    where: { email },
    data: { passwordHash },
  });
  await prisma.verificationToken.delete({ where: { token } });

  return { ok: true, message: "Password updated. You can sign in now." };
}
