import { describe, expect, it, vi } from "vitest";
import type { PaymentAdapter } from "@/lib/payments/payment-adapter";
import { createCheckoutReturnHandler } from "./route";

function adapter(status: "completed" | "open" | "cancelled" | "unknown"): PaymentAdapter {
  return {
    provider: "square",
    createPaymentLink: vi.fn(),
    getOrderStatus: vi.fn().mockResolvedValue(status),
    expirePaymentLink: vi.fn(),
  };
}

const getSiteUrl = () => "https://wine.example";

describe("GET /api/checkout/return", () => {
  it("verifies a completed Square order and records payment before redirecting", async () => {
    const paymentAdapter = adapter("completed");
    const recordPaymentResult = vi.fn().mockResolvedValue("paid");
    const handler = createCheckoutReturnHandler({
      createPaymentAdapter: () => paymentAdapter,
      findOrder: vi.fn().mockResolvedValue({
        id: "local_order_123",
        providerOrderId: "square_order_123",
      }),
      recordPaymentResult,
      getSiteUrl,
    });

    const response = await handler(new Request(
      "https://wine.example/api/checkout/return?orderId=local_order_123",
    ));

    expect(paymentAdapter.getOrderStatus).toHaveBeenCalledWith("square_order_123");
    expect(recordPaymentResult).toHaveBeenCalledWith({
      orderId: "local_order_123",
      status: "completed",
    });
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://wine.example/checkout/success?status=paid");
    expect(response.headers.get("set-cookie")).toContain("dw_cart=");
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });

  it("records an open Square order as pending without clearing the cart", async () => {
    const recordPaymentResult = vi.fn().mockResolvedValue("pending");
    const handler = createCheckoutReturnHandler({
      createPaymentAdapter: () => adapter("open"),
      findOrder: vi.fn().mockResolvedValue({
        id: "local_order_123",
        providerOrderId: "square_order_123",
      }),
      recordPaymentResult,
      getSiteUrl,
    });

    const response = await handler(new Request(
      "https://wine.example/api/checkout/return?orderId=local_order_123",
    ));

    expect(recordPaymentResult).toHaveBeenCalledWith({
      orderId: "local_order_123",
      status: "open",
    });
    expect(response.headers.get("location")).toBe("https://wine.example/checkout/success?status=pending");
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("does not query Square for an unknown local order", async () => {
    const paymentAdapter = adapter("completed");
    const recordPaymentResult = vi.fn();
    const handler = createCheckoutReturnHandler({
      createPaymentAdapter: () => paymentAdapter,
      findOrder: vi.fn().mockResolvedValue(null),
      recordPaymentResult,
      getSiteUrl,
    });

    const response = await handler(new Request(
      "https://wine.example/api/checkout/return?orderId=missing",
    ));

    expect(paymentAdapter.getOrderStatus).not.toHaveBeenCalled();
    expect(recordPaymentResult).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe("https://wine.example/checkout/success?status=unverified");
  });

  it("does not report paid when local persistence detects released inventory", async () => {
    const recordPaymentResult = vi.fn().mockResolvedValue("inventory_conflict");
    const handler = createCheckoutReturnHandler({
      createPaymentAdapter: () => adapter("completed"),
      findOrder: vi.fn().mockResolvedValue({
        id: "local_order_123",
        providerOrderId: "square_order_123",
      }),
      recordPaymentResult,
      getSiteUrl,
    });

    const response = await handler(new Request(
      "https://wine.example/api/checkout/return?orderId=local_order_123",
    ));

    expect(response.headers.get("location")).toBe(
      "https://wine.example/checkout/success?status=payment-review",
    );
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("redirects to the canonical site instead of a reflected request host", async () => {
    const handler = createCheckoutReturnHandler({
      createPaymentAdapter: () => adapter("open"),
      findOrder: vi.fn().mockResolvedValue({
        id: "local_order_123",
        providerOrderId: "square_order_123",
      }),
      recordPaymentResult: vi.fn().mockResolvedValue("pending"),
      getSiteUrl: () => "https://canonical.example",
    });

    const response = await handler(new Request(
      "https://attacker.example/api/checkout/return?orderId=local_order_123",
    ));

    expect(response.headers.get("location")).toBe(
      "https://canonical.example/checkout/success?status=pending",
    );
  });
});
