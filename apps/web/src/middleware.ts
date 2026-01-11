import { NextResponse } from "next/server";

export default function middleware() {
  // NOTE: We intentionally avoid importing Auth/Prisma in middleware (Edge runtime).
  // Admin access control is enforced in `/app/admin/layout.tsx` (Node runtime).
  return NextResponse.next();
}

export const config = {
  // Match nothing (keeps this file from running while we use Node-side guards).
  matcher: ["/__dwc_middleware_disabled__"],
};

