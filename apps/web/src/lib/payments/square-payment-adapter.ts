import {
  Square,
  SquareClient,
  SquareEnvironment,
  type SquareEnvironment as SquareEnvironmentValue,
} from "square";
import type {
  CreatePaymentLinkInput,
  PaymentAdapter,
  PaymentOrderStatus,
} from "./payment-adapter";

export type SquareSdkClient = {
  checkout: {
    paymentLinks: {
      create(request: Square.checkout.CreatePaymentLinkRequest): Promise<Square.CreatePaymentLinkResponse>;
      delete(request: { id: string }): Promise<unknown>;
    };
  };
  orders: {
    get(request: { orderId: string }): Promise<Square.GetOrderResponse>;
  };
};

export type SquareConfig = {
  accessToken: string;
  environment: SquareEnvironmentValue;
  locationId: string;
};

type Environment = Record<string, string | undefined>;

function trimmed(value: string | undefined) {
  const result = value?.trim();
  return result ? result : null;
}

export function readSquareConfig(env: Environment = process.env): SquareConfig | null {
  const accessToken = trimmed(env.SQUARE_ACCESS_TOKEN);
  const locationId = trimmed(env.SQUARE_LOCATION_ID);
  const environmentName = trimmed(env.SQUARE_ENVIRONMENT)?.toLowerCase();

  if (!accessToken || !locationId || !environmentName) return null;

  const environment = environmentName === "sandbox"
    ? SquareEnvironment.Sandbox
    : environmentName === "production"
      ? SquareEnvironment.Production
      : null;

  if (!environment) return null;
  return { accessToken, environment, locationId };
}

function squareCurrency(currency: string): "USD" {
  if (currency.toUpperCase() !== "USD") {
    throw new Error(`Square checkout does not support currency ${currency}.`);
  }
  return "USD";
}

function orderStatus(state: Square.OrderState | undefined): PaymentOrderStatus {
  switch (state) {
    case "COMPLETED":
      return "completed";
    case "OPEN":
    case "DRAFT":
      return "open";
    case "CANCELED":
      return "cancelled";
    default:
      return "unknown";
  }
}

export function createSquarePaymentAdapter({
  client,
  locationId,
}: {
  client: SquareSdkClient;
  locationId: string;
}): PaymentAdapter {
  return {
    provider: "square",

    async createPaymentLink(input: CreatePaymentLinkInput) {
      const description = `Delicious Wines order ${input.referenceId}`;
      const response = await client.checkout.paymentLinks.create({
        idempotencyKey: input.idempotencyKey,
        description,
        order: {
          locationId,
          referenceId: input.referenceId,
          lineItems: input.lineItems.map((item) => ({
            name: item.name,
            quantity: String(item.quantity),
            basePriceMoney: {
              amount: BigInt(item.unitAmountCents),
              currency: squareCurrency(item.currency),
            },
          })),
        },
        checkoutOptions: {
          askForShippingAddress: false,
          redirectUrl: input.redirectUrl,
        },
        paymentNote: description,
      });

      const paymentLink = response.paymentLink;
      if (!paymentLink?.id || !paymentLink.orderId || !paymentLink.url) {
        throw new Error("Square did not return a complete payment link.");
      }

      return {
        paymentUrl: paymentLink.url,
        providerLinkId: paymentLink.id,
        providerOrderId: paymentLink.orderId,
      };
    },

    async getOrderStatus(providerOrderId: string) {
      const response = await client.orders.get({ orderId: providerOrderId });
      return orderStatus(response.order?.state);
    },

    async expirePaymentLink(providerLinkId: string) {
      await client.checkout.paymentLinks.delete({ id: providerLinkId });
    },
  };
}

export function createSquarePaymentAdapterFromEnv(
  env: Environment = process.env,
): PaymentAdapter | null {
  const config = readSquareConfig(env);
  if (!config) return null;

  const client = new SquareClient({
    token: config.accessToken,
    environment: config.environment,
  });
  return createSquarePaymentAdapter({ client, locationId: config.locationId });
}
