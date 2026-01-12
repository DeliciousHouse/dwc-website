"use client";

import { useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { createPaymentIntentAction } from "@/app/checkout/stripe-actions";
import { Button } from "@/ui/button";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

function InnerPaymentForm({ returnUrl }: { returnUrl: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [age, setAge] = useState(false);
  const [sig, setSig] = useState(false);

  const canPay = age && sig;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!stripe || !elements) return;
    if (!canPay) {
      setError("Please confirm you are 21+ and acknowledge the adult signature requirement.");
      return;
    }

    setPending(true);
    try {
      const res = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
      });

      if (res.error) setError(res.error.message ?? "Payment failed. Please try again.");
      // On success, Stripe will redirect to return_url.
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-black"
    >
      <div className="text-sm font-medium">Payment</div>
      <div className="text-sm text-zinc-600 dark:text-zinc-300">
        Apple Pay and Google Pay will appear automatically when available on your device.
      </div>

      <PaymentElement
        options={{
          layout: "tabs",
          wallets: {
            applePay: "auto",
            googlePay: "auto",
          },
        }}
      />

      <div className="flex flex-col gap-2 pt-2">
        <label className="flex items-start gap-2 text-sm">
          <input checked={age} onChange={(e) => setAge(e.target.checked)} type="checkbox" className="mt-1 size-4" /> I
          affirm I am at least 21 years old.
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input checked={sig} onChange={(e) => setSig(e.target.checked)} type="checkbox" className="mt-1 size-4" /> I
          acknowledge an adult signature will be required at delivery.
        </label>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <Button type="submit" disabled={!stripe || !elements || pending}>
        {pending ? "Processing…" : "Pay now"}
      </Button>
    </form>
  );
}

export function StripePayment() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use the browser URL to construct return_url at runtime (works in dev/prod).
  const returnUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/checkout/success`;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setError(null);

      if (!stripePromise) {
        setError("Stripe is not configured (missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY).");
        return;
      }

      const res = await createPaymentIntentAction();
      if (cancelled) return;
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setClientSecret(res.clientSecret);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-700 dark:border-white/10 dark:bg-black dark:text-zinc-300">
        <div className="font-medium text-zinc-950 dark:text-white">Payment unavailable</div>
        <div className="mt-2">{error}</div>
        <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Add Stripe keys to `.env` and restart `docker compose up`.
        </div>
      </div>
    );
  }

  if (!stripePromise || !clientSecret) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-700 dark:border-white/10 dark:bg-black dark:text-zinc-300">
        Loading payment…
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: { theme: "stripe" },
      }}
    >
      <InnerPaymentForm returnUrl={returnUrl} />
    </Elements>
  );
}

