import Link from "next/link";
import { getPrisma } from "@/lib/db";

type VerifyEmailPageProps = {
  searchParams: { token?: string };
};

function isExpired(expires: Date) {
  return expires.getTime() < Date.now();
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const token = typeof searchParams.token === "string" ? searchParams.token : "";

  if (!token) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-4">
        <h1 className="dw-h2">Verify your email</h1>
        <p className="text-sm text-muted-foreground">Check your inbox for a verification link.</p>
        <Link className="text-sm underline underline-offset-4 hover:text-foreground" href="/signin">
          Back to sign in
        </Link>
      </div>
    );
  }

  const prisma = getPrisma();
  const record = await prisma.verificationToken.findUnique({ where: { token } });

  if (!record || isExpired(record.expires) || !record.identifier.startsWith("verify:")) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-4">
        <h1 className="dw-h2">Verification link expired</h1>
        <p className="text-sm text-muted-foreground">
          This link is invalid or expired. You can request a new verification email by signing up again.
        </p>
        <Link className="text-sm underline underline-offset-4 hover:text-foreground" href="/signup">
          Create account
        </Link>
      </div>
    );
  }

  const email = record.identifier.replace("verify:", "");
  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });
  await prisma.verificationToken.delete({ where: { token } });

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <h1 className="dw-h2">Email verified</h1>
      <p className="text-sm text-muted-foreground">Your email has been verified. You can now sign in.</p>
      <Link className="text-sm underline underline-offset-4 hover:text-foreground" href="/signin">
        Continue to sign in
      </Link>
    </div>
  );
}
