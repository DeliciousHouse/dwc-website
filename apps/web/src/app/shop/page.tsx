import Link from "next/link";
import { getPrisma } from "@/lib/db";
import { formatMoneyFromCents } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await getPrisma().product.findMany({
    where: { isActive: true },
    orderBy: [{ createdAt: "desc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Shop</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Browse available bottles. Inventory shown is on-hand.
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-white/10 dark:bg-black dark:text-zinc-300">
          No bottles yet — check back soon.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/shop/${p.slug}`}
              className="group rounded-lg border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 dark:border-white/10 dark:bg-black dark:hover:border-white/20"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="truncate font-medium group-hover:underline group-hover:underline-offset-4">
                    {p.name}
                  </div>
                  <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                    {formatMoneyFromCents(p.priceCents, p.currency)}
                  </div>
                </div>
                <div
                  className={[
                    "shrink-0 rounded-full px-2 py-0.5 text-xs",
                    p.inventoryOnHand > 0
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"
                      : "bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-zinc-200",
                  ].join(" ")}
                >
                  {p.inventoryOnHand > 0 ? `${p.inventoryOnHand} in stock` : "Out of stock"}
                </div>
              </div>

              {p.description ? (
                <p className="mt-3 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-300">{p.description}</p>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
