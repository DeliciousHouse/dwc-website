"use server";

import { randomBytes } from "node:crypto";
import { getPrisma } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";

export type ResendVerificationState = {
  ok: boolean;
  message?: string;
  error?: string;
};

function createToken() {
  return randomBytes(32).toString("hex");
}

export async function resendVerificationAction(
  _prev: ResendVerificationState,
  formData: FormData
): Promise<ResendVerificationState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Please enter a valid email." };
  }

  const prisma = getPrisma();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.emailVerified) {
    return { ok: true, message: "If an account exists, a verification email has been sent." };
  }

  const token = createToken();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);
  const identifier = `verify:${email}`;

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  try {
    await sendVerificationEmail(email, token);
  } catch {
    return { ok: false, error: "Unable to send verification email. Please try again." };
  }

  return { ok: true, message: "If an account exists, a verification email has been sent." };
}
