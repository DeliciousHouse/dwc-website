"use client";

import { useActionState } from "react";
import { submitCheckoutAction, type CheckoutResult } from "@/app/checkout/actions";
import { US_STATES } from "@/app/checkout/us-states";
import { Button } from "@/ui/button";

export function CheckoutForm() {
  const [state, action, pending] = useActionState<CheckoutResult | null, FormData>(
    submitCheckoutAction,
    null
  );

  return (
    <form action={action} className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-black">
      <div className="grid gap-2">
        <label className="text-sm font-medium">Email</label>
        <input
          name="email"
          type="email"
          required
          className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-black"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Shipping state</label>
        <select
          name="shippingState"
          required
          className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-black"
          defaultValue=""
        >
          <option value="" disabled>
            Select…
          </option>
          {US_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <label className="flex items-start gap-2 text-sm">
          <input name="ageAffirmed" type="checkbox" className="mt-1 size-4" /> I affirm I am at least 21 years old.
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input name="adultSignatureDisclosure" type="checkbox" className="mt-1 size-4" /> I acknowledge an adult signature
          will be required at delivery.
        </label>
      </div>

      {state && !state.ok ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {state.error}
        </div>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Submitting…" : "Acknowledge & continue"}
      </Button>
    </form>
  );
}

