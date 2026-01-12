import { getPrisma } from "@/lib/db";
import { ShopPageClient } from "./shop-page-client";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await getPrisma().product.findMany({
    where: { isActive: true },
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      priceCents: true,
      currency: true,
      inventoryOnHand: true,
      imageUrl: true,
      createdAt: true,
    },
  });

  return <ShopPageClient products={products} />;
}
