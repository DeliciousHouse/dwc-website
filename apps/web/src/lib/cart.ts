import { cookies } from "next/headers";

export type CartItem = { productId: string; qty: number };
export type Cart = { items: CartItem[] };

const CART_COOKIE = "dw_cart";

function safeParse(json: string | undefined): Cart | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const items = (parsed as any).items;
    if (!Array.isArray(items)) return { items: [] };
    const normalized: CartItem[] = items
      .filter((i) => i && typeof i === "object")
      .map((i) => ({ productId: String((i as any).productId), qty: Number((i as any).qty) }))
      .filter((i) => i.productId && Number.isFinite(i.qty) && i.qty > 0);
    return { items: normalized };
  } catch {
    return null;
  }
}

export async function getCart(): Promise<Cart> {
  const store = await cookies();
  const raw = store.get(CART_COOKIE)?.value;
  return safeParse(raw) ?? { items: [] };
}

export async function setCart(cart: Cart) {
  const store = await cookies();
  store.set(CART_COOKIE, JSON.stringify(cart), {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 14, // 14 days
  });
}

export async function clearCart() {
  const store = await cookies();
  store.delete(CART_COOKIE);
}

export async function addToCart(productId: string, qty: number) {
  const cart = await getCart();
  const safeQty = Math.max(1, Math.floor(qty));

  const existing = cart.items.find((i) => i.productId === productId);
  if (existing) existing.qty += safeQty;
  else cart.items.push({ productId, qty: safeQty });

  await setCart(cart);
}

export async function updateCartItem(productId: string, qty: number) {
  const cart = await getCart();
  const safeQty = Math.max(0, Math.floor(qty));
  cart.items = cart.items
    .map((i) => (i.productId === productId ? { ...i, qty: safeQty } : i))
    .filter((i) => i.qty > 0);
  await setCart(cart);
}

export async function removeFromCart(productId: string) {
  const cart = await getCart();
  cart.items = cart.items.filter((i) => i.productId !== productId);
  await setCart(cart);
}

