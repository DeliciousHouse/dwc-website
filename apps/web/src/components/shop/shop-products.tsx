"use client";

import { useMemo } from "react";
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
  search: string;
  sortBy: string;
  inStockOnly: boolean;
};

export function ShopProducts({ products, search, sortBy, inStockOnly }: ShopProductsProps) {
  const filteredAndSorted = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower)
      );
    }

    // In stock filter
    if (inStockOnly) {
      filtered = filtered.filter((p) => p.inventoryOnHand > 0);
    }

    // Sort
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case "price-low":
        filtered.sort((a, b) => a.priceCents - b.priceCents);
        break;
      case "price-high":
        filtered.sort((a, b) => b.priceCents - a.priceCents);
        break;
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    return filtered;
  }, [products, search, sortBy, inStockOnly]);

  if (filteredAndSorted.length === 0) {
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
      {filteredAndSorted.map((product) => (
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
