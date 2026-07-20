export type PaymentOrderStatus = "open" | "completed" | "cancelled" | "unknown";

export type PaymentLineItem = {
  name: string;
  quantity: number;
  unitAmountCents: number;
  currency: string;
};

export type CreatePaymentLinkInput = {
  idempotencyKey: string;
  referenceId: string;
  redirectUrl: string;
  lineItems: PaymentLineItem[];
};

export type PaymentLink = {
  paymentUrl: string;
  providerLinkId: string;
  providerOrderId: string;
};

export interface PaymentAdapter {
  readonly provider: string;
  createPaymentLink(input: CreatePaymentLinkInput): Promise<PaymentLink>;
  getOrderStatus(providerOrderId: string): Promise<PaymentOrderStatus>;
  expirePaymentLink(providerLinkId: string): Promise<void>;
}
