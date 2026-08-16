import { writeAuditLog } from "@/lib/audit";
import { getPrisma } from "@/lib/db";
import type { PaymentOrderStatus } from "@/lib/payments/payment-adapter";
import {
  cancelCheckoutOrderAndReleaseInventory,
  type CheckoutInventoryPrisma,
} from "./order-inventory.server";
import { INVENTORY_CONFLICT_PAYMENT_STATUS } from "./payment-reconciliation";

type TransactionClient = {
  order: {
    updateMany(args: unknown): Promise<{ count: number }>;
    findUnique(args: unknown): Promise<{
      status: "pending" | "paid" | "fulfilled" | "cancelled" | "refunded";
      paymentStatus: string | null;
    } | null>;
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
      status?: "pending" | "paid" | "fulfilled" | "cancelled" | "refunded";
      paymentStatus?: string | null;
    } | null>;
    updateMany(args: unknown): Promise<{ count: number }>;
  };
  $transaction<T>(callback: (client: TransactionClient) => Promise<T>): Promise<T>;
};

export type PaymentPersistenceOutcome =
  | "paid"
  | "pending"
  | "cancelled"
  | "inventory_conflict"
  | "unverified";

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
        let auditAction: "checkout_payment_succeeded" | "checkout_payment_inventory_conflict" | null = null;
        const outcome = await prisma.$transaction<PaymentPersistenceOutcome>(async (tx) => {
          const claimed = await tx.order.updateMany({
            where: {
              id: orderId,
              paymentProvider: "square",
              status: "pending",
            },
            data: { status: "paid", paymentStatus: "completed" },
          });
          if (claimed.count === 1) {
            const reservations = await tx.inventoryReservation.findMany({
              where: { orderId, status: "reserved" },
            });
            if (reservations.length) {
              await tx.inventoryReservation.updateMany({
                where: { orderId, status: "reserved" },
                data: { status: "consumed" },
              });
            }
            auditAction = "checkout_payment_succeeded";
            return "paid";
          }

          const current = await tx.order.findUnique({
            where: { id: orderId, paymentProvider: "square" },
            select: { status: true, paymentStatus: true },
          });
          if (
            current?.paymentStatus === "completed"
            && (current.status === "paid" || current.status === "fulfilled")
          ) {
            return "paid";
          }
          if (current?.paymentStatus === INVENTORY_CONFLICT_PAYMENT_STATUS) {
            return "inventory_conflict";
          }
          if (current?.status !== "cancelled") return "unverified";

          const conflicted = await tx.order.updateMany({
            where: {
              id: orderId,
              paymentProvider: "square",
              status: "cancelled",
            },
            data: { paymentStatus: INVENTORY_CONFLICT_PAYMENT_STATUS },
          });
          if (conflicted.count === 1) {
            auditAction = "checkout_payment_inventory_conflict";
            return "inventory_conflict";
          }
          return "unverified";
        });

        if (auditAction) {
          await audit({
            action: auditAction,
            entityType: "order",
            entityId: orderId,
            data: { provider: "square" },
          });
        }
        return outcome;
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
        if (changed) return "cancelled";

        const current = await prisma.order.findUnique({
          where: { id: orderId, paymentProvider: "square" },
          select: { id: true, paymentProviderOrderId: true, status: true, paymentStatus: true },
        });
        if (
          current?.paymentStatus === "completed"
          && (current.status === "paid" || current.status === "fulfilled")
        ) {
          return "paid";
        }
        if (current?.paymentStatus === INVENTORY_CONFLICT_PAYMENT_STATUS) {
          return "inventory_conflict";
        }
        if (current?.status !== "cancelled") return "unverified";
        const cancelled = await prisma.order.updateMany({
          where: {
            id: orderId,
            paymentProvider: "square",
            status: "cancelled",
            paymentStatus: current.paymentStatus,
          },
          data: { paymentStatus: "cancelled" },
        });
        if (cancelled.count === 1) return "cancelled";

        const latest = await prisma.order.findUnique({
          where: { id: orderId, paymentProvider: "square" },
          select: { id: true, paymentProviderOrderId: true, status: true, paymentStatus: true },
        });
        if (latest?.paymentStatus === INVENTORY_CONFLICT_PAYMENT_STATUS) {
          return "inventory_conflict";
        }
        if (
          latest?.paymentStatus === "completed"
          && (latest.status === "paid" || latest.status === "fulfilled")
        ) {
          return "paid";
        }
        return latest?.status === "cancelled" && latest.paymentStatus === "cancelled"
          ? "cancelled"
          : "unverified";
      }

      const pending = await prisma.order.updateMany({
        where: {
          id: orderId,
          paymentProvider: "square",
          status: "pending",
        },
        data: { paymentStatus: status },
      });
      if (pending.count === 1) return "pending";

      const current = await prisma.order.findUnique({
        where: { id: orderId, paymentProvider: "square" },
        select: { id: true, paymentProviderOrderId: true, status: true, paymentStatus: true },
      });
      if (
        current?.paymentStatus === "completed"
        && (current.status === "paid" || current.status === "fulfilled")
      ) {
        return "paid";
      }
      if (current?.status === "cancelled") {
        await prisma.order.updateMany({
          where: {
            id: orderId,
            paymentProvider: "square",
            status: "cancelled",
            paymentStatus: "expired",
          },
          data: { paymentStatus: "expired" },
        });
        return current.paymentStatus === INVENTORY_CONFLICT_PAYMENT_STATUS
          ? "inventory_conflict"
          : "cancelled";
      }
      return "unverified";
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
