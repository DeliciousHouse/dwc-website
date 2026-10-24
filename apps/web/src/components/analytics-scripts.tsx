import Script from "next/script";
import { getServerConsent } from "@/lib/consent-server";
import { analyticsBootstrap } from "@/lib/analytics-bootstrap";

export async function AnalyticsScripts() {
  const consent = await getServerConsent();
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!consent?.analytics || !gaId || process.env.NODE_ENV !== "production") return null;
  const bootstrap = analyticsBootstrap(gaId);
  if (!bootstrap) return null;

  return (
    <Script id="ga4-init" strategy="afterInteractive">
      {bootstrap}
    </Script>
  );
}

