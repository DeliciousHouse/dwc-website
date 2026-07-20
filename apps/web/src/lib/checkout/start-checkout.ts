import type { Cart } from "@/lib/cart";
import type { PaymentAdapter } from "@/lib/payments/payment-adapter";

export type CheckoutSubmission = {
  email: string;
  shippingName: string;
  shippingPhone: string;
  shippingLine1: string;
  shippingLine2: string;
  shippingCity: string;
  shippingState: string;
  shippingPostal: string;
  ageAffirmed: boolean;
  adultSignatureDisclosure: boolean;
};

export type CheckoutProduct = {
  id: string;
  name: string;
  priceCents: number;
  currency: string;
  inventoryOnHand: number;
  isActive: boolean;
};

export type CreateOrderInput = {
  email: string;
  userId: string | null;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
  shippingState: string;
  shippingAddressSnapshot: {
    name: string;
    phone: string | null;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: "US";
  };
  ageAffirmedAt: Date;
  items: Array<{
    productId: string;
    nameSnapshot: string;
    unitPriceCents: number;
    qty: number;
    lineTotalCents: number;
  }>;
};

export type CheckoutServiceDependencies = {
  getUserId(): Promise<string | null>;
  getCart(): Promise<Cart>;
  isStateAllowed(state: string): Promise<{ allowed: boolean; reason?: string }>;
  findProducts(ids: string[]): Promise<CheckoutProduct[]>;
  reconcileExpiredOrders(adapter: PaymentAdapter): Promise<void>;
  createOrder(input: CreateOrderInput): Promise<{ id: string }>;
  attachPayment(input: {
    orderId: string;
    provider: string;
    providerLinkId: string;
    providerOrderId: string;
  }): Promise<void>;
  cancelOrder(orderId: string): Promise<void>;
  writeAuditLog(input: {
    action: string;
    entityType: string;
    entityId: string;
    data: Record<string, unknown>;
  }): Promise<void>;
};

export type StartCheckoutResult =
  | { ok: true; orderId: string; paymentUrl: string }
  | { ok: false; error: string };

export type StartCheckout = (input: {
  adapter: PaymentAdapter;
  checkout: CheckoutSubmission;
  returnBaseUrl: string;
}) => Promise<StartCheckoutResult>;

function optional(value: string) {
  const result = value.trim();
  return result || null;
}

function validateCheckout(checkout: CheckoutSubmission): string | null {
  if (!checkout.email.trim().includes("@")) return "Please enter a valid email.";
  if (!checkout.shippingName.trim()) return "Please enter the recipient name.";
  if (!checkout.shippingLine1.trim()) return "Please enter a shipping address.";
  if (!checkout.shippingCity.trim()) return "Please enter a shipping city.";
  if (checkout.shippingState.trim().length !== 2) return "Please select a shipping state.";
  if (!checkout.shippingPostal.trim()) return "Please enter a postal code.";
  if (!checkout.ageAffirmed) return "You must affirm you are 21+ to continue.";
  if (!checkout.adultSignatureDisclosure) {
    return "You must acknowledge the adult signature requirement.";
  }
  return null;
}

export function createCheckoutService(deps: CheckoutServiceDependencies): StartCheckout {
  return async ({ adapter, checkout, returnBaseUrl }) => {
    const validationError = validateCheckout(checkout);
    if (validationError) return { ok: false, error: validationError };

    try {
      await deps.reconcileExpiredOrders(adapter);
    } catch {
      // Keep checkout fail-soft; guarded stock claims still prevent overselling.
    }

    const shippingState = checkout.shippingState.trim().toUpperCase();
    const cart = await deps.getCart();
    if (cart.items.length === 0) return { ok: false, error: "Your cart is empty." };
    if (cart.items.some((item) => !Number.isSafeInteger(item.qty) || item.qty <= 0)) {
      return { ok: false, error: "Your cart contains an invalid quantity." };
    }

    const eligibility = await deps.isStateAllowed(shippingState);
    if (!eligibility.allowed) {
      return {
        ok: false,
        error: eligibility.reason
          ? `Shipping blocked: ${eligibility.reason}`
          : "Shipping is not allowed for that state.",
      };
    }

    const products = await deps.findProducts(cart.items.map((item) => item.productId));
    const productsById = new Map(products.map((product) => [product.id, product]));
    let subtotalCents = 0;

    for (const item of cart.items) {
      const product = productsById.get(item.productId);
      if (!product?.isActive) {
        return { ok: false, error: "One or more items are no longer available." };
      }
      if (product.inventoryOnHand < item.qty) {
        return { ok: false, error: `Insufficient stock: ${product.name}` };
      }
      if (product.currency.toUpperCase() !== "USD") {
        return { ok: false, error: "Only USD checkout is supported." };
      }
      subtotalCents += product.priceCents * item.qty;
    }

    if (subtotalCents <= 0) return { ok: false, error: "Your cart total is invalid." };

    const shippingCents = 0;
    const taxCents = 0;
    const totalCents = subtotalCents + shippingCents + taxCents;
    const userId = await deps.getUserId();
    let orderId: string | null = null;
    let providerLinkId: string | null = null;

    try {
      const order = await deps.createOrder({
        email: checkout.email.trim(),
        userId,
        subtotalCents,
        shippingCents,
        taxCents,
        totalCents,
        currency: "USD",
        shippingState,
        shippingAddressSnapshot: {
          name: checkout.shippingName.trim(),
          phone: optional(checkout.shippingPhone),
          line1: checkout.shippingLine1.trim(),
          line2: optional(checkout.shippingLine2),
          city: checkout.shippingCity.trim(),
          state: shippingState,
          postalCode: checkout.shippingPostal.trim(),
          country: "US",
        },
        ageAffirmedAt: new Date(),
        items: cart.items.map((item) => {
          const product = productsById.get(item.productId)!;
          return {
            productId: product.id,
            nameSnapshot: product.name,
            unitPriceCents: product.priceCents,
            qty: item.qty,
            lineTotalCents: product.priceCents * item.qty,
          };
        }),
      });
      orderId = order.id;

      const paymentLink = await adapter.createPaymentLink({
        idempotencyKey: orderId,
        referenceId: orderId,
        redirectUrl: `${returnBaseUrl.replace(/\/$/, "")}/api/checkout/return?orderId=${encodeURIComponent(orderId)}`,
        lineItems: cart.items.map((item) => {
          const product = productsById.get(item.productId)!;
          return {
            name: product.name,
            quantity: item.qty,
            unitAmountCents: product.priceCents,
            currency: product.currency,
          };
        }),
      });
      providerLinkId = paymentLink.providerLinkId;

      await deps.attachPayment({
        orderId,
        provider: adapter.provider,
        providerLinkId: paymentLink.providerLinkId,
        providerOrderId: paymentLink.providerOrderId,
      });
      await deps.writeAuditLog({
        action: "checkout_order_created",
        entityType: "order",
        entityId: orderId,
        data: { provider: adapter.provider, shippingState, totalCents },
      });

      return { ok: true, orderId, paymentUrl: paymentLink.paymentUrl };
    } catch (error) {
      let safeToReleaseInventory = true;
      if (providerLinkId) {
        try {
          await adapter.expirePaymentLink(providerLinkId);
        } catch {
          safeToReleaseInventory = false;
        }
      }
      if (orderId && safeToReleaseInventory) {
        try {
          await deps.cancelOrder(orderId);
        } catch {
          // Preserve the customer-safe response; operators can reconcile the pending order.
        }
      }
      if (error instanceof Error && error.name === "CheckoutInventoryUnavailableError") {
        return { ok: false, error: error.message };
      }
      return { ok: false, error: "Unable to start checkout. Please try again." };
    }
  };
}
