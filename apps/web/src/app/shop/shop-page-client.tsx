"use client";

import { useState } from "react";
import { ShopFilters } from "@/components/shop/shop-filters";
import { ShopProducts } from "@/components/shop/shop-products";

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

type ShopPageClientProps = {
  products: Product[];
};

export function ShopPageClient({ products }: ShopPageClientProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [inStockOnly, setInStockOnly] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Shop</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Browse available bottles. Inventory shown is on-hand.
          </p>
        </div>
      </div>

      <ShopFilters
        search={search}
        sortBy={sortBy}
        inStockOnly={inStockOnly}
        onSearchChange={setSearch}
        onSortChange={setSortBy}
        onInStockToggle={() => setInStockOnly(!inStockOnly)}
      />

      <ShopProducts
        products={products}
        search={search}
        sortBy={sortBy}
        inStockOnly={inStockOnly}
      />
    </div>
  );
}
