 "use server";

import { z } from "zod";
import { randomBytes } from "node:crypto";
import { getPrisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { sendVerificationEmail } from "@/lib/email";

export type SignupState = {
  ok: boolean;
  message?: string;
  error?: string;
};

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

function createToken() {
  return randomBytes(32).toString("hex");
}

export async function signupAction(_prev: SignupState, formData: FormData): Promise<SignupState> {
  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = signupSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: "Please provide a valid name, email, and password (8+ characters)." };
  }

  const prisma = getPrisma();
  const existing = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existing) {
    return { ok: false, error: "An account already exists for that email." };
  }

  const passwordHash = await hashPassword(payload.password);
  await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      passwordHash,
    },
  });

  const token = createToken();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);
  const identifier = `verify:${payload.email}`;

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  try {
    await sendVerificationEmail(payload.email, token);
  } catch {
    return { ok: false, error: "Account created, but verification email could not be sent." };
  }

  return { ok: true, message: "Check your email for a verification link." };
}
