"use client";

import { Search, X } from "lucide-react";
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
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            type="search"
            placeholder="Search by name or tasting notes…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9"
            aria-label="Search products"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
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
            <Button variant="ghost" size="sm" onClick={onClearAll}>
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
        <span>
          {resultCount} of {totalCount} bottles
        </span>
        {hasActiveFilters && (
          <span className="text-zinc-500 dark:text-zinc-500">Filters active</span>
        )}
      </div>
    </div>
  );
}
