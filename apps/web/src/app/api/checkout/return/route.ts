import { createSquarePaymentAdapterFromEnv } from "@/lib/payments/square-payment-adapter";
import type {
  PaymentAdapter,
  PaymentOrderStatus,
} from "@/lib/payments/payment-adapter";
import type { PaymentPersistenceOutcome } from "@/lib/checkout/checkout-return.server";
import { getSiteUrl } from "@/lib/site";

export const runtime = "nodejs";

type CheckoutReturnDependencies = {
  createPaymentAdapter(): PaymentAdapter | null;
  findOrder(orderId: string): Promise<{
    id: string;
    providerOrderId: string | null;
  } | null>;
  recordPaymentResult(input: {
    orderId: string;
    status: PaymentOrderStatus;
  }): Promise<PaymentPersistenceOutcome>;
  getSiteUrl(): string;
};

function redirectTo(siteUrl: string, status: string, clearCart = false) {
  const location = new URL(`/checkout/success?status=${encodeURIComponent(status)}`, siteUrl);
  const headers = new Headers({ location: location.toString() });
  if (clearCart) {
    headers.set(
      "set-cookie",
      `dw_cart=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly${location.protocol === "https:" ? "; Secure" : ""}`,
    );
  }
  return new Response(null, { status: 303, headers });
}

export function createCheckoutReturnHandler(deps: CheckoutReturnDependencies) {
  return async function checkoutReturn(request: Request) {
    const siteUrl = deps.getSiteUrl();
    const orderId = new URL(request.url).searchParams.get("orderId")?.trim();
    const adapter = deps.createPaymentAdapter();
    if (!orderId || !adapter) return redirectTo(siteUrl, "unverified");

    const order = await deps.findOrder(orderId);
    if (!order?.providerOrderId) return redirectTo(siteUrl, "unverified");

    try {
      const status = await adapter.getOrderStatus(order.providerOrderId);
      const persisted = await deps.recordPaymentResult({ orderId: order.id, status });

      if (persisted === "paid") return redirectTo(siteUrl, "paid", true);
      if (persisted === "inventory_conflict") return redirectTo(siteUrl, "payment-review");
      if (persisted === "cancelled") return redirectTo(siteUrl, "cancelled");
      if (persisted === "pending") return redirectTo(siteUrl, "pending");
      return redirectTo(siteUrl, "unverified");
    } catch {
      return redirectTo(siteUrl, "unverified");
    }
  };
}

export async function GET(request: Request) {
  const { findCheckoutOrder, recordPaymentResult } = await import(
    "@/lib/checkout/checkout-return.server"
  );
  return createCheckoutReturnHandler({
    createPaymentAdapter: createSquarePaymentAdapterFromEnv,
    findOrder: findCheckoutOrder,
    recordPaymentResult,
    getSiteUrl,
  })(request);
}
