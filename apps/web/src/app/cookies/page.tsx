import type { Metadata } from "next";
import { LegalPage } from "../(legal)/legal-page";

export const metadata: Metadata = {
  title: "Cookie Policy",
};

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie Policy" updated="2026-01-30">
      <p>
        We use cookies and similar technologies to provide and improve the Site.
        This policy explains what we use and how you can manage your choices.
      </p>
      <h2>Essential cookies</h2>
      <p>
        These cookies are required for core functionality such as account
        access, shopping cart, and security.
      </p>
      <h2>Analytics cookies</h2>
      <p>
        We may use analytics to understand how visitors use the Site and to
        improve the experience. Analytics cookies are only enabled where
        permitted by law and based on your preferences.
      </p>
      <h2>Advertising cookies</h2>
      <p>
        If we run advertising, we may use cookies to measure performance and
        relevance. You can control these via your browser settings or any
        consent banner presented on the Site.
      </p>
      <h2>Your choices</h2>
      <p>
        You can manage cookies in your browser settings at any time. You may
        also opt out of certain sharing as described in{" "}
        <a href="/do-not-sell">Do Not Sell or Share</a>.
      </p>
    </LegalPage>
  );
}
