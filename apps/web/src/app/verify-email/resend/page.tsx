"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { resendVerificationAction } from "./actions";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";

export const metadata = {
  title: "Resend Verification",
};

const initialState = { ok: false, message: "", error: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Sending..." : "Send verification email"}
    </Button>
  );
}

export default function ResendVerificationPage() {
  const [state, formAction] = useFormState(resendVerificationAction, initialState);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <div>
        <h1 className="dw-h1">Resend verification</h1>
        <p className="dw-lead mt-2">Enter your email and we will send a new verification link.</p>
      </div>

      <form action={formAction} className="dw-card flex flex-col gap-4 p-5">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>

        {state.error ? <p className="text-sm text-red-600 dark:text-red-300">{state.error}</p> : null}
        {state.message ? <p className="text-sm text-emerald-700 dark:text-emerald-300">{state.message}</p> : null}

        <SubmitButton />
      </form>

      <div className="text-sm text-muted-foreground">
        <Link className="underline underline-offset-4 hover:text-foreground" href="/signin">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
