export const INVENTORY_CONFLICT_PAYMENT_STATUS = "completed_inventory_conflict";

export function getPaymentReconciliationNotice(paymentStatus: string | null) {
  return paymentStatus === INVENTORY_CONFLICT_PAYMENT_STATUS
    ? "Payment completed after inventory release. Review fulfillment or refund."
    : null;
}
