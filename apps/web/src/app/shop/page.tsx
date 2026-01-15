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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="dw-h1">Shop</h1>
          <p className="dw-lead">
            Browse available bottles. Inventory shown is on-hand.
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="dw-card p-6 text-sm text-muted-foreground">
          No bottles yet — check back soon.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/shop/${p.slug}`}
              className="group dw-card p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="truncate font-medium group-hover:underline group-hover:underline-offset-4">
                    {p.name}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {formatMoneyFromCents(p.priceCents, p.currency)}
                  </div>
                </div>
                <div
                  className={[
                    "shrink-0 rounded-full px-2 py-0.5 text-xs",
                    p.inventoryOnHand > 0
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"
                      : "bg-muted text-muted-foreground",
                  ].join(" ")}
                >
                  {p.inventoryOnHand > 0 ? `${p.inventoryOnHand} in stock` : "Out of stock"}
                </div>
              </div>

              {p.description ? (
                <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{p.description}</p>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
