import { createSquarePaymentAdapterFromEnv } from "@/lib/payments/square-payment-adapter";
import type { PaymentAdapter } from "@/lib/payments/payment-adapter";
import type {
  CheckoutSubmission,
  StartCheckout,
} from "@/lib/checkout/start-checkout";
import { getSiteUrl } from "@/lib/site";

export const runtime = "nodejs";

type CheckoutPostDependencies = {
  createPaymentAdapter(): PaymentAdapter | null;
  startCheckout: StartCheckout;
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringField(record: UnknownRecord, field: string) {
  return typeof record[field] === "string" ? record[field] : "";
}

function parseCheckout(value: unknown):
  | { ok: true; checkout: CheckoutSubmission }
  | { ok: false; error: string } {
  if (!isRecord(value)) {
    return { ok: false, error: "Please complete all checkout fields." };
  }
  if (value.ageAffirmed !== true) {
    return { ok: false, error: "You must affirm you are 21+ to continue." };
  }
  if (value.adultSignatureDisclosure !== true) {
    return { ok: false, error: "You must acknowledge the adult signature requirement." };
  }

  return {
    ok: true,
    checkout: {
      email: stringField(value, "email"),
      shippingName: stringField(value, "shippingName"),
      shippingPhone: stringField(value, "shippingPhone"),
      shippingLine1: stringField(value, "shippingLine1"),
      shippingLine2: stringField(value, "shippingLine2"),
      shippingCity: stringField(value, "shippingCity"),
      shippingState: stringField(value, "shippingState"),
      shippingPostal: stringField(value, "shippingPostal"),
      ageAffirmed: true,
      adultSignatureDisclosure: true,
    },
  };
}

function jsonError(status: number, code: string, error: string) {
  return Response.json({ code, error }, { status });
}

export function createCheckoutPostHandler(deps: CheckoutPostDependencies) {
  return async function checkoutPost(request: Request) {
    const adapter = deps.createPaymentAdapter();
    if (!adapter) {
      return jsonError(
        503,
        "checkout_unavailable",
        "Checkout opening soon. Please check back shortly.",
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError(400, "invalid_checkout", "Please complete all checkout fields.");
    }

    const parsed = parseCheckout(body);
    if (!parsed.ok) {
      return jsonError(400, "invalid_checkout", parsed.error);
    }

    const result = await deps.startCheckout({
      adapter,
      checkout: parsed.checkout,
      returnBaseUrl: getSiteUrl(),
    });
    if (!result.ok) {
      return jsonError(400, "checkout_failed", result.error);
    }

    return Response.json({
      orderId: result.orderId,
      paymentUrl: result.paymentUrl,
    });
  };
}

export async function POST(request: Request) {
  const { startCheckout } = await import("@/lib/checkout/start-checkout.server");
  return createCheckoutPostHandler({
    createPaymentAdapter: createSquarePaymentAdapterFromEnv,
    startCheckout,
  })(request);
}
