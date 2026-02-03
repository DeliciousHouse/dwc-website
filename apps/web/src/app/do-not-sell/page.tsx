import type { Metadata } from "next";
import { LegalPage } from "../(legal)/legal-page";

export const metadata: Metadata = {
  title: "Do Not Sell or Share",
};

export default function DoNotSellPage() {
  return (
    <LegalPage title="Do Not Sell or Share" updated="2026-01-30">
      <p>
        Delicious Wines does not sell your personal information. We also do not
        share personal information for cross-context behavioral advertising
        without your consent.
      </p>
      <h2>Your rights</h2>
      <p>
        If you are a California resident, you may request access, correction,
        or deletion of your personal information, and you may opt out of certain
        sharing. We will verify your request as required by law.
      </p>
      <h2>How to opt out</h2>
      <p>
        You can submit a privacy request through <a href="/contact">Contact</a>.
        Please include the email address associated with your account or order.
      </p>
      <h2>Authorized agents</h2>
      <p>
        You may designate an authorized agent to submit requests on your
        behalf. We will require proof of authorization and identity
        verification.
      </p>
    </LegalPage>
  );
}
