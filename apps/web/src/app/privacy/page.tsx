import type { Metadata } from "next";
import { LegalPage } from "../(legal)/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="2026-01-11">
      <p>
        This Privacy Policy is a placeholder and will be replaced with your
        finalized legal copy.
      </p>
      <h2>Information we collect</h2>
      <p>Account, order, and shipping information you provide.</p>
      <h2>How we use information</h2>
      <p>To fulfill orders, provide support, and improve the experience.</p>
      <h2>Analytics</h2>
      <p>We may use analytics to understand usage and improve the site.</p>
    </LegalPage>
  );
}

