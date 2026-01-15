import type { Metadata } from "next";
import { LegalPage } from "../(legal)/legal-page";

export const metadata: Metadata = {
  title: "Accessibility",
};

export default function AccessibilityPage() {
  return (
    <LegalPage title="Accessibility" updated="2026-01-11">
      <p>
        This Accessibility Statement is a placeholder and will be replaced with
        your finalized accessibility policy.
      </p>
      <h2>Our commitment</h2>
      <p>We aim to make this site usable for as many people as possible.</p>
      <h2>Need help?</h2>
      <p>Contact us and we’ll work with you to resolve any issues.</p>
    </LegalPage>
  );
}
