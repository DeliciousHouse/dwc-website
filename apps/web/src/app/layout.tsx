import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
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
                <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight">
                  <Image
                    src="/DW_logo.png"
                    alt="Delicious Wines"
                    width={34}
                    height={34}
                    className="rounded"
                    priority
                  />
                  <span>Delicious Wines</span>
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
                    href="/wine-club"
                  >
                    Wine Club
                  </Link>
                  <Link
                    className="text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
                    href="/blog"
                  >
                    Blog
                  </Link>
                  <Link
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
                    href="/cart"
                    aria-label="Cart"
                  >
                    <ShoppingCart className="h-5 w-5" />
                  </Link>
                  <div className="hidden h-4 w-px bg-zinc-200 dark:bg-white/10 sm:block" />
                  <div className="flex items-center gap-2">
                    <Link
                      className="text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
                      href="/signin"
                    >
                      Login
                    </Link>
                    <span className="text-zinc-400 dark:text-zinc-500">|</span>
                    <Link
                      className="text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
                      href="/signup"
                    >
                      Create Account
                    </Link>
                  </div>
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
