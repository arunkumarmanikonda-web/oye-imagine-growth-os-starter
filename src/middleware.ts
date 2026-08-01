import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { evaluateRouteAccess } from "@/lib/auth/route-access";
import { authCookieKeys, resolveAuthSessionFromCookieMap } from "@/lib/auth/session";

export function middleware(request: NextRequest) {
  const session = resolveAuthSessionFromCookieMap({
    [authCookieKeys.lane]: request.cookies.get(authCookieKeys.lane)?.value,
    [authCookieKeys.email]: request.cookies.get(authCookieKeys.email)?.value,
    [authCookieKeys.workspaceSlug]: request.cookies.get(authCookieKeys.workspaceSlug)?.value,
    [authCookieKeys.tenantSlug]: request.cookies.get(authCookieKeys.tenantSlug)?.value,
    [authCookieKeys.brandSlug]: request.cookies.get(authCookieKeys.brandSlug)?.value,
    [authCookieKeys.issuedAt]: request.cookies.get(authCookieKeys.issuedAt)?.value,
  });

  const decision = evaluateRouteAccess(request.nextUrl.pathname, session);

  if (decision.allow || !decision.redirectTo) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL(decision.redirectTo, request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/client/:path*", "/login/admin", "/login/client"],
};