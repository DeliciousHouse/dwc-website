import { afterEach, describe, expect, it, vi } from "vitest";
const { consent } = vi.hoisted(() => ({ consent: vi.fn() }));
vi.mock("@/lib/consent-server", () => ({ getServerConsent: consent }));
import { AnalyticsScripts } from "@/components/analytics-scripts";

afterEach(() => { vi.unstubAllEnvs(); consent.mockReset(); });

describe("analytics release approval boundary", () => {
  it.each([undefined, "false", "TRUE", "1"])("requires explicit review flag, received %s", async (approval) => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-TESTONLY");
    vi.stubEnv("GA_CONFIGURATION_APPROVED", approval);
    consent.mockResolvedValue({ analytics: true, ads: false });
    expect(await AnalyticsScripts()).toBeNull();
  });
  it.each([false, true])("still requires consent and production when review flag is true (consent %s)", async (analytics) => {
    vi.stubEnv("NODE_ENV", analytics ? "development" : "production");
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-TESTONLY");
    vi.stubEnv("GA_CONFIGURATION_APPROVED", "true");
    consent.mockResolvedValue({ analytics, ads: false });
    expect(await AnalyticsScripts()).toBeNull();
  });
  it("returns the guarded loader only after all configured gates pass", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-TESTONLY");
    vi.stubEnv("GA_CONFIGURATION_APPROVED", "true");
    consent.mockResolvedValue({ analytics: true, ads: false });
    const result = await AnalyticsScripts();
    expect(result?.props.id).toBe("ga4-init");
    expect(result?.props.children).toContain("dw-ga-loader");
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "not-a-stream");
    expect(await AnalyticsScripts()).toBeNull();
  });
});
