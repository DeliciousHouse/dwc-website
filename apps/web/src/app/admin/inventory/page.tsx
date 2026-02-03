import { getPrisma } from "@/lib/db";
import { adjustInventoryAction } from "./actions";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const prisma = getPrisma();
  const [products, adjustments] = await Promise.all([
    prisma.product.findMany({ orderBy: [{ name: "asc" }] }),
    prisma.inventoryAdjustment.findMany({
      orderBy: [{ createdAt: "desc" }],
      take: 25,
      include: { product: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Inventory adjustments</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Add or remove inventory with a reason.</p>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-black">
        <form action={adjustInventoryAction} className="grid gap-3 sm:grid-cols-4">
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="productId">Product</Label>
            <select
              id="productId"
              name="productId"
              required
              className="border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm text-foreground shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} (on hand: {product.inventoryOnHand})
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="delta">Delta</Label>
            <Input id="delta" name="delta" type="number" required placeholder="e.g. 6 or -2" />
          </div>
          <div className="grid gap-2 sm:col-span-4">
            <Label htmlFor="note">Reason</Label>
            <Input id="note" name="note" placeholder="Damaged case, restock, correction..." />
          </div>
          <div className="sm:col-span-4">
            <Button type="submit">Apply adjustment</Button>
          </div>
        </form>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-black">
        <div className="text-sm font-semibold">Recent adjustments</div>
        <div className="mt-4 divide-y divide-zinc-200 dark:divide-white/10">
          {adjustments.length === 0 ? (
            <div className="py-6 text-sm text-zinc-600 dark:text-zinc-300">No adjustments yet.</div>
          ) : (
            adjustments.map((adj) => (
              <div key={adj.id} className="py-3 text-sm">
                <div className="font-medium">{adj.product.name}</div>
                <div className="text-zinc-600 dark:text-zinc-300">
                  Delta: {adj.delta} · {adj.note ?? "No note"} · {adj.createdAt.toLocaleString("en-US")}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
