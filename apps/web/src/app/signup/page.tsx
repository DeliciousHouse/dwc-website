import Link from "next/link";

export const metadata = {
  title: "Create Account",
};

export default function SignupPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Account creation will be enabled soon. For now, you can sign in with Google/Apple (once configured).
        </p>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-5 text-sm text-zinc-700 dark:border-white/10 dark:bg-black dark:text-zinc-300">
        <div className="font-medium text-zinc-950 dark:text-white">What’s next</div>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Enable providers + credentials sign-up flow</li>
          <li>Add email verification</li>
          <li>Profile + addresses</li>
        </ul>
      </div>

      <div className="text-sm">
        Already have an account?{" "}
        <Link className="underline underline-offset-4" href="/signin">
          Login
        </Link>
        .
      </div>
    </div>
  );
}

