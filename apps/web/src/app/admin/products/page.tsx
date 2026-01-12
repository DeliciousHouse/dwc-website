import Link from "next/link";
import { getPrisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { Button } from "@/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { deleteProductAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getPrisma().product.findMany({
    orderBy: [{ updatedAt: "desc" }],
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Products</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Create/edit products and set inventory on-hand.</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">New product</Link>
        </Button>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-2 dark:border-white/10 dark:bg-black">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">On hand</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="p-6 text-center text-sm text-zinc-600 dark:text-zinc-300">
                  No products yet. Create your first one.
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    <Link className="hover:underline hover:underline-offset-4" href={`/admin/products/${p.id}/edit`}>
                      {p.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-zinc-600 dark:text-zinc-300">/{p.slug}</TableCell>
                  <TableCell className="text-right">{formatMoney(p.priceCents, p.currency)}</TableCell>
                  <TableCell className="text-right">{p.inventoryOnHand}</TableCell>
                  <TableCell>{p.isActive ? "Yes" : "No"}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center justify-end gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/shop/${p.slug}`}>View</Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/products/${p.id}/edit`}>Edit</Link>
                      </Button>
                      <form
                        action={async () => {
                          "use server";
                          await deleteProductAction(p.id);
                        }}
                      >
                        <Button size="sm" variant="destructive" type="submit">
                          Delete
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

