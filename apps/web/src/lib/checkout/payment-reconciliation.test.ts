import { describe, expect, it } from "vitest";
import { getPaymentReconciliationNotice } from "./payment-reconciliation";

describe("payment reconciliation notice", () => {
  it("flags completed payments whose inventory was already released", () => {
    expect(getPaymentReconciliationNotice("completed_inventory_conflict")).toBe(
      "Payment completed after inventory release. Review fulfillment or refund.",
    );
  });

  it("does not flag ordinary provider states", () => {
    expect(getPaymentReconciliationNotice("completed")).toBeNull();
    expect(getPaymentReconciliationNotice("expired")).toBeNull();
    expect(getPaymentReconciliationNotice(null)).toBeNull();
  });
});
