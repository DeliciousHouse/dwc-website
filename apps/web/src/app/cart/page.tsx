import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCart } from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import { Button } from "@/ui/button";
import { clearCartAction, removeFromCartAction, updateCartItemAction } from "@/app/cart/actions";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const cart = await getCart();
  const productIds = cart.items.map((i) => i.productId);

  const products = productIds.length
    ? await prisma.product.findMany({ where: { id: { in: productIds } } })
    : [];

  const byId = new Map(products.map((p) => [p.id, p]));
  const rows = cart.items
    .map((i) => ({ item: i, product: byId.get(i.productId) }))
    .filter((r) => r.product);

  const subtotalCents = rows.reduce((sum, r) => sum + (r.product!.priceCents ?? 0) * r.item.qty, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cart</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Review items before checkout.</p>
        </div>
        <Link className="text-sm underline underline-offset-4" href="/shop">
          Continue shopping
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-700 dark:border-white/10 dark:bg-black dark:text-zinc-300">
          Your cart is empty.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-white/10 dark:bg-black">
            <div className="grid grid-cols-12 gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-medium text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
              <div className="col-span-5">Item</div>
              <div className="col-span-2">Price</div>
              <div className="col-span-3">Qty</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            <div className="divide-y divide-zinc-200 dark:divide-white/10">
              {rows.map(({ item, product }) => (
                <div key={item.productId} className="grid grid-cols-12 items-center gap-3 px-4 py-3 text-sm">
                  <div className="col-span-5">
                    <div className="font-medium">{product!.name}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">/{product!.slug}</div>
                  </div>
                  <div className="col-span-2">{formatMoney(product!.priceCents, product!.currency)}</div>
                  <div className="col-span-3">
                    <form action={updateCartItemAction} className="flex items-center gap-2">
                      <input type="hidden" name="productId" value={item.productId} />
                      <input
                        name="qty"
                        type="number"
                        min={0}
                        defaultValue={item.qty}
                        className="h-9 w-24 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-black"
                      />
                      <Button type="submit" variant="secondary">
                        Update
                      </Button>
                    </form>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <form action={removeFromCartAction}>
                      <input type="hidden" name="productId" value={item.productId} />
                      <button className="text-sm underline underline-offset-4">Remove</button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-black">
            <div className="text-sm">
              <div className="text-zinc-500 dark:text-zinc-400">Subtotal</div>
              <div className="font-semibold">{formatMoney(subtotalCents)}</div>
            </div>
            <div className="flex items-center gap-3">
              <form action={clearCartAction}>
                <Button type="submit" variant="secondary">
                  Clear cart
                </Button>
              </form>
              <Link
                className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                href="/checkout"
              >
                Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

