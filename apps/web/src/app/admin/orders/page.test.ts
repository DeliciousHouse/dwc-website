import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { findMany, findUnique } = vi.hoisted(() => ({
  findMany: vi.fn(),
  findUnique: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  getPrisma: () => ({ order: { findMany, findUnique } }),
}));
vi.mock("./actions", () => ({ updateOrderStatusAction: vi.fn() }));

import AdminOrderDetailPage from "./[id]/page";
import AdminOrdersPage from "./page";

const reconciliationNotice =
  "Payment completed after inventory release. Review fulfillment or refund.";

const order = {
  id: "order_123",
  email: "buyer@example.com",
  createdAt: new Date("2026-07-20T12:45:00.000Z"),
  items: [],
  totalCents: 2500,
  currency: "USD",
  status: "cancelled",
  paymentStatus: "completed_inventory_conflict",
  paymentProvider: "square",
  paymentProviderOrderId: "square_order_123",
  shippingAddressSnapshot: null,
};

describe("admin order reconciliation notices", () => {
  it("renders the late-settlement notice in the order list", async () => {
    findMany.mockResolvedValueOnce([order]);

    const markup = renderToStaticMarkup(await AdminOrdersPage());

    expect(markup).toContain(reconciliationNotice);
  });

  it("renders the late-settlement notice in the order detail", async () => {
    findUnique.mockResolvedValueOnce(order);

    const markup = renderToStaticMarkup(
      await AdminOrderDetailPage({ params: { id: order.id } }),
    );

    expect(markup).toContain(reconciliationNotice);
  });
});
