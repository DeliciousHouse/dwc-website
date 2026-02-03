import type { Metadata } from "next";
import { Geist, Geist_Mono, Libre_Bodoni } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";
import { AgeGate } from "@/components/age-gate";
import { AnalyticsScripts } from "@/components/analytics-scripts";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { SiteFooter } from "@/components/site-footer";
import { SiteImage } from "@/components/site-image";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/ui/sonner";
import { getSiteUrl } from "@/lib/site";
import { getServerConsent } from "@/lib/consent-server";
import { CartDrawerWrapper } from "@/components/cart/cart-drawer-wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const editorialSerif = Libre_Bodoni({
  variable: "--font-editorial",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Delicious Wines",
    template: "%s | Delicious Wines",
  },
  description: "An editorial wine list with clear context.",
  openGraph: {
    type: "website",
    title: "Delicious Wines",
    description: "An editorial wine list with clear context.",
    siteName: "Delicious Wines",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adSenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const consent = getServerConsent();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${editorialSerif.variable} antialiased`}
      >
        {adSenseClient && consent?.ads ? (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSenseClient}`}
            crossOrigin="anonymous"
          />
        ) : null}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AnalyticsScripts />
          <AgeGate />
          <CookieConsentBanner />
          <div className="min-h-dvh bg-background text-foreground">
            <header className="sticky top-0 z-40 border-b border-border/70 bg-background">
              <div className="dw-container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight">
                  <SiteImage id="logoInverted" className="h-8 w-8" priority />
                  <span>Delicious Wines</span>
                </Link>
                <nav className="flex items-center gap-4 text-sm text-muted-foreground">
                  <Link className="hover:text-foreground" href="/story">
                    Story
                  </Link>
                  <Link className="hover:text-foreground" href="/shop">
                    Selections
                  </Link>
                  <Link className="hidden hover:text-foreground sm:inline" href="/wine-club">
                    Club
                  </Link>
                  <Link className="hidden hover:text-foreground sm:inline" href="/tastings">
                    Tastings
                  </Link>
                  <Link className="hidden hover:text-foreground sm:inline" href="/contact">
                    Contact
                  </Link>
                  <CartDrawerWrapper />
                  <Link className="hidden hover:text-foreground sm:inline" href="/account">
                    Account
                  </Link>
                </nav>
              </div>
            </header>
            <main className="dw-container py-10">{children}</main>
            <SiteFooter />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
