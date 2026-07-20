import { auth } from "@/auth";
import { writeAuditLog } from "@/lib/audit";
import { getCart } from "@/lib/cart";
import { getPrisma } from "@/lib/db";
import { isStateAllowed } from "@/lib/shipping";
import { recordPaymentResult } from "./checkout-return.server";
import {
  reconcileExpiredCheckoutOrders,
  type ExpiredCheckoutPrisma,
} from "./expired-checkouts.server";
import {
  cancelCheckoutOrderAndReleaseInventory,
  createOrderWithInventoryReservation,
  type CheckoutInventoryPrisma,
} from "./order-inventory.server";
import {
  createCheckoutService,
  type CheckoutServiceDependencies,
} from "./start-checkout";

const dependencies: CheckoutServiceDependencies = {
  async getUserId() {
    const session = await auth();
    return session?.user?.id ?? null;
  },

  getCart,
  isStateAllowed,

  async findProducts(ids) {
    return getPrisma().product.findMany({ where: { id: { in: ids } } });
  },

  async reconcileExpiredOrders(adapter) {
    const prisma = getPrisma();
    await reconcileExpiredCheckoutOrders({
      prisma: prisma as unknown as ExpiredCheckoutPrisma,
      adapter,
      recordPaymentResult,
      cancelOrder: ({ orderId, paymentStatus }) => (
        cancelCheckoutOrderAndReleaseInventory({
          prisma: prisma as unknown as CheckoutInventoryPrisma,
          orderId,
          paymentStatus,
        })
      ),
    });
  },

  async createOrder(input) {
    return createOrderWithInventoryReservation({
      prisma: getPrisma() as unknown as CheckoutInventoryPrisma,
      input,
    });
  },

  async attachPayment(input) {
    await getPrisma().order.update({
      where: { id: input.orderId },
      data: {
        paymentProvider: input.provider,
        paymentLinkId: input.providerLinkId,
        paymentProviderOrderId: input.providerOrderId,
        paymentStatus: "open",
      },
    });
  },

  async cancelOrder(orderId) {
    await cancelCheckoutOrderAndReleaseInventory({
      prisma: getPrisma() as unknown as CheckoutInventoryPrisma,
      orderId,
      paymentStatus: "cancelled",
    });
  },

  writeAuditLog,
};

export const startCheckout = createCheckoutService(dependencies);
