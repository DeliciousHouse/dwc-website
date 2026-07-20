import type { CreateOrderInput } from "./start-checkout";

const CHECKOUT_RESERVATION_TTL_MS = 30 * 60 * 1000;

export class CheckoutInventoryUnavailableError extends Error {
  constructor(productName: string) {
    super(`Insufficient stock: ${productName}`);
    this.name = "CheckoutInventoryUnavailableError";
  }
}

type InventoryTransactionClient = {
  order: {
    create(args: unknown): Promise<{ id: string }>;
    updateMany(args: unknown): Promise<{ count: number }>;
  };
  orderItem: {
    createMany(args: unknown): Promise<unknown>;
  };
  product: {
    updateMany(args: unknown): Promise<{ count: number }>;
    update(args: unknown): Promise<unknown>;
  };
  inventoryReservation: {
    createMany(args: unknown): Promise<unknown>;
    findMany(args: unknown): Promise<Array<{
      id: string;
      productId: string;
      qty: number;
    }>>;
    updateMany(args: unknown): Promise<{ count: number }>;
  };
};

export type CheckoutInventoryPrisma = {
  $transaction(
    callback: (client: InventoryTransactionClient) => Promise<unknown>,
  ): Promise<unknown>;
};

export async function createOrderWithInventoryReservation({
  prisma,
  input,
  now = new Date(),
}: {
  prisma: CheckoutInventoryPrisma;
  input: CreateOrderInput;
  now?: Date;
}): Promise<{ id: string }> {
  const expiresAt = new Date(now.getTime() + CHECKOUT_RESERVATION_TTL_MS);

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        email: input.email,
        userId: input.userId,
        status: "pending",
        subtotalCents: input.subtotalCents,
        shippingCents: input.shippingCents,
        taxCents: input.taxCents,
        totalCents: input.totalCents,
        currency: input.currency,
        shippingState: input.shippingState,
        shippingAddressSnapshot: input.shippingAddressSnapshot,
        ageAffirmedAt: input.ageAffirmedAt,
        adultSignatureRequired: true,
      },
    });

    await tx.orderItem.createMany({
      data: input.items.map((item) => ({ ...item, orderId: order.id })),
    });

    for (const item of input.items) {
      const claimed = await tx.product.updateMany({
        where: {
          id: item.productId,
          isActive: true,
          inventoryOnHand: { gte: item.qty },
        },
        data: { inventoryOnHand: { decrement: item.qty } },
      });
      if (claimed.count !== 1) {
        throw new CheckoutInventoryUnavailableError(item.nameSnapshot);
      }
    }

    await tx.inventoryReservation.createMany({
      data: input.items.map((item) => ({
        productId: item.productId,
        qty: item.qty,
        status: "reserved" as const,
        reason: "order" as const,
        orderId: order.id,
        expiresAt,
      })),
    });

    return { id: order.id };
  }) as Promise<{ id: string }>;
}

export async function cancelCheckoutOrderAndReleaseInventory({
  prisma,
  orderId,
  paymentStatus,
  paymentProvider,
}: {
  prisma: CheckoutInventoryPrisma;
  orderId: string;
  paymentStatus: "cancelled" | "expired";
  paymentProvider?: string;
}): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const claimedOrder = await tx.order.updateMany({
      where: {
        id: orderId,
        ...(paymentProvider ? { paymentProvider } : {}),
        status: "pending",
      },
      data: { status: "cancelled", paymentStatus },
    });
    if (claimedOrder.count === 0) return false;

    const reservations = await tx.inventoryReservation.findMany({
      where: { orderId, status: "reserved" },
      select: { id: true, productId: true, qty: true },
    });
    for (const reservation of reservations) {
      const released = await tx.inventoryReservation.updateMany({
        where: { id: reservation.id, status: "reserved" },
        data: { status: "released" },
      });
      if (released.count === 1) {
        await tx.product.update({
          where: { id: reservation.productId },
          data: { inventoryOnHand: { increment: reservation.qty } },
        });
      }
    }

    return true;
  }) as Promise<boolean>;
}
