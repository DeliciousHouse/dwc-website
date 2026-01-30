"use client";

import { ProductCard } from "./product-card";

type Product = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  priceCents: number;
  currency: string;
  inventoryOnHand: number;
  imageUrl: string | null;
  createdAt: Date;
};

type ShopProductsProps = {
  products: Product[];
  inStockOnly: boolean;
  search: string;
};

export function ShopProducts({ products, search, inStockOnly }: ShopProductsProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-white/10 dark:bg-black">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          {search || inStockOnly
            ? "No products match your filters. Try adjusting your search or filters."
            : "No bottles yet — check back soon."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          slug={product.slug}
          name={product.name}
          description={product.description}
          priceCents={product.priceCents}
          currency={product.currency}
          inventoryOnHand={product.inventoryOnHand}
          imageUrl={product.imageUrl}
        />
      ))}
    </div>
  );
}
