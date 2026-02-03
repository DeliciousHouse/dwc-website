import Link from "next/link";
import { notFound } from "next/navigation";
import { getPrisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getPrisma().order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });

  if (!order) notFound();

  const address = order.shippingAddressSnapshot as {
    name?: string;
    phone?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  } | null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Order {order.id}</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">{order.email}</p>
        </div>
        <Link className="text-sm underline underline-offset-4 hover:text-foreground" href="/admin/orders">
          Back to orders
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 text-sm dark:border-white/10 dark:bg-black">
          <div className="text-sm font-semibold">Payment</div>
          <div className="mt-2 text-zinc-600 dark:text-zinc-300">
            Status: <span className="font-medium text-foreground">{order.status}</span>
          </div>
          <div className="text-zinc-600 dark:text-zinc-300">
            Total: <span className="font-medium text-foreground">{formatMoney(order.totalCents, order.currency)}</span>
          </div>
          <div className="text-zinc-600 dark:text-zinc-300">
            Payment intent:{" "}
            <span className="font-medium text-foreground">{order.stripePaymentIntentId ?? "n/a"}</span>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5 text-sm dark:border-white/10 dark:bg-black">
          <div className="text-sm font-semibold">Shipping address</div>
          {address ? (
            <div className="mt-2 text-zinc-600 dark:text-zinc-300">
              <div className="font-medium text-foreground">{address.name ?? "Recipient"}</div>
              {address.phone ? <div>{address.phone}</div> : null}
              <div>{address.line1}</div>
              {address.line2 ? <div>{address.line2}</div> : null}
              <div>
                {address.city}, {address.state} {address.postalCode}
              </div>
              <div>{address.country ?? "US"}</div>
            </div>
          ) : (
            <div className="mt-2 text-zinc-600 dark:text-zinc-300">No address on file.</div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-5 text-sm dark:border-white/10 dark:bg-black">
        <div className="text-sm font-semibold">Line items</div>
        <div className="mt-3 divide-y divide-zinc-200 dark:divide-white/10">
          {order.items.length === 0 ? (
            <div className="py-4 text-zinc-600 dark:text-zinc-300">No line items.</div>
          ) : (
            order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium">{item.nameSnapshot}</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-300">
                    Qty {item.qty} · {formatMoney(item.unitPriceCents, order.currency)}
                  </div>
                </div>
                <div className="font-medium">{formatMoney(item.lineTotalCents, order.currency)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
