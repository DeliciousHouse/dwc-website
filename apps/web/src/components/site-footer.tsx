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
];

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200/70 dark:border-white/10">
      <div className="mx-auto grid max-w-5xl gap-6 px-6 pb-10 pt-10 text-xs text-zinc-600 dark:text-zinc-400 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="font-medium text-zinc-800 dark:text-zinc-200">Compliance</p>
          <p>Adult signature required on delivery. Must be 21+ to purchase.</p>
        </div>

        <div className="space-y-2 sm:text-right">
          <p className="font-medium text-zinc-800 dark:text-zinc-200">Legal</p>
          <nav className="flex flex-wrap gap-x-3 gap-y-2 sm:justify-end">
            {LEGAL_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="underline-offset-4 hover:underline">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="sm:col-span-2">
          <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-500">
            © {new Date().getFullYear()} Delicious Wines. Drink responsibly.
          </p>
        </div>
      </div>
    </footer>
  );
}

