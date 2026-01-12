"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, ShoppingBag, Plus, Minus, Trash2 } from "lucide-react";
import {
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/ui/drawer";
import { Button } from "@/ui/button";
import { formatMoney } from "@/lib/money";
import { updateCartItemAction, removeFromCartAction } from "@/app/cart/actions";
import { useRouter } from "next/navigation";

type CartItem = {
  productId: string;
  qty: number;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  currency: string;
  imageUrl: string | null;
  inventoryOnHand: number;
};

type CartDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartItems: CartItem[];
  products: Product[];
  upsellProducts: Product[];
};

export function CartDrawer({
  open,
  onOpenChange,
  cartItems,
  products,
  upsellProducts,
}: CartDrawerProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const byId = new Map(products.map((p) => [p.id, p]));
  const rows = cartItems
    .map((item) => ({ item, product: byId.get(item.productId) }))
    .filter((r) => r.product);

  const subtotalCents = rows.reduce(
    (sum, r) => sum + (r.product!.priceCents ?? 0) * r.item.qty,
    0
  );

  // Filter out products already in cart for upsell
  const cartProductIds = new Set(cartItems.map((i) => i.productId));
  const availableUpsells = upsellProducts.filter(
    (p) => !cartProductIds.has(p.id) && p.inventoryOnHand > 0
  );

  async function handleUpdateQty(productId: string, newQty: number) {
    setIsUpdating(productId);
    const formData = new FormData();
    formData.append("productId", productId);
    formData.append("qty", String(newQty));
    await updateCartItemAction(formData);
    setIsUpdating(null);
    router.refresh();
  }

  async function handleRemove(productId: string) {
    setIsUpdating(productId);
    const formData = new FormData();
    formData.append("productId", productId);
    await removeFromCartAction(formData);
    setIsUpdating(null);
    router.refresh();
  }

  return (
    <DrawerContent className="max-h-[85vh]" data-vaul-drawer-direction="right">
      <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-xl font-semibold">Shopping Cart</DrawerTitle>
            <DrawerClose asChild>
              <button
                className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </DrawerClose>
          </div>
      </DrawerHeader>

      <div className="flex-1 overflow-y-auto">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <ShoppingBag className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-4" />
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                Your cart is empty
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                Add items to get started
              </p>
              <Button onClick={() => onOpenChange(false)} asChild>
                <Link href="/shop">Continue Shopping</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="divide-y divide-zinc-200 dark:divide-white/10">
                {rows.map(({ item, product }) => (
                  <div
                    key={item.productId}
                    className="flex gap-4 p-4"
                  >
                    <Link
                      href={`/shop/${product!.slug}`}
                      onClick={() => onOpenChange(false)}
                      className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800"
                    >
                      {product!.imageUrl ? (
                        <Image
                          src={product!.imageUrl}
                          alt={product!.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl">
                          🍷
                        </div>
                      )}
                    </Link>
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link
                            href={`/shop/${product!.slug}`}
                            onClick={() => onOpenChange(false)}
                            className="font-medium hover:underline"
                          >
                            {product!.name}
                          </Link>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {formatMoney(product!.priceCents, product!.currency)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemove(item.productId)}
                          disabled={isUpdating === item.productId}
                          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQty(item.productId, Math.max(0, item.qty - 1))}
                          disabled={isUpdating === item.productId || item.qty <= 1}
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-50 dark:border-white/10 dark:bg-black dark:hover:bg-zinc-900"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-[2rem] text-center text-sm font-medium">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => handleUpdateQty(item.productId, item.qty + 1)}
                          disabled={isUpdating === item.productId || product!.inventoryOnHand <= item.qty}
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-50 dark:border-white/10 dark:bg-black dark:hover:bg-zinc-900"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {availableUpsells.length > 0 && (
                <div className="border-t border-zinc-200 bg-zinc-50/50 p-4 dark:border-white/10 dark:bg-zinc-900/20">
                  <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    You might also like
                  </h3>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {availableUpsells.slice(0, 3).map((product) => (
                      <UpsellItem
                        key={product.id}
                        product={product}
                        onAdd={() => router.refresh()}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
      </div>

      {rows.length > 0 && (
        <DrawerFooter className="border-t">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Subtotal
              </span>
              <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {formatMoney(subtotalCents)}
              </span>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                asChild
              >
                <Link href="/shop">Continue Shopping</Link>
              </Button>
              <Button
                className="flex-1"
                onClick={() => onOpenChange(false)}
                asChild
              >
                <Link href="/checkout">Checkout</Link>
              </Button>
            </div>
          <p className="text-xs text-center text-zinc-500 dark:text-zinc-400 mt-2">
            Shipping and taxes calculated at checkout
          </p>
        </DrawerFooter>
      )}
    </DrawerContent>
  );
}

function UpsellItem({ product, onAdd }: { product: Product; onAdd: () => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();

  async function handleAdd() {
    setIsAdding(true);
    const formData = new FormData();
    formData.append("productId", product.id);
    formData.append("qty", "1");
    const { addToCartAction } = await import("@/app/shop/actions");
    await addToCartAction(formData);
    setIsAdding(false);
    onAdd();
    router.refresh();
  }

  return (
    <div className="flex min-w-[140px] flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-3 dark:border-white/10 dark:bg-black">
      <Link
        href={`/shop/${product.slug}`}
        className="relative aspect-square w-full overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800"
      >
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="140px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl">
            🍷
          </div>
        )}
      </Link>
      <div className="flex flex-col gap-1">
        <Link
          href={`/shop/${product.slug}`}
          className="line-clamp-2 text-xs font-medium hover:underline"
        >
          {product.name}
        </Link>
        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
          {formatMoney(product.priceCents, product.currency)}
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="w-full text-xs"
        onClick={handleAdd}
        disabled={isAdding}
      >
        {isAdding ? "Adding..." : "Add"}
      </Button>
    </div>
  );
}
