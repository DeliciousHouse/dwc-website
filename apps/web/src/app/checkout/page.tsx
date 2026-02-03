import Link from "next/link";
import { getPrisma } from "@/lib/db";
import { getCart } from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import { CheckoutForm } from "@/app/checkout/checkout-form";
import { TrustBlocks } from "@/components/checkout/trust-blocks";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const cart = await getCart();
  const products = cart.items.length
    ? await getPrisma().product.findMany({ where: { id: { in: cart.items.map((i) => i.productId) } } })
    : [];
  const byId = new Map(products.map((p) => [p.id, p]));

  const rows = cart.items
    .map((i) => ({ item: i, product: byId.get(i.productId) }))
    .filter((r) => r.product);

  const subtotalCents = rows.reduce((sum, r) => sum + r.product!.priceCents * r.item.qty, 0);

  const session = await auth();
  const userId = session?.user?.id ?? null;
  const userEmail = session?.user?.email ?? null;
  const addresses = userId
    ? await getPrisma().address.findMany({
        where: { userId },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      })
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="dw-h1">Checkout</h1>
          <p className="dw-lead">
            Pay fast with Apple Pay / Google Pay (when available), plus required compliance acknowledgments.
          </p>
        </div>
        <Link className="text-sm underline underline-offset-4 hover:text-foreground" href="/cart">
          ← Back to cart
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="dw-card p-6">
          <div className="text-sm font-medium">Order summary</div>
          <div className="flex flex-col gap-2 pt-3 text-sm">
            {rows.length === 0 ? (
              <div className="text-muted-foreground">Cart is empty.</div>
            ) : (
              rows.map(({ item, product }) => (
                <div key={item.productId} className="flex items-center justify-between gap-3">
                  <div className="text-foreground">
                    {product!.name} <span className="text-muted-foreground">× {item.qty}</span>
                  </div>
                  <div className="text-foreground">{formatMoney(product!.priceCents * item.qty, product!.currency)}</div>
                </div>
              ))
            )}
            <div className="mt-2 border-t border-border/70 pt-3 text-sm">
              <div className="flex items-center justify-between font-semibold">
                <div>Total (pre-tax/shipping)</div>
                <div>{formatMoney(subtotalCents)}</div>
              </div>
              <div className="pt-2 text-xs text-muted-foreground">
                Shipping/tax will be calculated during payment.
              </div>
            </div>
          </div>
        </div>

        <CheckoutForm addresses={addresses} userEmail={userEmail} />
      </div>

      <div className="mt-6">
        <TrustBlocks />
      </div>
    </div>
  );
}

