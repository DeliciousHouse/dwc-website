"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Drawer, DrawerTrigger } from "@/ui/drawer";
import { CartDrawer } from "./cart-drawer";

type CartDrawerTriggerProps = {
  cartItems: Array<{ productId: string; qty: number }>;
  products: Array<{
    id: string;
    name: string;
    slug: string;
    priceCents: number;
    currency: string;
    imageUrl: string | null;
    inventoryOnHand: number;
  }>;
  upsellProducts: Array<{
    id: string;
    name: string;
    slug: string;
    priceCents: number;
    currency: string;
    imageUrl: string | null;
    inventoryOnHand: number;
  }>;
};

export function CartDrawerTrigger({
  cartItems,
  products,
  upsellProducts,
}: CartDrawerTriggerProps) {
  const [open, setOpen] = useState(false);
  const itemCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Cart"
        >
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-950 text-xs font-medium text-white dark:bg-white dark:text-black">
              {itemCount}
            </span>
          )}
        </button>
      </DrawerTrigger>
      <CartDrawer
        onOpenChange={setOpen}
        cartItems={cartItems}
        products={products}
        upsellProducts={upsellProducts}
      />
    </Drawer>
  );
}
