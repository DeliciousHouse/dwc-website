import type {
  PaymentAdapter,
  PaymentOrderStatus,
} from "@/lib/payments/payment-adapter";
import type { PaymentPersistenceOutcome } from "./checkout-return.server";

const EXPIRED_CHECKOUT_BATCH_SIZE = 25;

export type ExpiredCheckoutPrisma = {
  order: {
    findMany(args: unknown): Promise<Array<{
      id: string;
      status: "pending" | "cancelled";
      paymentProviderOrderId: string | null;
      paymentLinkId: string | null;
      paymentStatus: string | null;
    }>>;
  };
};

type RecordPaymentResult = (input: {
  orderId: string;
  status: PaymentOrderStatus;
}) => Promise<PaymentPersistenceOutcome>;

type CancelOrder = (input: {
  orderId: string;
  paymentStatus: "cancelled" | "expired";
}) => Promise<unknown>;

function isTerminal(status: PaymentOrderStatus) {
  return status === "completed" || status === "cancelled";
}

export async function reconcileExpiredCheckoutOrders({
  prisma,
  adapter,
  recordPaymentResult,
  cancelOrder,
  now = new Date(),
}: {
  prisma: ExpiredCheckoutPrisma;
  adapter: PaymentAdapter;
  recordPaymentResult: RecordPaymentResult;
  cancelOrder: CancelOrder;
  now?: Date;
}): Promise<void> {
  const orders = await prisma.order.findMany({
    where: {
      OR: [{
        status: "pending",
        reservations: {
          some: { status: "reserved", expiresAt: { lte: now } },
        },
        OR: [{ paymentProvider: null }, { paymentProvider: adapter.provider }],
      }, {
        status: "cancelled",
        paymentProvider: adapter.provider,
        paymentStatus: "expired",
        paymentProviderOrderId: { not: null },
      }],
    },
    select: {
      id: true,
      status: true,
      paymentProviderOrderId: true,
      paymentLinkId: true,
      paymentStatus: true,
    },
    orderBy: { updatedAt: "asc" },
    take: EXPIRED_CHECKOUT_BATCH_SIZE,
  });

  for (const order of orders) {
    try {
      if (order.status === "cancelled") {
        if (!order.paymentProviderOrderId) continue;
        const status = await adapter.getOrderStatus(order.paymentProviderOrderId);
        await recordPaymentResult({ orderId: order.id, status });
        continue;
      }

      if (!order.paymentProviderOrderId || !order.paymentLinkId) {
        await cancelOrder({ orderId: order.id, paymentStatus: "expired" });
        continue;
      }

      let status = await adapter.getOrderStatus(order.paymentProviderOrderId);
      if (isTerminal(status)) {
        await recordPaymentResult({ orderId: order.id, status });
        continue;
      }

      await adapter.expirePaymentLink(order.paymentLinkId);
      status = await adapter.getOrderStatus(order.paymentProviderOrderId);
      if (isTerminal(status)) {
        await recordPaymentResult({ orderId: order.id, status });
        continue;
      }

      await cancelOrder({ orderId: order.id, paymentStatus: "expired" });
      status = await adapter.getOrderStatus(order.paymentProviderOrderId);
      await recordPaymentResult({ orderId: order.id, status });
    } catch {
      // Keep pending claims guarded; expired orders remain eligible for a later reconciliation pass.
    }
  }
}
