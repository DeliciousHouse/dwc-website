import Script from "next/script";
import { getServerConsent } from "@/lib/consent-server";
import { analyticsBootstrap } from "@/lib/analytics-bootstrap";

export async function AnalyticsScripts() {
  const consent = await getServerConsent();
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  // This flag records an operator's completed O36/property privacy review;
  // a measurement ID alone is not evidence that collection is approved.
  if (!consent?.analytics || !gaId || process.env.NODE_ENV !== "production" ||
      process.env.GA_CONFIGURATION_APPROVED !== "true") return null;
  const bootstrap = analyticsBootstrap(gaId);
  if (!bootstrap) return null;

  return (
    <Script id="ga4-init" strategy="afterInteractive">
      {bootstrap}
    </Script>
  );
}

