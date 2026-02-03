"use client";

import Link from "next/link";
import { useState } from "react";
import { formatMoneyFromCents } from "@/lib/money";
import { Button } from "@/ui/button";
import { addToCartAction } from "@/app/shop/actions";
import { useRouter } from "next/navigation";
import { AppImage } from "@/components/site-image";

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
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card">
      <Link href={`/shop/${slug}`} className="flex flex-col flex-1">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
          {imageUrl ? (
            <AppImage
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="text-xs">Image pending</div>
              </div>
            </div>
          )}

          {!canAdd && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <span className="text-xs font-medium text-foreground">Out of stock</span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 font-semibold leading-tight">
              {name}
            </h3>
            <div className="shrink-0 text-xs text-muted-foreground">
              {canAdd ? `${inventoryOnHand} available` : "Unavailable"}
            </div>
          </div>
          <div className="mb-2 text-lg font-semibold text-foreground">
            {formatMoneyFromCents(priceCents, currency)}
          </div>
          {description && (
            <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">{description}</p>
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
            "Add to cart"
          )}
        </Button>
      </div>
    </div>
  );
}
