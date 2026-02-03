import Link from "next/link";

import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Admin tools for catalog, orders, and inventory.
            </p>
          </div>
          <nav className="flex items-center gap-3 text-sm">
            <Link className="text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white" href="/admin/products">
              Products
            </Link>
            <Link className="text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white" href="/admin/orders">
              Orders
            </Link>
            <Link className="text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white" href="/admin/inventory">
              Inventory
            </Link>
          </nav>
        </div>
      </div>
      {children}
    </div>
  );
}

