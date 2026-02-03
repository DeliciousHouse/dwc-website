import type { Metadata } from "next";
import { LegalPage } from "../(legal)/legal-page";

export const metadata: Metadata = {
  title: "Accessibility",
};

export default function AccessibilityPage() {
  return (
    <LegalPage title="Accessibility" updated="2026-01-30">
      <p>
        Delicious Wines is committed to making our Site accessible to as many
        people as possible, including people with disabilities.
      </p>
      <h2>Standards and efforts</h2>
      <p>
        We aim to follow the Web Content Accessibility Guidelines (WCAG) 2.1
        Level AA where reasonably possible. We regularly review key pages and
        fix issues that impact usability.
      </p>
      <h2>Assistive technology</h2>
      <p>
        If you use assistive technology and encounter a barrier, please let us
        know. We will work to provide the information or service you need.
      </p>
      <h2>Feedback</h2>
      <p>
        Contact us at <a href="/contact">Contact</a> with any accessibility
        feedback or requests.
      </p>
    </LegalPage>
  );
}
