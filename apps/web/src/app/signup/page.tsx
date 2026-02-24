"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { signupAction } from "./actions";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";

export const metadata = {
  title: "Create Account",
};

const initialState = { ok: false, message: "", error: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating account..." : "Create account"}
    </Button>
  );
}

export default function SignupPage() {
  const [state, formAction] = useFormState(signupAction, initialState);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <div>
        <h1 className="dw-h1">Create your account</h1>
        <p className="dw-lead mt-2">Create an account with email + password.</p>
      </div>

      <form action={formAction} className="dw-card flex flex-col gap-4 p-5">
        <div className="grid gap-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" autoComplete="name" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        {state.error ? <p className="text-sm text-red-600 dark:text-red-300">{state.error}</p> : null}
        {state.message ? <p className="text-sm text-emerald-700 dark:text-emerald-300">{state.message}</p> : null}

        <SubmitButton />
      </form>

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

