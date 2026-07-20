import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
};

export default function SignupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
