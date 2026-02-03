"use client";

import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/ui/button";
import { useState } from "react";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

function InnerPaymentForm({ returnUrl }: { returnUrl: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!stripe || !elements) return;

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
    <form onSubmit={onSubmit} className="dw-card flex flex-col gap-4 p-6">
      <div className="text-sm font-medium">Payment</div>
      <div className="text-sm text-muted-foreground">
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

export function StripePayment({ clientSecret, returnUrl }: { clientSecret: string; returnUrl: string }) {
  if (!stripePromise) {
    return (
      <div className="dw-card p-6 text-sm text-muted-foreground">
        <div className="font-medium text-foreground">Payment unavailable</div>
        <div className="mt-2">Stripe is not configured (missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY).</div>
        <div className="mt-2 text-xs text-muted-foreground">
          Add Stripe keys to `.env` and restart `docker compose up`.
        </div>
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

