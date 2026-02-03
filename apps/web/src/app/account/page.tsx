import Link from "next/link";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import {
  createAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
  updateAddressAction,
} from "./actions";

export const metadata = {
  title: "Account",
};

export default async function AccountPage() {
  const session = await requireUser();
  const prisma = getPrisma();
  const [addresses, orders] = await Promise.all([
    prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    }),
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: [{ createdAt: "desc" }],
      include: { items: true },
      take: 20,
    }),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="dw-h1">Account</h1>
        <p className="dw-lead mt-2 max-w-2xl">
          Manage your profile, saved addresses, and order history.
        </p>
      </div>

      <section className="dw-card flex flex-col gap-4 p-6">
        <div className="text-sm font-semibold">Profile</div>
        <div className="text-sm text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{session.user.email}</span>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Saved addresses</h2>
        </div>

        {addresses.length === 0 ? (
          <div className="dw-card p-6 text-sm text-muted-foreground">No saved addresses yet.</div>
        ) : (
          <div className="grid gap-4">
            {addresses.map((address) => (
              <div key={address.id} className="dw-card p-5">
                <div className="grid gap-4">
                  <form action={updateAddressAction} className="grid gap-3">
                    <input type="hidden" name="addressId" value={address.id} />
                    <div className="grid gap-2">
                      <Label htmlFor={`name-${address.id}`}>Full name</Label>
                      <Input id={`name-${address.id}`} name="name" defaultValue={address.name} required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`phone-${address.id}`}>Phone</Label>
                      <Input id={`phone-${address.id}`} name="phone" defaultValue={address.phone ?? ""} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`line1-${address.id}`}>Address line 1</Label>
                      <Input id={`line1-${address.id}`} name="line1" defaultValue={address.line1} required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`line2-${address.id}`}>Address line 2</Label>
                      <Input id={`line2-${address.id}`} name="line2" defaultValue={address.line2 ?? ""} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="grid gap-2">
                        <Label htmlFor={`city-${address.id}`}>City</Label>
                        <Input id={`city-${address.id}`} name="city" defaultValue={address.city} required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`state-${address.id}`}>State</Label>
                        <Input id={`state-${address.id}`} name="state" defaultValue={address.state} required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`postal-${address.id}`}>Postal code</Label>
                        <Input id={`postal-${address.id}`} name="postalCode" defaultValue={address.postalCode} required />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button type="submit" size="sm">
                        Save changes
                      </Button>
                      {address.isDefault ? (
                        <span className="text-xs text-muted-foreground">Default</span>
                      ) : null}
                    </div>
                  </form>
                  <div className="flex flex-wrap items-center gap-2">
                    {!address.isDefault ? (
                      <form action={setDefaultAddressAction}>
                        <input type="hidden" name="addressId" value={address.id} />
                        <Button type="submit" size="sm" variant="outline">
                          Set default
                        </Button>
                      </form>
                    ) : null}
                    <form action={deleteAddressAction}>
                      <input type="hidden" name="addressId" value={address.id} />
                      <Button type="submit" size="sm" variant="destructive">
                        Delete
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="dw-card p-5">
          <form action={createAddressAction} className="grid gap-3">
            <div className="text-sm font-semibold">Add a new address</div>
            <div className="grid gap-2">
              <Label htmlFor="new-name">Full name</Label>
              <Input id="new-name" name="name" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-phone">Phone</Label>
              <Input id="new-phone" name="phone" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-line1">Address line 1</Label>
              <Input id="new-line1" name="line1" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-line2">Address line 2</Label>
              <Input id="new-line2" name="line2" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="new-city">City</Label>
                <Input id="new-city" name="city" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-state">State</Label>
                <Input id="new-state" name="state" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-postal">Postal code</Label>
                <Input id="new-postal" name="postalCode" required />
              </div>
            </div>
            <Button type="submit" size="sm">
              Add address
            </Button>
          </form>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Order history</h2>
        {orders.length === 0 ? (
          <div className="dw-card p-6 text-sm text-muted-foreground">No orders yet.</div>
        ) : (
          <div className="dw-card divide-y divide-border/70">
            {orders.map((order) => (
              <div key={order.id} className="p-5 text-sm">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="font-medium">Order {order.id}</div>
                  <div className="text-xs text-muted-foreground">
                    {order.createdAt.toLocaleDateString("en-US")}
                  </div>
                </div>
                <div className="mt-2 text-muted-foreground">
                  Status: <span className="font-medium text-foreground">{order.status}</span>
                </div>
                <div className="mt-1 text-muted-foreground">
                  Total: <span className="font-medium text-foreground">{formatMoney(order.totalCents, order.currency)}</span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {order.items.length} item{order.items.length === 1 ? "" : "s"}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="text-sm text-muted-foreground">
        <Link className="underline underline-offset-4 hover:text-foreground" href="/shop">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}

