import type { Metadata } from "next";
import { LegalPage } from "../(legal)/legal-page";

export const metadata: Metadata = {
  title: "Shipping Policy",
};

export default function ShippingPolicyPage() {
  return (
    <LegalPage title="Shipping Policy" updated="2026-01-30">
      <p>
        This Shipping Policy describes where and how we deliver orders. Alcohol
        shipping is regulated and availability varies by state and local law.
      </p>
      <h2>Where we ship</h2>
      <p>
        We only ship to states where alcohol delivery is permitted. Eligibility
        is confirmed at checkout based on your shipping address.
      </p>
      <h2>Processing time</h2>
      <p>
        Orders typically ship within 1–3 business days. During peak periods or
        extreme weather, processing and transit times may be longer.
      </p>
      <h2>Adult signature required</h2>
      <p>
        An adult (21+) signature is required at delivery. Carriers will not
        leave packages unattended.
      </p>
      <h2>Failed delivery attempts</h2>
      <p>
        If delivery attempts fail, the carrier may hold the package at a local
        facility for pickup or return it to sender. Returned shipments may
        incur fees.
      </p>
      <h2>Weather holds</h2>
      <p>
        We may delay shipping to protect wine during extreme temperatures. We
        will notify you if your order is placed on hold.
      </p>
      <h2>Carrier policies</h2>
      <p>
        Delivery partners have their own rules regarding alcohol shipments and
        adult signature requirements. Examples include:
      </p>
      <ul>
        <li>
          UPS alcohol shipping guidelines:{" "}
          <a href="https://www.ups.com/us/en/support/shipping-support/legal-terms-conditions/alcohol.page">
            https://www.ups.com/us/en/support/shipping-support/legal-terms-conditions/alcohol.page
          </a>
        </li>
        <li>
          FedEx alcohol shipping guidelines:{" "}
          <a href="https://www.fedex.com/en-us/shipping/alcohol.html">
            https://www.fedex.com/en-us/shipping/alcohol.html
          </a>
        </li>
      </ul>
      <h2>Questions</h2>
      <p>
        For shipping questions, visit <a href="/contact">Contact</a>.
      </p>
    </LegalPage>
  );
}

