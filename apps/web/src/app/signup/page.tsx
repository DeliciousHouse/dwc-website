import Link from "next/link";

export const metadata = {
  title: "Create Account",
};

export default function SignupPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <div>
        <h1 className="dw-h1">Create your account</h1>
        <p className="dw-lead mt-2">
          Account creation will be enabled soon. For now, you can sign in with Google/Apple (once configured).
        </p>
      </div>

      <div className="dw-card p-5 text-sm text-muted-foreground">
        <div className="font-medium text-foreground">What’s next</div>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Enable providers + credentials sign-up flow</li>
          <li>Add email verification</li>
          <li>Profile + addresses</li>
        </ul>
      </div>

      <div className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link className="underline underline-offset-4 hover:text-foreground" href="/signin">
          Login
        </Link>
        .
      </div>
    </div>
  );
}

