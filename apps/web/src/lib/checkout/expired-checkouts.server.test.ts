import { describe, expect, it, vi } from "vitest";
import type { PaymentAdapter } from "@/lib/payments/payment-adapter";
import { reconcileExpiredCheckoutOrders } from "./expired-checkouts.server";

const now = new Date("2026-07-20T12:45:00.000Z");

function paymentAdapter(): PaymentAdapter {
  return {
    provider: "square",
    createPaymentLink: vi.fn(),
    getOrderStatus: vi.fn().mockResolvedValue("open"),
    expirePaymentLink: vi.fn().mockResolvedValue(undefined),
  };
}

function prismaWith(order: {
  id: string;
  paymentProviderOrderId: string | null;
  paymentLinkId: string | null;
}) {
  return {
    order: {
      findMany: vi.fn().mockResolvedValue([order]),
    },
  };
}

describe("expired checkout reconciliation", () => {
  it("expires an open Square link before releasing its claimed inventory", async () => {
    const prisma = prismaWith({
      id: "local_order_123",
      paymentProviderOrderId: "square_order_123",
      paymentLinkId: "link_123",
    });
    const adapter = paymentAdapter();
    const recordPaymentResult = vi.fn();
    const cancelOrder = vi.fn().mockResolvedValue(true);

    await reconcileExpiredCheckoutOrders({
      prisma,
      adapter,
      recordPaymentResult,
      cancelOrder,
      now,
    });

    expect(prisma.order.findMany).toHaveBeenCalledWith({
      where: {
        status: "pending",
        reservations: {
          some: { status: "reserved", expiresAt: { lte: now } },
        },
        OR: [{ paymentProvider: null }, { paymentProvider: "square" }],
      },
      select: {
        id: true,
        paymentProviderOrderId: true,
        paymentLinkId: true,
      },
      orderBy: { createdAt: "asc" },
      take: 25,
    });
    expect(adapter.getOrderStatus).toHaveBeenCalledTimes(2);
    expect(adapter.expirePaymentLink).toHaveBeenCalledWith("link_123");
    expect(cancelOrder).toHaveBeenCalledWith({
      orderId: "local_order_123",
      paymentStatus: "expired",
    });
    expect(recordPaymentResult).not.toHaveBeenCalled();
  });

  it("consumes the claim instead of releasing inventory when Square reports payment", async () => {
    const prisma = prismaWith({
      id: "local_order_123",
      paymentProviderOrderId: "square_order_123",
      paymentLinkId: "link_123",
    });
    const adapter = paymentAdapter();
    vi.mocked(adapter.getOrderStatus).mockResolvedValue("completed");
    const recordPaymentResult = vi.fn().mockResolvedValue(undefined);
    const cancelOrder = vi.fn();

    await reconcileExpiredCheckoutOrders({
      prisma,
      adapter,
      recordPaymentResult,
      cancelOrder,
      now,
    });

    expect(recordPaymentResult).toHaveBeenCalledWith({
      orderId: "local_order_123",
      status: "completed",
    });
    expect(adapter.expirePaymentLink).not.toHaveBeenCalled();
    expect(cancelOrder).not.toHaveBeenCalled();
  });

  it("preserves the claim when payment completes while an open link is being expired", async () => {
    const prisma = prismaWith({
      id: "local_order_123",
      paymentProviderOrderId: "square_order_123",
      paymentLinkId: "link_123",
    });
    const adapter = paymentAdapter();
    vi.mocked(adapter.getOrderStatus)
      .mockResolvedValueOnce("open")
      .mockResolvedValueOnce("completed");
    const recordPaymentResult = vi.fn().mockResolvedValue(undefined);
    const cancelOrder = vi.fn();

    await reconcileExpiredCheckoutOrders({
      prisma,
      adapter,
      recordPaymentResult,
      cancelOrder,
      now,
    });

    expect(adapter.expirePaymentLink).toHaveBeenCalledWith("link_123");
    expect(recordPaymentResult).toHaveBeenCalledWith({
      orderId: "local_order_123",
      status: "completed",
    });
    expect(cancelOrder).not.toHaveBeenCalled();
  });

  it("expires a local claim that failed before a Square link was attached", async () => {
    const prisma = prismaWith({
      id: "local_order_123",
      paymentProviderOrderId: null,
      paymentLinkId: null,
    });
    const adapter = paymentAdapter();
    const cancelOrder = vi.fn().mockResolvedValue(true);

    await reconcileExpiredCheckoutOrders({
      prisma,
      adapter,
      recordPaymentResult: vi.fn(),
      cancelOrder,
      now,
    });

    expect(adapter.getOrderStatus).not.toHaveBeenCalled();
    expect(adapter.expirePaymentLink).not.toHaveBeenCalled();
    expect(cancelOrder).toHaveBeenCalledWith({
      orderId: "local_order_123",
      paymentStatus: "expired",
    });
  });

  it("keeps inventory claimed when Square cannot confirm payment-link state", async () => {
    const prisma = prismaWith({
      id: "local_order_123",
      paymentProviderOrderId: "square_order_123",
      paymentLinkId: "link_123",
    });
    const adapter = paymentAdapter();
    vi.mocked(adapter.getOrderStatus).mockRejectedValue(new Error("Square unavailable"));
    const recordPaymentResult = vi.fn();
    const cancelOrder = vi.fn();

    await expect(reconcileExpiredCheckoutOrders({
      prisma,
      adapter,
      recordPaymentResult,
      cancelOrder,
      now,
    })).resolves.toBeUndefined();

    expect(adapter.expirePaymentLink).not.toHaveBeenCalled();
    expect(cancelOrder).not.toHaveBeenCalled();
    expect(recordPaymentResult).not.toHaveBeenCalled();
  });
});
