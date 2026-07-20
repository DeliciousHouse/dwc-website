import { describe, expect, it, vi } from "vitest";
import type { PaymentAdapter } from "@/lib/payments/payment-adapter";
import {
  createCheckoutService,
  type CheckoutServiceDependencies,
} from "./start-checkout";

const checkout = {
  email: "buyer@example.com",
  shippingName: "Buyer Example",
  shippingPhone: "",
  shippingLine1: "123 Vine Street",
  shippingLine2: "",
  shippingCity: "Napa",
  shippingState: "CA",
  shippingPostal: "94558",
  ageAffirmed: true,
  adultSignatureDisclosure: true,
};

function dependencies(): CheckoutServiceDependencies {
  return {
    getUserId: vi.fn().mockResolvedValue("user_123"),
    getCart: vi.fn().mockResolvedValue({
      items: [{ productId: "product_123", qty: 2 }],
    }),
    isStateAllowed: vi.fn().mockResolvedValue({ allowed: true }),
    findProducts: vi.fn().mockResolvedValue([{
      id: "product_123",
      name: "Estate Pinot Noir",
      priceCents: 4200,
      currency: "USD",
      inventoryOnHand: 6,
      isActive: true,
    }]),
    reconcileExpiredOrders: vi.fn().mockResolvedValue(undefined),
    createOrder: vi.fn().mockResolvedValue({ id: "local_order_123" }),
    attachPayment: vi.fn().mockResolvedValue(undefined),
    cancelOrder: vi.fn().mockResolvedValue(undefined),
    writeAuditLog: vi.fn().mockResolvedValue(undefined),
  };
}

function adapter(): PaymentAdapter {
  return {
    provider: "square",
    createPaymentLink: vi.fn().mockResolvedValue({
      paymentUrl: "https://square.link/u/sandbox-example",
      providerLinkId: "square_link_123",
      providerOrderId: "square_order_123",
    }),
    getOrderStatus: vi.fn(),
    expirePaymentLink: vi.fn(),
  };
}

describe("checkout service", () => {
  it("creates a local order before requesting a Square payment link", async () => {
    const deps = dependencies();
    const paymentAdapter = adapter();
    const startCheckout = createCheckoutService(deps);

    await expect(startCheckout({
      adapter: paymentAdapter,
      checkout,
      returnBaseUrl: "https://wine.example",
    })).resolves.toEqual({
      ok: true,
      orderId: "local_order_123",
      paymentUrl: "https://square.link/u/sandbox-example",
    });

    expect(deps.createOrder).toHaveBeenCalledWith(expect.objectContaining({
      email: "buyer@example.com",
      userId: "user_123",
      shippingState: "CA",
      subtotalCents: 8400,
      totalCents: 8400,
      currency: "USD",
      items: [{
        productId: "product_123",
        nameSnapshot: "Estate Pinot Noir",
        unitPriceCents: 4200,
        qty: 2,
        lineTotalCents: 8400,
      }],
    }));
    expect(deps.reconcileExpiredOrders).toHaveBeenCalledWith(paymentAdapter);
    expect(paymentAdapter.createPaymentLink).toHaveBeenCalledWith({
      idempotencyKey: "local_order_123",
      referenceId: "local_order_123",
      redirectUrl: "https://wine.example/api/checkout/return?orderId=local_order_123",
      lineItems: [{
        name: "Estate Pinot Noir",
        quantity: 2,
        unitAmountCents: 4200,
        currency: "USD",
      }],
    });
    expect(deps.attachPayment).toHaveBeenCalledWith({
      orderId: "local_order_123",
      provider: "square",
      providerLinkId: "square_link_123",
      providerOrderId: "square_order_123",
    });
    expect(deps.cancelOrder).not.toHaveBeenCalled();
  });

  it("cancels the local order and releases inventory when Square link creation fails", async () => {
    const deps = dependencies();
    const paymentAdapter = adapter();
    vi.mocked(paymentAdapter.createPaymentLink).mockRejectedValue(new Error("Square unavailable"));
    const startCheckout = createCheckoutService(deps);

    await expect(startCheckout({
      adapter: paymentAdapter,
      checkout,
      returnBaseUrl: "https://wine.example",
    })).resolves.toEqual({
      ok: false,
      error: "Unable to start checkout. Please try again.",
    });
    expect(deps.cancelOrder).toHaveBeenCalledWith("local_order_123");
  });

  it("expires a created Square link before releasing inventory when persistence fails", async () => {
    const deps = dependencies();
    vi.mocked(deps.attachPayment).mockRejectedValue(new Error("database unavailable"));
    const paymentAdapter = adapter();
    const startCheckout = createCheckoutService(deps);

    await expect(startCheckout({
      adapter: paymentAdapter,
      checkout,
      returnBaseUrl: "https://wine.example",
    })).resolves.toEqual({
      ok: false,
      error: "Unable to start checkout. Please try again.",
    });

    expect(paymentAdapter.expirePaymentLink).toHaveBeenCalledWith("square_link_123");
    expect(deps.cancelOrder).toHaveBeenCalledWith("local_order_123");
  });

  it("keeps inventory claimed when a created Square link cannot be expired", async () => {
    const deps = dependencies();
    vi.mocked(deps.attachPayment).mockRejectedValue(new Error("database unavailable"));
    const paymentAdapter = adapter();
    vi.mocked(paymentAdapter.expirePaymentLink).mockRejectedValue(new Error("Square unavailable"));
    const startCheckout = createCheckoutService(deps);

    await expect(startCheckout({
      adapter: paymentAdapter,
      checkout,
      returnBaseUrl: "https://wine.example",
    })).resolves.toEqual({
      ok: false,
      error: "Unable to start checkout. Please try again.",
    });

    expect(deps.cancelOrder).not.toHaveBeenCalled();
  });

  it("rejects checkout without the 21+ attestation before creating an order", async () => {
    const deps = dependencies();
    const startCheckout = createCheckoutService(deps);

    await expect(startCheckout({
      adapter: adapter(),
      checkout: { ...checkout, ageAffirmed: false },
      returnBaseUrl: "https://wine.example",
    })).resolves.toEqual({
      ok: false,
      error: "You must affirm you are 21+ to continue.",
    });
    expect(deps.createOrder).not.toHaveBeenCalled();
  });

  it("still fails safely when cleanup after a Square error also fails", async () => {
    const deps = dependencies();
    vi.mocked(deps.cancelOrder).mockRejectedValue(new Error("database unavailable"));
    const paymentAdapter = adapter();
    vi.mocked(paymentAdapter.createPaymentLink).mockRejectedValue(new Error("Square unavailable"));
    const startCheckout = createCheckoutService(deps);

    await expect(startCheckout({
      adapter: paymentAdapter,
      checkout,
      returnBaseUrl: "https://wine.example",
    })).resolves.toEqual({
      ok: false,
      error: "Unable to start checkout. Please try again.",
    });
  });

  it("reports an atomic stock-claim race as unavailable inventory", async () => {
    const deps = dependencies();
    const inventoryError = new Error("Insufficient stock: Estate Pinot Noir");
    inventoryError.name = "CheckoutInventoryUnavailableError";
    vi.mocked(deps.createOrder).mockRejectedValue(inventoryError);
    const startCheckout = createCheckoutService(deps);

    await expect(startCheckout({
      adapter: adapter(),
      checkout,
      returnBaseUrl: "https://wine.example",
    })).resolves.toEqual({
      ok: false,
      error: "Insufficient stock: Estate Pinot Noir",
    });
    expect(deps.cancelOrder).not.toHaveBeenCalled();
  });

  it("rejects a forged cart with a fractional bottle quantity", async () => {
    const deps = dependencies();
    vi.mocked(deps.getCart).mockResolvedValue({
      items: [{ productId: "product_123", qty: 1.5 }],
    });
    const startCheckout = createCheckoutService(deps);

    await expect(startCheckout({
      adapter: adapter(),
      checkout,
      returnBaseUrl: "https://wine.example",
    })).resolves.toEqual({
      ok: false,
      error: "Your cart contains an invalid quantity.",
    });
    expect(deps.createOrder).not.toHaveBeenCalled();
  });
});
