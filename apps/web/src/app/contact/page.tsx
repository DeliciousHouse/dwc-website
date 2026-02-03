"use client";

import { SiteImage } from "@/components/site-image";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { useFormState, useFormStatus } from "react-dom";
import { contactAction } from "./actions";

export const metadata = {
  title: "Contact",
};

const initialState = { ok: false, message: "", error: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Sending..." : "Send message"}
    </Button>
  );
}

export default function ContactPage() {
  const [state, formAction] = useFormState(contactAction, initialState);

  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="space-y-4">
          <h1 className="dw-h1">Contact</h1>
          <p className="dw-lead max-w-xl">
            Questions about an order or the club. We respond on business days.
          </p>
          <div className="space-y-3 border-t border-border/70 pt-4 text-sm text-muted-foreground">
            <div>
              <div className="text-sm font-semibold text-foreground">Email</div>
              bkam@deliciouswines.org
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">Hours</div>
              Mon–Fri, 9am–5pm PT
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">Response SLAs</div>
              Order issues: within 1 business day. General inquiries: within 2 business days.
            </div>
          </div>
        </div>

        <div className="relative aspect-[4/3]">
          <SiteImage id="contactVineyard" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
      </div>

      <form action={formAction} className="dw-card grid gap-4 p-6">
        <div className="text-sm font-semibold">Send a message</div>
        <div className="grid gap-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" autoComplete="name" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="issueType">Topic</Label>
          <select
            id="issueType"
            name="issueType"
            className="border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm text-foreground shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            defaultValue="general"
          >
            <option value="general">General question</option>
            <option value="order">Order issue</option>
            <option value="club">Wine club</option>
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="orderNumber">Order number (if applicable)</Label>
          <Input id="orderNumber" name="orderNumber" placeholder="DW-12345" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="addressLine1">Shipping address line 1</Label>
          <Input id="addressLine1" name="addressLine1" placeholder="123 Main St" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="addressLine2">Shipping address line 2</Label>
          <Input id="addressLine2" name="addressLine2" placeholder="Apt 2B" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="addressCity">City</Label>
            <Input id="addressCity" name="addressCity" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="addressState">State</Label>
            <Input id="addressState" name="addressState" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="addressPostal">Postal code</Label>
            <Input id="addressPostal" name="addressPostal" />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="message">Message</Label>
          <textarea
            id="message"
            name="message"
            required
            rows={6}
            className="border-input min-h-[120px] w-full rounded-md border bg-transparent px-3 py-2 text-sm text-foreground shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          />
        </div>

        {state.error ? <p className="text-sm text-red-600 dark:text-red-300">{state.error}</p> : null}
        {state.message ? <p className="text-sm text-emerald-700 dark:text-emerald-300">{state.message}</p> : null}

        <SubmitButton />
      </form>
    </div>
  );
}

