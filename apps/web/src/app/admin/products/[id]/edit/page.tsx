import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Button } from "@/ui/button";
import { ProductForm } from "../../product-form";
import { updateProductAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
  });

  if (!product) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Edit product</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Update details and inventory on-hand.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/shop/${product.slug}`}>View in shop</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/products">Back</Link>
          </Button>
        </div>
      </div>

      <ProductForm
        title={product.name}
        action={async (formData) => {
          "use server";
          await updateProductAction(product.id, formData);
        }}
        submitLabel="Save changes"
        slugRequired={true}
        defaults={{
          name: product.name,
          slug: product.slug,
          description: product.description,
          priceCents: product.priceCents,
          currency: product.currency,
          imageUrl: product.imageUrl,
          inventoryOnHand: product.inventoryOnHand,
          isActive: product.isActive,
        }}
      />
    </div>
  );
}

