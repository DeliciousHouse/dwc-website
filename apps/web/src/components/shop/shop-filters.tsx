"use client";

import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";

type ShopFiltersProps = {
  search: string;
  sortBy: string;
  inStockOnly: boolean;
  totalCount: number;
  resultCount: number;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onInStockToggle: () => void;
  onClearAll: () => void;
};

export function ShopFilters({
  search,
  sortBy,
  inStockOnly,
  totalCount,
  resultCount,
  hasActiveFilters,
  onSearchChange,
  onSortChange,
  onInStockToggle,
  onClearAll,
}: ShopFiltersProps) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 sm:max-w-md">
          <Input
            type="search"
            placeholder="Search by name or notes"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search products"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Button
            variant={inStockOnly ? "default" : "outline"}
            size="sm"
            onClick={onInStockToggle}
          >
            In stock
          </Button>

          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="price-low">Price: Low → High</SelectItem>
              <SelectItem value="price-high">Price: High → Low</SelectItem>
              <SelectItem value="name-asc">Name: A → Z</SelectItem>
              <SelectItem value="name-desc">Name: Z → A</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearAll} className="text-muted-foreground">
              Clear filters
            </Button>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {resultCount} of {totalCount} selections
        </span>
        {hasActiveFilters && <span>Filters active</span>}
      </div>
    </div>
  );
}
