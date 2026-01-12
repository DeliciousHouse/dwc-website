import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCart } from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import { CheckoutForm } from "@/app/checkout/checkout-form";

export default async function CheckoutPage() {
  const cart = await getCart();
  const products = cart.items.length
    ? await prisma.product.findMany({ where: { id: { in: cart.items.map((i) => i.productId) } } })
    : [];
  const byId = new Map(products.map((p) => [p.id, p]));

  const rows = cart.items
    .map((i) => ({ item: i, product: byId.get(i.productId) }))
    .filter((r) => r.product);

  const subtotalCents = rows.reduce((sum, r) => sum + r.product!.priceCents * r.item.qty, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Pay fast with Apple Pay / Google Pay (when available), plus required compliance acknowledgments.
          </p>
        </div>
        <Link className="text-sm underline underline-offset-4" href="/cart">
          ← Back to cart
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-black">
          <div className="text-sm font-medium">Order summary</div>
          <div className="pt-3 flex flex-col gap-2 text-sm">
            {rows.length === 0 ? (
              <div className="text-zinc-600 dark:text-zinc-300">Cart is empty.</div>
            ) : (
              rows.map(({ item, product }) => (
                <div key={item.productId} className="flex items-center justify-between gap-3">
                  <div className="text-zinc-800 dark:text-zinc-200">
                    {product!.name} <span className="text-zinc-500 dark:text-zinc-400">× {item.qty}</span>
                  </div>
                  <div className="text-zinc-800 dark:text-zinc-200">
                    {formatMoney(product!.priceCents * item.qty, product!.currency)}
                  </div>
                </div>
              ))
            )}
            <div className="mt-2 border-t border-zinc-200 pt-3 text-sm dark:border-white/10">
              <div className="flex items-center justify-between font-semibold">
                <div>Total (pre-tax/shipping)</div>
                <div>{formatMoney(subtotalCents)}</div>
              </div>
              <div className="pt-2 text-xs text-zinc-500 dark:text-zinc-400">
                Shipping/tax will be calculated during payment.
              </div>
            </div>
          </div>
        </div>

        <CheckoutForm />
      </div>
    </div>
  );
}

