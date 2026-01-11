import { redirect } from "next/navigation";

import { auth } from "@/auth";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/signin");
  return session;
}

export async function requireAdmin() {
  const session = await requireUser();
  if (!session.user.isAdmin) redirect("/");
  return session;
}

