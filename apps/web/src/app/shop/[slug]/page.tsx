import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { Button } from "@/ui/button";
import { addToCartAction } from "@/app/shop/actions";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
  });

  if (!product || !product.isActive) return notFound();

  const canAdd = product.inventoryOnHand > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Link className="text-sm text-zinc-600 hover:underline dark:text-zinc-300" href="/shop">
          ← Back to shop
        </Link>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-black">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
          <div className="text-sm text-zinc-600 dark:text-zinc-300">
            {formatMoney(product.priceCents, product.currency)}
          </div>
          {product.description ? (
            <p className="pt-2 text-sm text-zinc-700 dark:text-zinc-200">{product.description}</p>
          ) : null}
          <div className="pt-3 text-xs text-zinc-500 dark:text-zinc-400">
            {product.inventoryOnHand > 0 ? `${product.inventoryOnHand} in stock` : "Out of stock"}
          </div>
        </div>

        <div className="pt-6">
          <form action={addToCartAction} className="flex items-center gap-3">
            <input type="hidden" name="productId" value={product.id} />
            <input
              name="qty"
              type="number"
              min={1}
              defaultValue={1}
              className="h-9 w-20 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-black"
              disabled={!canAdd}
            />
            <Button type="submit" disabled={!canAdd}>
              Add to cart
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

