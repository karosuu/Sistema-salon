import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ADMIN_ROUTES } from "@/lib/constants";

const SESSION_COOKIES = [
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

function hasSessionCookie(request: NextRequest): boolean {
  return SESSION_COOKIES.some((name) => request.cookies.has(name));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname.startsWith(ADMIN_ROUTES.login);
  const signedIn = hasSessionCookie(request);

  if (!isLogin && !signedIn) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = ADMIN_ROUTES.login;
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLogin && signedIn) {
    return NextResponse.redirect(new URL(ADMIN_ROUTES.dashboard, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
