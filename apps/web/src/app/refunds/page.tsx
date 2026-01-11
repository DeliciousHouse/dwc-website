import type { Metadata } from "next";
import { LegalPage } from "../(legal)/legal-page";

export const metadata: Metadata = {
  title: "Refund Policy",
};

export default function RefundsPage() {
  return (
    <LegalPage title="Refund Policy" updated="2026-01-11">
      <p>
        This Refund Policy is a placeholder and will be replaced with your
        finalized legal copy.
      </p>
      <h2>Damaged shipments</h2>
      <p>
        If your shipment arrives damaged, contact us promptly with photos so we
        can help.
      </p>
      <h2>Returns</h2>
      <p>Alcohol returns may be restricted by law. See Terms for details.</p>
    </LegalPage>
  );
}

