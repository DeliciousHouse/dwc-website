import type {
  PaymentAdapter,
  PaymentOrderStatus,
} from "@/lib/payments/payment-adapter";

const EXPIRED_CHECKOUT_BATCH_SIZE = 25;

export type ExpiredCheckoutPrisma = {
  order: {
    findMany(args: unknown): Promise<Array<{
      id: string;
      paymentProviderOrderId: string | null;
      paymentLinkId: string | null;
    }>>;
  };
};

type RecordPaymentResult = (input: {
  orderId: string;
  status: PaymentOrderStatus;
}) => Promise<void>;

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
      status: "pending",
      reservations: {
        some: { status: "reserved", expiresAt: { lte: now } },
      },
      OR: [{ paymentProvider: null }, { paymentProvider: adapter.provider }],
    },
    select: {
      id: true,
      paymentProviderOrderId: true,
      paymentLinkId: true,
    },
    orderBy: { createdAt: "asc" },
    take: EXPIRED_CHECKOUT_BATCH_SIZE,
  });

  for (const order of orders) {
    try {
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
    } catch {
      // Leave the claim in place when Square cannot confirm the checkout is safe to expire.
    }
  }
}
