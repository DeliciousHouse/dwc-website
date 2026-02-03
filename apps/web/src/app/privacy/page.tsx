import type { Metadata } from "next";
import { LegalPage } from "../(legal)/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="2026-01-30">
      <p>
        This Privacy Policy explains how Delicious Wines collects, uses, and
        shares information when you use our Site or make a purchase.
      </p>
      <h2>Information we collect</h2>
      <p>
        We collect information you provide, such as name, email, shipping
        address, and order details. If you create an account, we store your
        account details and preferences.
      </p>
      <p>
        We also collect limited technical data such as IP address, device
        information, and browsing activity for security, analytics, and fraud
        prevention.
      </p>
      <h2>How we use information</h2>
      <ul>
        <li>To process orders, verify eligibility, and deliver products.</li>
        <li>To provide customer support and respond to inquiries.</li>
        <li>To improve the Site, content, and product selection.</li>
        <li>To comply with legal obligations and alcohol regulations.</li>
      </ul>
      <h2>Payments</h2>
      <p>
        Payments are processed by third-party providers (such as Stripe). We do
        not store full payment card numbers. Payment providers handle your
        payment data according to their own policies.
      </p>
      <h2>Sharing information</h2>
      <p>
        We share information with service providers that help us operate the
        Site (payment processors, carriers, hosting providers) and with licensed
        retail or fulfillment partners when required to complete your order.
        We do not sell your personal information.
      </p>
      <h2>Cookies and analytics</h2>
      <p>
        We use essential cookies for site functionality and may use analytics
        to understand usage. See our <a href="/cookies">Cookie Policy</a> for
        details.
      </p>
      <h2>Your choices and rights</h2>
      <p>
        You can request access, correction, or deletion of your personal
        information. California residents may have additional rights under
        applicable law, including the right to opt out of certain sharing. See{" "}
        <a href="/do-not-sell">Do Not Sell or Share</a>.
      </p>
      <h2>Data retention</h2>
      <p>
        We retain personal information as needed to fulfill orders, meet legal
        obligations, and resolve disputes.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about privacy? Visit <a href="/contact">Contact</a>.
      </p>
    </LegalPage>
  );
}

