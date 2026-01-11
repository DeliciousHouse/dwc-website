import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { AgeGate } from "@/components/age-gate";
import { AnalyticsScripts } from "@/components/analytics-scripts";
import { SiteFooter } from "@/components/site-footer";
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
          <div className="min-h-dvh bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
            <header className="border-b border-zinc-200/70 dark:border-white/10">
              <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                <Link href="/" className="font-semibold tracking-tight">
                  Delicious Wines
                </Link>
                <nav className="flex items-center gap-4 text-sm">
                  <Link
                    className="text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
                    href="/shop"
                  >
                    Shop
                  </Link>
                  <Link
                    className="text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
                    href="/cart"
                  >
                    Cart
                  </Link>
                  <Link
                    className="text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
                    href="/admin/products"
                  >
                    Admin
                  </Link>
                </nav>
              </div>
            </header>
            <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
            <SiteFooter />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
