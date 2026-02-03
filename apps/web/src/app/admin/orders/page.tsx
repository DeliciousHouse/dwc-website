import { getPrisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { updateOrderStatusAction } from "./actions";
import { Button } from "@/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_OPTIONS = ["pending", "paid", "fulfilled", "cancelled", "refunded"] as const;

export default async function AdminOrdersPage() {
  const orders = await getPrisma().order.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: { items: true },
    take: 50,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Orders</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Review and manage recent orders.</p>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-2 dark:border-white/10 dark:bg-black">
        {orders.length === 0 ? (
          <div className="p-6 text-center text-sm text-zinc-600 dark:text-zinc-300">No orders yet.</div>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-white/10">
            {orders.map((order) => (
              <div key={order.id} className="p-4 text-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-medium">
                      <Link className="hover:underline" href={`/admin/orders/${order.id}`}>
                        Order {order.id}
                      </Link>
                    </div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-300">
                      {order.email} · {order.createdAt.toLocaleString("en-US")}
                    </div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-300">
                      {order.items.length} item{order.items.length === 1 ? "" : "s"} ·{" "}
                      {formatMoney(order.totalCents, order.currency)}
                    </div>
                  </div>
                  <form action={updateOrderStatusAction} className="flex items-center gap-2">
                    <input type="hidden" name="orderId" value={order.id} />
                    <select
                      name="status"
                      defaultValue={order.status}
                      className="border-input h-9 rounded-md border bg-transparent px-3 text-sm text-foreground shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <Button type="submit" size="sm" variant="outline">
                      Update
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
