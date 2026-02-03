"use client";

import { useMemo, useState } from "react";
import { StripePayment } from "@/app/checkout/stripe-payment";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { createOrderAndPaymentIntentAction } from "@/app/checkout/actions";
import { US_STATES } from "@/app/checkout/us-states";

type AddressSummary = {
  id: string;
  name: string;
  phone: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

type CheckoutState = {
  clientSecret: string | null;
  orderId: string | null;
  error: string | null;
  pending: boolean;
};

export function CheckoutForm({
  addresses,
  userEmail,
}: {
  addresses: AddressSummary[];
  userEmail: string | null;
}) {
  const [state, setState] = useState<CheckoutState>({
    clientSecret: null,
    orderId: null,
    error: null,
    pending: false,
  });

  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
  const [formValues, setFormValues] = useState({
    email: userEmail ?? "",
    shippingName: defaultAddress?.name ?? "",
    shippingPhone: defaultAddress?.phone ?? "",
    shippingLine1: defaultAddress?.line1 ?? "",
    shippingLine2: defaultAddress?.line2 ?? "",
    shippingCity: defaultAddress?.city ?? "",
    shippingState: defaultAddress?.state ?? "",
    shippingPostal: defaultAddress?.postalCode ?? "",
  });

  // Use the browser URL to construct return_url at runtime (works in dev/prod).
  const returnUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/checkout/success`;
  }, []);

  const locked = Boolean(state.clientSecret);

  function updateValue(field: keyof typeof formValues, value: string) {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  }

  function onSelectAddress(id: string) {
    const selected = addresses.find((a) => a.id === id);
    if (!selected) return;
    setFormValues((prev) => ({
      ...prev,
      shippingName: selected.name,
      shippingPhone: selected.phone ?? "",
      shippingLine1: selected.line1,
      shippingLine2: selected.line2 ?? "",
      shippingCity: selected.city,
      shippingState: selected.state,
      shippingPostal: selected.postalCode,
    }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (locked || state.pending) return;
    setState((prev) => ({ ...prev, error: null, pending: true }));
    const formData = new FormData(e.currentTarget);
    const res = await createOrderAndPaymentIntentAction(formData);
    if (!res.ok) {
      setState((prev) => ({ ...prev, error: res.error, pending: false }));
      return;
    }
    setState({
      clientSecret: res.clientSecret,
      orderId: res.orderId,
      error: null,
      pending: false,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={onSubmit} className="dw-card flex flex-col gap-4 p-6">
        <div className="text-sm font-medium">Contact</div>
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={locked}
              value={formValues.email}
              onChange={(e) => updateValue("email", e.target.value)}
            />
          </div>
        </div>

        <div className="pt-2 text-sm font-medium">Shipping address</div>
        {addresses.length ? (
          <div className="grid gap-2">
            <Label htmlFor="savedAddress">Use saved address</Label>
            <select
              id="savedAddress"
              disabled={locked}
              className="border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm text-foreground shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              onChange={(e) => onSelectAddress(e.target.value)}
              defaultValue={defaultAddress?.id ?? ""}
            >
              {addresses.map((address) => (
                <option key={address.id} value={address.id}>
                  {address.name} · {address.line1}, {address.city} {address.state}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="shippingName">Full name</Label>
            <Input
              id="shippingName"
              name="shippingName"
              autoComplete="name"
              required
              disabled={locked}
              value={formValues.shippingName}
              onChange={(e) => updateValue("shippingName", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="shippingPhone">Phone (optional)</Label>
            <Input
              id="shippingPhone"
              name="shippingPhone"
              type="tel"
              autoComplete="tel"
              placeholder="For delivery questions"
              disabled={locked}
              value={formValues.shippingPhone}
              onChange={(e) => updateValue("shippingPhone", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="shippingLine1">Address line 1</Label>
            <Input
              id="shippingLine1"
              name="shippingLine1"
              autoComplete="address-line1"
              required
              disabled={locked}
              value={formValues.shippingLine1}
              onChange={(e) => updateValue("shippingLine1", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="shippingLine2">Address line 2 (optional)</Label>
            <Input
              id="shippingLine2"
              name="shippingLine2"
              autoComplete="address-line2"
              disabled={locked}
              value={formValues.shippingLine2}
              onChange={(e) => updateValue("shippingLine2", e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="grid gap-2 sm:col-span-1">
              <Label htmlFor="shippingCity">City</Label>
              <Input
                id="shippingCity"
                name="shippingCity"
                autoComplete="address-level2"
                required
                disabled={locked}
                value={formValues.shippingCity}
                onChange={(e) => updateValue("shippingCity", e.target.value)}
              />
            </div>
            <div className="grid gap-2 sm:col-span-1">
              <Label htmlFor="shippingState">State</Label>
              <select
                id="shippingState"
                name="shippingState"
                required
                disabled={locked}
                className="border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm text-foreground shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                value={formValues.shippingState}
                onChange={(e) => updateValue("shippingState", e.target.value)}
              >
                <option value="">Select</option>
                {US_STATES.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2 sm:col-span-1">
              <Label htmlFor="shippingPostal">Postal code</Label>
              <Input
                id="shippingPostal"
                name="shippingPostal"
                autoComplete="postal-code"
                required
                disabled={locked}
                value={formValues.shippingPostal}
                onChange={(e) => updateValue("shippingPostal", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="pt-2 text-sm font-medium">Compliance</div>
        <div className="flex flex-col gap-2">
          <label className="flex items-start gap-2 text-sm">
            <input
              name="ageAffirmed"
              type="checkbox"
              className="mt-1 size-4"
              disabled={locked}
              required
            />
            I affirm I am at least 21 years old.
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input
              name="adultSignatureDisclosure"
              type="checkbox"
              className="mt-1 size-4"
              disabled={locked}
              required
            />
            I acknowledge an adult signature will be required at delivery.
          </label>
        </div>

        {state.error ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {state.error}
          </div>
        ) : null}

        <Button type="submit" disabled={locked || state.pending}>
          {state.pending ? "Starting checkout…" : "Continue to payment"}
        </Button>
      </form>

      {state.clientSecret ? (
        <StripePayment clientSecret={state.clientSecret} returnUrl={returnUrl} />
      ) : (
        <div className="dw-card p-6 text-sm text-muted-foreground">
          Enter your email and shipping address to load payment options.
        </div>
      )}
    </div>
  );
}

