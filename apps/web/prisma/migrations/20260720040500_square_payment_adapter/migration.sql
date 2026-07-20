-- Replace processor-specific identifiers with the payment-adapter fields used by Square checkout.
ALTER TABLE "Order" RENAME COLUMN "stripePaymentIntentId" TO "paymentProviderOrderId";
ALTER TABLE "Order" ADD COLUMN "paymentProvider" TEXT;
ALTER TABLE "Order" ADD COLUMN "paymentLinkId" TEXT;
ALTER TABLE "Order" ADD COLUMN "paymentStatus" TEXT;
ALTER INDEX "Order_stripePaymentIntentId_key" RENAME TO "Order_paymentProviderOrderId_key";
CREATE UNIQUE INDEX "Order_paymentLinkId_key" ON "Order"("paymentLinkId");

ALTER TABLE "Subscription" RENAME COLUMN "stripeCustomerId" TO "paymentCustomerId";
ALTER TABLE "Subscription" RENAME COLUMN "stripeSubscriptionId" TO "paymentSubscriptionId";
ALTER TABLE "Subscription" ADD COLUMN "paymentProvider" TEXT;
ALTER INDEX "Subscription_stripeSubscriptionId_key" RENAME TO "Subscription_paymentSubscriptionId_key";

-- Hosted checkout inventory is claimed for 30 minutes and reconciled before reuse.
ALTER TABLE "InventoryReservation" ADD COLUMN "expiresAt" TIMESTAMP(3);
CREATE INDEX "InventoryReservation_status_expiresAt_idx"
  ON "InventoryReservation"("status", "expiresAt");
