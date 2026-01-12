"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ShoppingCart, Plus } from "lucide-react";
import { formatMoneyFromCents } from "@/lib/money";
import { Button } from "@/ui/button";
import { addToCartAction } from "@/app/shop/actions";
import { useRouter } from "next/navigation";

type ProductCardProps = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  priceCents: number;
  currency: string;
  inventoryOnHand: number;
  imageUrl: string | null;
};

export function ProductCard({
  id,
  slug,
  name,
  description,
  priceCents,
  currency,
  inventoryOnHand,
  imageUrl,
}: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();
  const canAdd = inventoryOnHand > 0;

  async function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!canAdd || isAdding) return;
    setIsAdding(true);
    const formData = new FormData();
    formData.append("productId", id);
    formData.append("qty", "1");
    await addToCartAction(formData);
    setIsAdding(false);
    router.refresh();
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white transition-all hover:border-zinc-300 hover:shadow-lg dark:border-white/10 dark:bg-black dark:hover:border-white/20">
      <Link href={`/shop/${slug}`} className="flex flex-col flex-1">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-400 dark:text-zinc-600">
              <div className="text-center">
                <div className="text-4xl mb-2">🍷</div>
                <div className="text-xs">No image</div>
              </div>
            </div>
          )}
          {!canAdd && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-zinc-900">
                Out of Stock
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 font-semibold leading-tight group-hover:underline group-hover:underline-offset-4">
              {name}
            </h3>
            <div
              className={[
                "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                canAdd
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"
                  : "bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-zinc-200",
              ].join(" ")}
            >
              {canAdd ? `${inventoryOnHand} in stock` : "Out of stock"}
            </div>
          </div>
          <div className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {formatMoneyFromCents(priceCents, currency)}
          </div>
          {description && (
            <p className="line-clamp-2 flex-1 text-sm text-zinc-600 dark:text-zinc-300">{description}</p>
          )}
        </div>
      </Link>
      <div className="px-4 pb-4">
        <Button
          onClick={handleQuickAdd}
          disabled={!canAdd || isAdding}
          className="w-full"
          size="sm"
          variant={canAdd ? "default" : "secondary"}
        >
          {isAdding ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Adding...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Quick Add
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
