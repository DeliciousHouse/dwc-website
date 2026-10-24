import { afterEach, describe, expect, it, vi } from "vitest";
import { getClientConsent } from "./consent-client";

afterEach(() => vi.unstubAllGlobals());

describe("cookie consent reads", () => {
  it.each(["", "dw_cookie_consent=%", "dw_cookie_consent=%E0%A4%A", "dw_cookie_consent=not-json", "dw_cookie_consent=%7B%22analytics%22%3Atrue%7D"])("fails closed for %s", (cookie) => {
    vi.stubGlobal("document", { cookie });
    expect(getClientConsent()).toBeNull();
  });
  it("retains an explicit rejection", () => {
    vi.stubGlobal("document", { cookie: 'dw_cookie_consent=' + encodeURIComponent(JSON.stringify({ analytics: false, ads: false })) });
    expect(getClientConsent()).toEqual({ analytics: false, ads: false });
  });
});
