import type { Metadata } from "next";
import { LegalPage } from "../(legal)/legal-page";

export const metadata: Metadata = {
  title: "Do Not Sell or Share",
};

export default function DoNotSellPage() {
  return (
    <LegalPage title="Do Not Sell or Share" updated="2026-01-11">
      <p>
        This notice is a placeholder and will be replaced with your finalized
        legal copy.
      </p>
      <h2>Your privacy choices</h2>
      <p>We do not sell personal information. You can request updates anytime.</p>
      <h2>Contact</h2>
      <p>Reach out to our support team for help with privacy requests.</p>
    </LegalPage>
  );
}
