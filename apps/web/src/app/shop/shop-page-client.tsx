"use client";

import { useMemo, useState } from "react";
import { AdSlot } from "@/components/ad-slot";
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

  const hasActiveFilters = Boolean(search.trim()) || inStockOnly || sortBy !== "newest";

  function clearAll() {
    setSearch("");
    setSortBy("newest");
    setInStockOnly(false);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="dw-h1">Selections</h1>
          <p className="dw-lead">
            A short list of bottles with clear context. Availability is noted below.
          </p>
        </div>
      </div>

      <ShopFilters
        search={search}
        sortBy={sortBy}
        inStockOnly={inStockOnly}
        totalCount={products.length}
        resultCount={filteredAndSorted.length}
        hasActiveFilters={hasActiveFilters}
        onSearchChange={setSearch}
        onSortChange={setSortBy}
        onInStockToggle={() => setInStockOnly(!inStockOnly)}
        onClearAll={clearAll}
      />

      <ShopProducts
        products={filteredAndSorted}
        search={search}
        inStockOnly={inStockOnly}
      />

      <AdSlot
        slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SHOP}
        minHeightClassName="min-h-[180px]"
        label="Shop advertisement"
      />
    </div>
  );
}
