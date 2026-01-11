import type { Metadata } from "next";
import { LegalPage } from "../(legal)/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="2026-01-11">
      <p>
        These Terms of Service are a placeholder and will be replaced with your
        finalized legal copy.
      </p>
      <h2>Eligibility</h2>
      <p>You must be 21+ to purchase alcohol.</p>
      <h2>Orders</h2>
      <p>All sales are subject to availability and verification.</p>
      <h2>Delivery</h2>
      <p>Adult signature required on delivery where applicable.</p>
      <h2>Contact</h2>
      <p>
        Questions? Visit <a href="/contact">Contact</a>.
      </p>
    </LegalPage>
  );
}

