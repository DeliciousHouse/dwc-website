import { describe, expect, it, vi } from "vitest";
import {
  createCheckoutReturnStore,
  type CheckoutPrisma,
} from "./checkout-return.server";

function transactionClient() {
  return {
    order: {
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    inventoryReservation: {
      findMany: vi.fn().mockResolvedValue([{
        id: "reservation_123",
        productId: "product_123",
        qty: 2,
      }]),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    product: {
      update: vi.fn().mockResolvedValue(undefined),
    },
  };
}

describe("checkout return persistence", () => {
  it("only resolves Square checkout orders for return verification", async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: "local_order_123",
      paymentProviderOrderId: "square_order_123",
    });
    const prisma: CheckoutPrisma = {
      order: { findUnique, updateMany: vi.fn() },
      $transaction: vi.fn(),
    };
    const store = createCheckoutReturnStore({
      prisma,
      writeAuditLog: vi.fn().mockResolvedValue(undefined),
    });

    await expect(store.findCheckoutOrder("local_order_123")).resolves.toEqual({
      id: "local_order_123",
      providerOrderId: "square_order_123",
    });
    expect(findUnique).toHaveBeenCalledWith({
      where: { id: "local_order_123", paymentProvider: "square" },
      select: { id: true, paymentProviderOrderId: true },
    });
  });

  it("marks a completed order paid and consumes claimed inventory without decrementing twice", async () => {
    const tx = transactionClient();
    const prisma: CheckoutPrisma = {
      order: {
        findUnique: vi.fn(),
        updateMany: vi.fn(),
      },
      $transaction: async (callback) => callback(tx),
    };
    const writeAuditLog = vi.fn().mockResolvedValue(undefined);
    const store = createCheckoutReturnStore({ prisma, writeAuditLog });

    await store.recordPaymentResult({
      orderId: "local_order_123",
      status: "completed",
    });

    expect(tx.inventoryReservation.findMany).toHaveBeenCalledWith({
      where: { orderId: "local_order_123", status: "reserved" },
    });
    expect(tx.product.update).not.toHaveBeenCalled();
    expect(tx.inventoryReservation.updateMany).toHaveBeenCalledWith({
      where: { orderId: "local_order_123", status: "reserved" },
      data: { status: "consumed" },
    });
    expect(tx.order.updateMany).toHaveBeenCalledWith({
      where: {
        id: "local_order_123",
        paymentProvider: "square",
        status: "pending",
      },
      data: { status: "paid", paymentStatus: "completed" },
    });
    expect(writeAuditLog).toHaveBeenCalledWith(expect.objectContaining({
      action: "checkout_payment_succeeded",
      entityId: "local_order_123",
    }));
  });

  it("does not decrement inventory when an order is already paid", async () => {
    const tx = transactionClient();
    tx.order.updateMany.mockResolvedValue({ count: 0 });
    const prisma: CheckoutPrisma = {
      order: {
        findUnique: vi.fn(),
        updateMany: vi.fn(),
      },
      $transaction: async (callback) => callback(tx),
    };
    const store = createCheckoutReturnStore({
      prisma,
      writeAuditLog: vi.fn().mockResolvedValue(undefined),
    });

    await store.recordPaymentResult({
      orderId: "local_order_123",
      status: "completed",
    });

    expect(tx.product.update).not.toHaveBeenCalled();
    expect(tx.inventoryReservation.updateMany).not.toHaveBeenCalled();
  });

  it("provider-scopes cancellation and restores claimed inventory once", async () => {
    const tx = transactionClient();
    const prisma: CheckoutPrisma = {
      order: {
        findUnique: vi.fn(),
        updateMany: vi.fn(),
      },
      $transaction: async (callback) => callback(tx),
    };
    const writeAuditLog = vi.fn().mockResolvedValue(undefined);
    const store = createCheckoutReturnStore({ prisma, writeAuditLog });

    await store.recordPaymentResult({
      orderId: "local_order_123",
      status: "cancelled",
    });

    expect(tx.order.updateMany).toHaveBeenCalledWith({
      where: {
        id: "local_order_123",
        paymentProvider: "square",
        status: "pending",
      },
      data: { status: "cancelled", paymentStatus: "cancelled" },
    });
    expect(tx.inventoryReservation.findMany).toHaveBeenCalledWith({
      where: { orderId: "local_order_123", status: "reserved" },
      select: { id: true, productId: true, qty: true },
    });
    expect(tx.inventoryReservation.updateMany).toHaveBeenCalledWith({
      where: { id: "reservation_123", status: "reserved" },
      data: { status: "released" },
    });
    expect(tx.product.update).toHaveBeenCalledWith({
      where: { id: "product_123" },
      data: { inventoryOnHand: { increment: 2 } },
    });
    expect(writeAuditLog).toHaveBeenCalledWith(expect.objectContaining({
      action: "checkout_payment_cancelled",
    }));
  });
});
