import type { Metadata } from "next";
import { LegalPage } from "../(legal)/legal-page";

export const metadata: Metadata = {
  title: "Cookie Policy",
};

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie Policy" updated="2026-01-11">
      <p>
        This Cookie Policy is a placeholder and will be replaced with your
        finalized legal copy.
      </p>
      <h2>What cookies we use</h2>
      <p>Essential cookies for site functionality and optional analytics.</p>
      <h2>Your choices</h2>
      <p>You can manage cookies in your browser settings at any time.</p>
    </LegalPage>
  );
}
