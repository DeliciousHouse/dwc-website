import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import CheckoutSuccessPage from "./page";

describe("checkout success messaging", () => {
  it("makes a late-payment inventory conflict explicit without claiming fulfillment", async () => {
    const page = await CheckoutSuccessPage({
      searchParams: Promise.resolve({ status: "payment-review" }),
    });
    const markup = renderToStaticMarkup(page);

    expect(markup).toContain("Payment received — order review required");
    expect(markup).toContain("saved your order for support review");
    expect(markup).toContain("do not submit another payment");
    expect(markup).not.toContain("your order is now being prepared");
  });
});