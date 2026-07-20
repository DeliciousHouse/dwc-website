import { createSquarePaymentAdapterFromEnv } from "@/lib/payments/square-payment-adapter";
import type {
  PaymentAdapter,
  PaymentOrderStatus,
} from "@/lib/payments/payment-adapter";

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
  }): Promise<void>;
};

function redirectTo(request: Request, status: string, clearCart = false) {
  const location = new URL(`/checkout/success?status=${encodeURIComponent(status)}`, request.url);
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
    const orderId = new URL(request.url).searchParams.get("orderId")?.trim();
    const adapter = deps.createPaymentAdapter();
    if (!orderId || !adapter) return redirectTo(request, "unverified");

    const order = await deps.findOrder(orderId);
    if (!order?.providerOrderId) return redirectTo(request, "unverified");

    try {
      const status = await adapter.getOrderStatus(order.providerOrderId);
      await deps.recordPaymentResult({ orderId: order.id, status });

      if (status === "completed") return redirectTo(request, "paid", true);
      if (status === "cancelled") return redirectTo(request, "cancelled");
      return redirectTo(request, "pending");
    } catch {
      return redirectTo(request, "unverified");
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
  })(request);
}
