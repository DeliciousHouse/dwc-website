import type { Metadata } from "next";
import { LegalPage } from "../(legal)/legal-page";

export const metadata: Metadata = {
  title: "Shipping Policy",
};

export default function ShippingPolicyPage() {
  return (
    <LegalPage title="Shipping Policy" updated="2026-01-11">
      <p>
        This Shipping Policy is a placeholder and will be replaced with your
        finalized legal copy.
      </p>
      <h2>Eligibility</h2>
      <p>Shipping availability varies by state and local regulations.</p>
      <h2>Delivery requirements</h2>
      <p>Adult signature required on delivery.</p>
    </LegalPage>
  );
}

