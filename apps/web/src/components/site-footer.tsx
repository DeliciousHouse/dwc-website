import Link from "next/link";

const LEGAL_LINKS: Array<{ href: string; label: string }> = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/refunds", label: "Refunds" },
  { href: "/shipping-policy", label: "Shipping Policy" },
  { href: "/contact", label: "Contact" },
  { href: "/photo-credits", label: "Photo Credits" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto grid max-w-5xl gap-6 px-6 pb-10 pt-10 text-xs text-muted-foreground sm:grid-cols-2">
        <div className="space-y-2">
          <p className="font-medium text-foreground">Compliance</p>
          <p>Adult signature required on delivery. Must be 21+ to purchase.</p>
        </div>

        <div className="space-y-2 sm:text-right">
          <p className="font-medium text-foreground">Legal</p>
          <nav className="flex flex-wrap gap-x-3 gap-y-2 sm:justify-end">
            {LEGAL_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="underline-offset-4 hover:text-foreground hover:underline">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="sm:col-span-2">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            © {new Date().getFullYear()} Delicious Wines. Drink responsibly.
          </p>
        </div>
      </div>
    </footer>
  );
}

