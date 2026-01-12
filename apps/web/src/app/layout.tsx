import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import "./globals.css";
import { AgeGate } from "@/components/age-gate";
import { AnalyticsScripts } from "@/components/analytics-scripts";
import { SiteFooter } from "@/components/site-footer";
import { SiteImage } from "@/components/site-image";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/ui/sonner";
import { getSiteUrl } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Delicious Wines",
    template: "%s | Delicious Wines",
  },
  description: "Delicious Wines Club & Shop",
  openGraph: {
    type: "website",
    title: "Delicious Wines",
    description: "Delicious Wines Club & Shop",
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
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AnalyticsScripts />
          <AgeGate />
          <div className="min-h-dvh bg-background text-foreground">
            <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
              <div className="dw-container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight">
                  <div className="rounded bg-black p-1">
                    <SiteImage id="logoInverted" className="h-8 w-8" priority />
                  </div>
                  <span>Delicious Wines</span>
                </Link>
                <nav className="flex items-center gap-3 text-sm">
                  <Link
                    className="text-muted-foreground hover:text-foreground"
                    href="/shop"
                  >
                    Shop
                  </Link>
                  <Link
                    className="text-muted-foreground hover:text-foreground"
                    href="/wine-club"
                  >
                    Club
                  </Link>
                  <Link
                    className="hidden text-muted-foreground hover:text-foreground sm:inline"
                    href="/story"
                  >
                    Story
                  </Link>
                  <Link
                    className="hidden text-muted-foreground hover:text-foreground sm:inline"
                    href="/tastings"
                  >
                    Tastings
                  </Link>
                  <Link
                    className="hidden text-muted-foreground hover:text-foreground sm:inline"
                    href="/contact"
                  >
                    Contact
                  </Link>
                  <Link
                    className="hidden text-muted-foreground hover:text-foreground sm:inline"
                    href="/blog"
                  >
                    Blog
                  </Link>
                  <Link
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                    href="/cart"
                    aria-label="Cart"
                  >
                    <ShoppingCart className="h-5 w-5" />
                  </Link>
                  <div className="hidden h-4 w-px bg-border/70 sm:block" />
                  <div className="flex items-center gap-2">
                    <Link
                      className="text-muted-foreground hover:text-foreground"
                      href="/account"
                    >
                      Account
                    </Link>
                  </div>
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
