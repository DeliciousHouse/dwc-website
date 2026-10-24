import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import { analyticsBootstrap } from "./analytics-bootstrap";

function browser(url: string) {
  const scripts: Array<{ id: string; src: string }> = [];
  const context = {
    window: { location: new URL(url), dataLayer: [] as unknown[] },
    document: {
      getElementById: (id: string) => scripts.find((s) => s.id === id),
      createElement: () => ({}),
      head: { appendChild: (script: { id: string; src: string }) => scripts.push(script) },
    },
  };
  return { context, scripts };
}

describe("production analytics boundary", () => {
  it.each([
    "http://deliciouswines.org", "https://preview.deliciouswines.org",
    "http://localhost:3010", "https://dwc-preview.vercel.app",
    "https://deliciouswines.org.example.com", "https://deliciouswines.org:8443",
    "https://deliciouswines.org/reset-password?token=synthetic-token",
    "https://deliciouswines.org/verify-email?token=synthetic-token",
    "https://deliciouswines.org/account", "https://deliciouswines.org/admin/orders/synthetic-id",
    "https://deliciouswines.org/contact", "https://deliciouswines.org/checkout",
    "https://deliciouswines.org/?email=synthetic-value",
    "https://deliciouswines.org/story#synthetic-private-fragment",
  ])("does not load or queue events on %s", (url) => {
    const { context, scripts } = browser(url);
    runInNewContext(analyticsBootstrap("G-TESTONLY")!, context);
    expect(scripts).toHaveLength(0);
    expect(context.window.dataLayer).toHaveLength(0);
  });
  it("uses a bounded initial page context without referrer, title or query contents", () => {
    const { context } = browser("https://deliciouswines.org/story");
    runInNewContext(analyticsBootstrap("G-TESTONLY")!, context);
    const config = Array.from(context.window.dataLayer[1] as ArrayLike<unknown>)[2];
    expect(config).toEqual({ anonymize_ip: true, page_location: "https://deliciouswines.org/story", page_referrer: "", page_title: "Delicious Wines" });
  });
  it.each(["https://deliciouswines.org", "https://www.deliciouswines.org"])("loads only once on %s", (url) => {
    const { context, scripts } = browser(url);
    const script = analyticsBootstrap("G-TESTONLY")!;
    runInNewContext(script, context);
    runInNewContext(script, context);
    expect(scripts).toHaveLength(1);
    expect(context.window.dataLayer).toHaveLength(2);
  });
  it.each(["", "G-TEST';alert(1)//", "G-TEST</script>", "UA-123", "G-test"])("rejects malformed stream %s", (value) => {
    expect(analyticsBootstrap(value)).toBeNull();
  });
});
