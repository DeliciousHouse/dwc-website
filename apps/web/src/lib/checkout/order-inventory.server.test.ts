import { describe, expect, it, vi } from "vitest";
import type { CreateOrderInput } from "./start-checkout";
import {
  cancelCheckoutOrderAndReleaseInventory,
  CheckoutInventoryUnavailableError,
  createOrderWithInventoryReservation,
} from "./order-inventory.server";

const now = new Date("2026-07-20T12:00:00.000Z");

const input: CreateOrderInput = {
  email: "buyer@example.com",
  userId: "user_123",
  subtotalCents: 8400,
  shippingCents: 0,
  taxCents: 0,
  totalCents: 8400,
  currency: "USD",
  shippingState: "CA",
  shippingAddressSnapshot: {
    name: "Buyer Example",
    phone: null,
    line1: "123 Vine Street",
    line2: null,
    city: "Napa",
    state: "CA",
    postalCode: "94558",
    country: "US",
  },
  ageAffirmedAt: now,
  items: [{
    productId: "product_123",
    nameSnapshot: "Estate Pinot Noir",
    unitPriceCents: 4200,
    qty: 2,
    lineTotalCents: 8400,
  }],
};

function database() {
  const tx = {
    order: {
      create: vi.fn().mockResolvedValue({ id: "local_order_123" }),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    orderItem: {
      createMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    product: {
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      update: vi.fn().mockResolvedValue({ id: "product_123" }),
    },
    inventoryReservation: {
      createMany: vi.fn().mockResolvedValue({ count: 1 }),
      findMany: vi.fn().mockResolvedValue([{
        id: "reservation_123",
        productId: "product_123",
        qty: 2,
      }]),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
  };
  return {
    tx,
    prisma: {
      $transaction: vi.fn(async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx)),
    },
  };
}

describe("checkout inventory reservations", () => {
  it("atomically claims available stock when creating an order", async () => {
    const { prisma, tx } = database();

    await expect(createOrderWithInventoryReservation({
      prisma,
      input,
      now,
    })).resolves.toEqual({ id: "local_order_123" });

    expect(tx.product.updateMany).toHaveBeenCalledWith({
      where: {
        id: "product_123",
        isActive: true,
        inventoryOnHand: { gte: 2 },
      },
      data: { inventoryOnHand: { decrement: 2 } },
    });
    expect(tx.inventoryReservation.createMany).toHaveBeenCalledWith({
      data: [{
        productId: "product_123",
        qty: 2,
        status: "reserved",
        reason: "order",
        orderId: "local_order_123",
        expiresAt: new Date("2026-07-20T12:30:00.000Z"),
      }],
    });
  });

  it("rolls back order creation when the guarded stock claim loses a race", async () => {
    const { prisma, tx } = database();
    tx.product.updateMany.mockResolvedValue({ count: 0 });

    await expect(createOrderWithInventoryReservation({
      prisma,
      input,
      now,
    })).rejects.toEqual(new CheckoutInventoryUnavailableError("Estate Pinot Noir"));

    expect(tx.inventoryReservation.createMany).not.toHaveBeenCalled();
  });

  it("releases claimed stock exactly once when a pending checkout is cancelled", async () => {
    const { prisma, tx } = database();

    await expect(cancelCheckoutOrderAndReleaseInventory({
      prisma,
      orderId: "local_order_123",
      paymentStatus: "cancelled",
    })).resolves.toBe(true);

    expect(tx.order.updateMany).toHaveBeenCalledWith({
      where: { id: "local_order_123", status: "pending" },
      data: { status: "cancelled", paymentStatus: "cancelled" },
    });
    expect(tx.inventoryReservation.updateMany).toHaveBeenCalledWith({
      where: { id: "reservation_123", status: "reserved" },
      data: { status: "released" },
    });
    expect(tx.product.update).toHaveBeenCalledWith({
      where: { id: "product_123" },
      data: { inventoryOnHand: { increment: 2 } },
    });
  });
});
