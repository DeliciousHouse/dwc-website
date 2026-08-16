import Link from "next/link";

const messages = {
  paid: {
    title: "Payment confirmed",
    body: "Thanks — Square confirmed your payment and your order is now being prepared.",
  },
  pending: {
    title: "Payment processing",
    body: "Square has not completed this payment yet. Your cart is still available while we wait for confirmation.",
  },
  cancelled: {
    title: "Checkout cancelled",
    body: "No completed payment was recorded. Your cart is still available if you’d like to try again.",
  },
  "payment-review": {
    title: "Payment received — order review required",
    body: "Square confirmed the payment after the inventory hold expired. We saved your order for support review; do not submit another payment. We will confirm fulfillment or a refund.",
  },
  unverified: {
    title: "Payment not verified",
    body: "We could not verify a completed Square payment. Your cart has not been cleared.",
  },
} as const;

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const status = (await searchParams).status;
  const message = status && status in messages
    ? messages[status as keyof typeof messages]
    : messages.unverified;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="dw-h1">{message.title}</h1>
      <p className="dw-lead">{message.body}</p>
      <div className="flex gap-3">
        <Link className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" href="/shop">
          Back to shop
        </Link>
        <Link className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted" href="/">
          Home
        </Link>
      </div>
    </div>
  );
}

