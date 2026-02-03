import Link from "next/link";
import { clearCart } from "@/lib/cart";

export default async function CheckoutSuccessPage() {
  await clearCart();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="dw-h1">Compliance acknowledged</h1>
      <p className="dw-lead">
        Thanks — your compliance acknowledgments were recorded and your cart has been cleared.
      </p>
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

