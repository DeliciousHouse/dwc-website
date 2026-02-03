import Link from "next/link";

const LEGAL_LINKS: Array<{ href: string; label: string }> = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/refunds", label: "Refunds" },
  { href: "/shipping-policy", label: "Shipping Policy" },
  { href: "/cookies", label: "Cookies" },
  { href: "/accessibility", label: "Accessibility" },
  { href: "/contact", label: "Contact" },
  { href: "/do-not-sell", label: "Do Not Sell" },
  { href: "/photo-credits", label: "Photo Credits" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70">
      <div className="dw-container flex flex-col gap-6 pb-10 pt-10 text-xs text-muted-foreground">
        <p className="max-w-2xl">
          Adult signature required on delivery. Must be 21+ to purchase.
        </p>
        <nav className="flex flex-wrap gap-x-3 gap-y-2">
          {LEGAL_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="underline-offset-4 hover:text-foreground hover:underline">
              {l.label}
            </Link>
          ))}
        </nav>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          © {new Date().getFullYear()} Delicious Wines. Drink responsibly.
        </p>
      </div>
    </footer>
  );
}

