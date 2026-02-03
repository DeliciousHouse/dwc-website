"use server";

import { randomBytes } from "node:crypto";
import { getPrisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

export type RequestResetState = {
  ok: boolean;
  message?: string;
  error?: string;
};

function createToken() {
  return randomBytes(32).toString("hex");
}

export async function requestPasswordResetAction(
  _prev: RequestResetState,
  formData: FormData
): Promise<RequestResetState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Please enter a valid email." };
  }

  const prisma = getPrisma();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return { ok: true, message: "If an account exists, a reset link has been sent." };
  }

  const token = createToken();
  const expires = new Date(Date.now() + 1000 * 60 * 60);
  const identifier = `reset:${email}`;

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  try {
    await sendPasswordResetEmail(email, token);
  } catch {
    return { ok: false, error: "Unable to send reset email. Please try again." };
  }

  return { ok: true, message: "If an account exists, a reset link has been sent." };
}
