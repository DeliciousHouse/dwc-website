import { NextResponse } from "next/server";

import { auth } from "@/auth";

export default auth((req) => {
  // Protect admin routes with RBAC
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!req.auth?.user) {
      const url = req.nextUrl.clone();
      url.pathname = "/signin";
      url.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    if (!req.auth.user.isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};

