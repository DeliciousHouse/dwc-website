import type { Metadata } from "next";
import { LegalPage } from "../(legal)/legal-page";

export const metadata: Metadata = {
  title: "Refund Policy",
};

export default function RefundsPage() {
  return (
    <LegalPage title="Refund Policy" updated="2026-01-30">
      <p>
        Due to the nature of alcohol sales, returns may be restricted by law.
        This policy explains when we can offer a refund or replacement.
      </p>
      <h2>Damaged or defective items</h2>
      <p>
        If your order arrives damaged, incorrect, or defective, contact us
        within 48 hours of delivery with photos of the packaging and items. We
        will work with you on a replacement or refund, as permitted by law.
      </p>
      <h2>Failed deliveries and refused shipments</h2>
      <p>
        Adult signature is required. If delivery attempts fail or a shipment is
        refused, the carrier may return or dispose of the package. In such
        cases, shipping fees may not be refundable.
      </p>
      <h2>Weather and temperature</h2>
      <p>
        We may delay shipping to protect wine from extreme temperatures. If a
        package is delivered during extreme weather despite guidance, refunds
        may be limited.
      </p>
      <h2>Final sale items</h2>
      <p>
        Certain items may be marked final sale and are not eligible for refund.
      </p>
      <h2>How to request a refund</h2>
      <p>
        Contact us at <a href="/contact">Contact</a> with your order number and
        details of the issue.
      </p>
    </LegalPage>
  );
}

