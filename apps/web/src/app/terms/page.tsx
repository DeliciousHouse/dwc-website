import type { Metadata } from "next";
import { LegalPage } from "../(legal)/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="2026-01-30">
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your use of Delicious Wines
        (the &quot;Site&quot;) and any purchases made through the Site. By using the
        Site, you agree to these Terms.
      </p>
      <h2>Eligibility</h2>
      <p>
        You must be at least 21 years old and legally permitted to purchase
        alcohol in your jurisdiction. We may require age verification and may
        refuse service if we cannot verify eligibility.
      </p>
      <h2>Accounts</h2>
      <p>
        You are responsible for maintaining the confidentiality of your account
        and for all activity that occurs under your account.
      </p>
      <h2>Orders, pricing, and availability</h2>
      <p>
        All orders are subject to availability and verification. Prices,
        promotions, and selections may change without notice. We reserve the
        right to cancel or limit quantities at our discretion.
      </p>
      <h2>Shipping and delivery</h2>
      <p>
        Shipping availability varies by state and local law. We only ship to
        jurisdictions where delivery is permitted. Adult signature is required
        for delivery. If delivery attempts fail or a package is refused, it may
        be returned or disposed of per carrier policy and applicable law.
      </p>
      <h2>Compliance acknowledgments</h2>
      <p>
        At checkout you must affirm you are 21+ and acknowledge adult signature
        requirements. These acknowledgments are recorded as part of compliance
        and are required to complete a purchase.
      </p>
      <h2>Payments</h2>
      <p>
        Payments are processed by third-party providers. We do not store full
        payment card data. Your payment may be authorized at the time of order
        and captured at fulfillment.
      </p>
      <h2>Refunds and cancellations</h2>
      <p>
        Alcohol sales may be restricted by law. See our{" "}
        <a href="/refunds">Refund Policy</a> for details.
      </p>
      <h2>Vendor and carrier policies</h2>
      <p>
        We may fulfill orders using licensed retail partners and delivery
        carriers. Their policies apply to shipping, delivery attempts, and
        adult-signature requirements. Examples include:
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
      <h2>Intellectual property</h2>
      <p>
        All Site content, trademarks, and materials are owned by Delicious Wines
        or its licensors and may not be used without permission.
      </p>
      <h2>Disclaimers and limitation of liability</h2>
      <p>
        The Site and products are provided &quot;as is&quot; to the extent permitted
        by law. We are not liable for indirect, incidental, or consequential
        damages.
      </p>
      <h2>Governing law</h2>
      <p>
        These Terms are governed by the laws of the state in which Delicious
        Wines is headquartered, without regard to conflict-of-law principles.
      </p>
      <h2>Contact</h2>
      <p>
        Questions? Visit <a href="/contact">Contact</a>.
      </p>
    </LegalPage>
  );
}

