"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { resetPasswordAction } from "./actions";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";

const initialState = { ok: false, message: "", error: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Updating..." : "Set new password"}
    </Button>
  );
}

export default function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useFormState(resetPasswordAction, initialState);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <div>
        <h1 className="dw-h1">Set a new password</h1>
        <p className="dw-lead mt-2">Choose a new password for your account.</p>
      </div>

      <form action={formAction} className="dw-card flex flex-col gap-4 p-5">
        <input type="hidden" name="token" value={token} />
        <div className="grid gap-2">
          <Label htmlFor="password">New password</Label>
          <Input id="password" name="password" type="password" minLength={8} required autoComplete="new-password" />
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
