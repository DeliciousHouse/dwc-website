import Link from "next/link";
import { getPrisma } from "@/lib/db";
import { getCart } from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import { Button } from "@/ui/button";
import { clearCartAction, removeFromCartAction, updateCartItemAction } from "@/app/cart/actions";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const cart = await getCart();
  const productIds = cart.items.map((i) => i.productId);

  const products = productIds.length
    ? await getPrisma().product.findMany({ where: { id: { in: productIds } } })
    : [];

  const byId = new Map(products.map((p) => [p.id, p]));
  const rows = cart.items
    .map((i) => ({ item: i, product: byId.get(i.productId) }))
    .filter((r) => r.product);

  const subtotalCents = rows.reduce((sum, r) => sum + (r.product!.priceCents ?? 0) * r.item.qty, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="dw-h1">Cart</h1>
          <p className="dw-lead">Review items before checkout.</p>
        </div>
        <Link className="text-sm underline underline-offset-4 hover:text-foreground" href="/shop">
          Continue shopping
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="dw-card p-6 text-sm text-muted-foreground">
          Your cart is empty.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="dw-card overflow-hidden">
            <div className="hidden grid-cols-12 gap-3 border-b border-border/70 bg-muted/40 px-4 py-3 text-xs font-medium text-muted-foreground md:grid">
              <div className="col-span-5">Item</div>
              <div className="col-span-2">Price</div>
              <div className="col-span-3">Qty</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            <div className="divide-y divide-border/60">
              {rows.map(({ item, product }) => (
                <div
                  key={item.productId}
                  className="flex flex-col gap-3 px-4 py-4 text-sm md:grid md:grid-cols-12 md:items-center"
                >
                  <div className="md:col-span-5">
                    <div className="text-xs text-muted-foreground md:hidden">Item</div>
                    <div className="font-medium">{product!.name}</div>
                    <div className="text-xs text-muted-foreground">/{product!.slug}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-xs text-muted-foreground md:hidden">Price</div>
                    {formatMoney(product!.priceCents, product!.currency)}
                  </div>
                  <div className="md:col-span-3">
                    <div className="text-xs text-muted-foreground md:hidden">Quantity</div>
                    <form action={updateCartItemAction} className="flex items-center gap-2">
                      <input type="hidden" name="productId" value={item.productId} />
                      <input
                        name="qty"
                        type="number"
                        min={0}
                        defaultValue={item.qty}
                        className="h-9 w-24 rounded-md border border-border bg-background px-3 text-sm"
                      />
                      <Button type="submit" variant="secondary">
                        Update
                      </Button>
                    </form>
                  </div>
                  <div className="md:col-span-2 md:flex md:justify-end">
                    <div className="text-xs text-muted-foreground md:hidden">Actions</div>
                    <form action={removeFromCartAction}>
                      <input type="hidden" name="productId" value={item.productId} />
                      <button className="text-sm underline underline-offset-4 hover:text-foreground">Remove</button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dw-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              <div className="text-muted-foreground">Subtotal</div>
              <div className="font-semibold">{formatMoney(subtotalCents)}</div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <form action={clearCartAction}>
                <Button type="submit" variant="secondary">
                  Clear cart
                </Button>
              </form>
              <Button asChild>
                <Link href="/checkout">Checkout</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

