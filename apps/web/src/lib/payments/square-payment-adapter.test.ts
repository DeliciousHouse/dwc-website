import { describe, expect, it, vi } from "vitest";
import { SquareEnvironment } from "square";
import {
  createSquarePaymentAdapter,
  createSquarePaymentAdapterFromEnv,
  readSquareConfig,
  type SquareSdkClient,
} from "./square-payment-adapter";

function createMockClient() {
  return {
    checkout: {
      paymentLinks: {
        create: vi.fn(),
        delete: vi.fn(),
      },
    },
    orders: {
      get: vi.fn(),
    },
  } satisfies SquareSdkClient;
}

describe("Square payment adapter", () => {
  it("creates a hosted payment link from processor-agnostic checkout input", async () => {
    const client = createMockClient();
    client.checkout.paymentLinks.create.mockResolvedValue({
      paymentLink: {
        id: "link_123",
        orderId: "square_order_123",
        url: "https://square.link/u/example",
        version: 1,
      },
    });
    const adapter = createSquarePaymentAdapter({
      client,
      locationId: "location_123",
    });

    await expect(adapter.createPaymentLink({
      idempotencyKey: "local_order_123",
      referenceId: "local_order_123",
      redirectUrl: "https://wine.example/checkout/return?orderId=local_order_123",
      lineItems: [
        {
          name: "Estate Pinot Noir",
          quantity: 2,
          unitAmountCents: 4200,
          currency: "USD",
        },
      ],
    })).resolves.toEqual({
      paymentUrl: "https://square.link/u/example",
      providerLinkId: "link_123",
      providerOrderId: "square_order_123",
    });

    expect(client.checkout.paymentLinks.create).toHaveBeenCalledWith({
      idempotencyKey: "local_order_123",
      description: "Delicious Wines order local_order_123",
      order: {
        locationId: "location_123",
        referenceId: "local_order_123",
        lineItems: [
          {
            name: "Estate Pinot Noir",
            quantity: "2",
            basePriceMoney: {
              amount: BigInt(4200),
              currency: "USD",
            },
          },
        ],
      },
      checkoutOptions: {
        askForShippingAddress: false,
        redirectUrl: "https://wine.example/checkout/return?orderId=local_order_123",
      },
      paymentNote: "Delicious Wines order local_order_123",
    });
  });

  it("rejects incomplete Square responses instead of returning a broken URL", async () => {
    const client = createMockClient();
    client.checkout.paymentLinks.create.mockResolvedValue({ paymentLink: { version: 1 } });
    const adapter = createSquarePaymentAdapter({ client, locationId: "location_123" });

    await expect(adapter.createPaymentLink({
      idempotencyKey: "local_order_123",
      referenceId: "local_order_123",
      redirectUrl: "https://wine.example/checkout/return?orderId=local_order_123",
      lineItems: [{
        name: "Estate Pinot Noir",
        quantity: 1,
        unitAmountCents: 4200,
        currency: "USD",
      }],
    })).rejects.toThrow("Square did not return a complete payment link");
  });

  it("expires an abandoned hosted checkout by deleting its Square payment link", async () => {
    const client = createMockClient();
    client.checkout.paymentLinks.delete.mockResolvedValue({});
    const adapter = createSquarePaymentAdapter({ client, locationId: "location_123" });

    await expect(adapter.expirePaymentLink("link_123")).resolves.toBeUndefined();
    expect(client.checkout.paymentLinks.delete).toHaveBeenCalledWith({ id: "link_123" });
  });

  it.each([
    ["COMPLETED", "completed"],
    ["OPEN", "open"],
    ["DRAFT", "open"],
    ["CANCELED", "cancelled"],
    [undefined, "unknown"],
  ] as const)("maps Square order state %s to %s", async (state, expected) => {
    const client = createMockClient();
    client.orders.get.mockResolvedValue({ order: { locationId: "location_123", state } });
    const adapter = createSquarePaymentAdapter({ client, locationId: "location_123" });

    await expect(adapter.getOrderStatus("square_order_123")).resolves.toBe(expected);
    expect(client.orders.get).toHaveBeenCalledWith({ orderId: "square_order_123" });
  });
});

describe("Square environment configuration", () => {
  it("fails soft when any required credential is absent", () => {
    expect(readSquareConfig({})).toBeNull();
    expect(readSquareConfig({
      SQUARE_ACCESS_TOKEN: "sandbox-token",
      SQUARE_ENVIRONMENT: "sandbox",
    })).toBeNull();
  });

  it("maps sandbox configuration to the official SDK environment", () => {
    expect(readSquareConfig({
      SQUARE_ACCESS_TOKEN: " sandbox-token ",
      SQUARE_ENVIRONMENT: "SANDBOX",
      SQUARE_LOCATION_ID: " sandbox-location ",
    })).toEqual({
      accessToken: "sandbox-token",
      environment: SquareEnvironment.Sandbox,
      locationId: "sandbox-location",
    });
  });

  it("fails soft for an unsupported environment", () => {
    expect(readSquareConfig({
      SQUARE_ACCESS_TOKEN: "token",
      SQUARE_ENVIRONMENT: "preview",
      SQUARE_LOCATION_ID: "location",
    })).toBeNull();
  });

  it("builds no adapter when credentials are absent", () => {
    expect(createSquarePaymentAdapterFromEnv({})).toBeNull();
  });
});
