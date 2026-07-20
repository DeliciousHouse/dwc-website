import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resend Verification",
};

export default function ResendVerificationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
