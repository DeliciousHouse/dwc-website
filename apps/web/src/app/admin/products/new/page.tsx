import Link from "next/link";
import { Button } from "@/ui/button";
import { createProductAction } from "../actions";
import { ProductForm } from "../product-form";

export default function NewProductPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">New product</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Create a new product in the catalog.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/products">Back</Link>
        </Button>
      </div>

      <ProductForm
        title="Product details"
        description="Tip: you can leave slug blank and it will auto-generate from the name."
        action={createProductAction}
        submitLabel="Create product"
        slugRequired={false}
        defaults={{
          currency: "USD",
          isActive: true,
          priceCents: 0,
          inventoryOnHand: 0,
        }}
      />
    </div>
  );
}

