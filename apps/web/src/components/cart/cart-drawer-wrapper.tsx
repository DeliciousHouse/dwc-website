import { getCart } from "@/lib/cart";
import { getPrisma } from "@/lib/db";
import { CartDrawerTrigger } from "./cart-drawer-trigger";

export async function CartDrawerWrapper() {
  const cart = await getCart();
  const productIds = cart.items.map((i) => i.productId);
  const products = productIds.length
    ? await getPrisma().product.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true,
          name: true,
          slug: true,
          priceCents: true,
          currency: true,
          imageUrl: true,
          inventoryOnHand: true,
        },
      })
    : [];

  // Get upsell products (products not in cart, in stock, limit 5)
  const upsellProducts = await getPrisma().product.findMany({
    where: {
      isActive: true,
      inventoryOnHand: { gt: 0 },
      id: { notIn: productIds },
    },
    take: 5,
    select: {
      id: true,
      name: true,
      slug: true,
      priceCents: true,
      currency: true,
      imageUrl: true,
      inventoryOnHand: true,
    },
  });

  return (
    <CartDrawerTrigger
      cartItems={cart.items}
      products={products}
      upsellProducts={upsellProducts}
    />
  );
}
