import { afterEach, describe, expect, it, vi } from "vitest";
import type { PaymentAdapter } from "@/lib/payments/payment-adapter";
import { createCheckoutPostHandler } from "./route";

const validCheckout = {
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

function checkoutRequest(body: unknown) {
  return new Request("https://wine.example/api/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function mockPaymentAdapter(): PaymentAdapter {
  return {
    provider: "square",
    createPaymentLink: vi.fn(),
    getOrderStatus: vi.fn(),
    expirePaymentLink: vi.fn(),
  };
}

describe("POST /api/checkout", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("fails soft with a clean opening-soon response when Square credentials are absent", async () => {
    const startCheckout = vi.fn();
    const handler = createCheckoutPostHandler({
      createPaymentAdapter: () => null,
      startCheckout,
    });

    const response = await handler(checkoutRequest(validCheckout));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      code: "checkout_unavailable",
      error: "Checkout opening soon. Please check back shortly.",
    });
    expect(startCheckout).not.toHaveBeenCalled();
  });

  it("starts a credentialed sandbox checkout with the canonical return base", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://canonical.wine.example/");
    const adapter = mockPaymentAdapter();
    const startCheckout = vi.fn().mockResolvedValue({
      ok: true,
      orderId: "local_order_123",
      paymentUrl: "https://square.link/u/sandbox-example",
    });
    const handler = createCheckoutPostHandler({
      createPaymentAdapter: () => adapter,
      startCheckout,
    });

    const response = await handler(checkoutRequest(validCheckout));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      orderId: "local_order_123",
      paymentUrl: "https://square.link/u/sandbox-example",
    });
    expect(startCheckout).toHaveBeenCalledWith({
      adapter,
      checkout: validCheckout,
      returnBaseUrl: "https://canonical.wine.example",
    });
  });

  it("rejects checkout without the 21+ attestation", async () => {
    const handler = createCheckoutPostHandler({
      createPaymentAdapter: () => mockPaymentAdapter(),
      startCheckout: vi.fn(),
    });

    const response = await handler(checkoutRequest({
      ...validCheckout,
      ageAffirmed: false,
    }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      code: "invalid_checkout",
      error: "You must affirm you are 21+ to continue.",
    });
  });
});
