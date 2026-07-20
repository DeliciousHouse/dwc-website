import { writeAuditLog } from "@/lib/audit";
import { getPrisma } from "@/lib/db";
import type { PaymentOrderStatus } from "@/lib/payments/payment-adapter";
import {
  cancelCheckoutOrderAndReleaseInventory,
  type CheckoutInventoryPrisma,
} from "./order-inventory.server";

type TransactionClient = {
  order: {
    updateMany(args: unknown): Promise<{ count: number }>;
  };
  inventoryReservation: {
    findMany(args: unknown): Promise<Array<{
      id: string;
      productId: string;
      qty: number;
    }>>;
    updateMany(args: unknown): Promise<{ count: number }>;
  };
  product: {
    update(args: unknown): Promise<unknown>;
  };
};

export type CheckoutPrisma = {
  order: {
    findUnique(args: unknown): Promise<{
      id: string;
      paymentProviderOrderId: string | null;
    } | null>;
    updateMany(args: unknown): Promise<unknown>;
  };
  $transaction(callback: (client: TransactionClient) => Promise<void>): Promise<void>;
};

type AuditWriter = (input: {
  action: string;
  entityType: string;
  entityId: string;
  data: Record<string, unknown>;
}) => Promise<void>;

export function createCheckoutReturnStore({
  prisma,
  writeAuditLog: audit,
}: {
  prisma: CheckoutPrisma;
  writeAuditLog: AuditWriter;
}) {
  return {
    async findCheckoutOrder(orderId: string) {
      const order = await prisma.order.findUnique({
        where: { id: orderId, paymentProvider: "square" },
        select: { id: true, paymentProviderOrderId: true },
      });
      if (!order) return null;
      return {
        id: order.id,
        providerOrderId: order.paymentProviderOrderId,
      };
    },

    async recordPaymentResult({
      orderId,
      status,
    }: {
      orderId: string;
      status: PaymentOrderStatus;
    }) {
      if (status === "completed") {
        let changed = false;
        await prisma.$transaction(async (tx) => {
          const claimed = await tx.order.updateMany({
            where: {
              id: orderId,
              paymentProvider: "square",
              status: "pending",
            },
            data: { status: "paid", paymentStatus: "completed" },
          });
          if (claimed.count === 0) return;

          const reservations = await tx.inventoryReservation.findMany({
            where: { orderId, status: "reserved" },
          });
          if (reservations.length) {
            await tx.inventoryReservation.updateMany({
              where: { orderId, status: "reserved" },
              data: { status: "consumed" },
            });
          }
          changed = true;
        });

        if (changed) {
          await audit({
            action: "checkout_payment_succeeded",
            entityType: "order",
            entityId: orderId,
            data: { provider: "square" },
          });
        }
        return;
      }

      if (status === "cancelled") {
        const changed = await cancelCheckoutOrderAndReleaseInventory({
          prisma: prisma as unknown as CheckoutInventoryPrisma,
          orderId,
          paymentStatus: "cancelled",
          paymentProvider: "square",
        });
        if (changed) {
          await audit({
            action: "checkout_payment_cancelled",
            entityType: "order",
            entityId: orderId,
            data: { provider: "square" },
          });
        }
        return;
      }

      await prisma.order.updateMany({
        where: {
          id: orderId,
          paymentProvider: "square",
          status: "pending",
        },
        data: { paymentStatus: status },
      });
    },
  };
}

let defaultStore: ReturnType<typeof createCheckoutReturnStore> | undefined;

function getDefaultStore() {
  defaultStore ??= createCheckoutReturnStore({
    prisma: getPrisma() as unknown as CheckoutPrisma,
    writeAuditLog,
  });
  return defaultStore;
}

export function findCheckoutOrder(orderId: string) {
  return getDefaultStore().findCheckoutOrder(orderId);
}

export function recordPaymentResult(input: {
  orderId: string;
  status: PaymentOrderStatus;
}) {
  return getDefaultStore().recordPaymentResult(input);
}
