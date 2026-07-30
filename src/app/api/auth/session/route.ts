import { NextRequest, NextResponse } from "next/server";
import {
  authCookieKeys,
  buildAuthCookieRecord,
  createLoginRedirectPath,
  getClearedAuthCookieKeys,
  isAccessLane,
  resolveAuthSessionFromCookieMap,
} from "@/lib/auth/session";
import { resolveCanonicalWorkspaceContext } from "@/lib/admin/canonical-workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function readString(input: FormData | Record<string, unknown>, key: string): string {
  if (input instanceof FormData) {
    const value = input.get(key);
    return typeof value === "string" ? value.trim() : "";
  }

  const value = input[key];
  return typeof value === "string" ? value.trim() : "";
}

async function readBody(request: NextRequest): Promise<FormData | Record<string, unknown>> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return (await request.json()) as Record<string, unknown>;
  }

  return request.formData();
}

function applyAuthCookies(
  response: NextResponse,
  cookieRecord: Record<string, string>,
): NextResponse {
  for (const [key, value] of Object.entries(cookieRecord)) {
    response.cookies.set(key, value, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
    });
  }

  return response;
}

function clearAuthCookies(response: NextResponse): NextResponse {
  for (const key of getClearedAuthCookieKeys()) {
    response.cookies.set(key, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      expires: new Date(0),
    });
  }

  return response;
}

export async function GET(request: NextRequest) {
  const cookieMap = {
    [authCookieKeys.lane]: request.cookies.get(authCookieKeys.lane)?.value,
    [authCookieKeys.email]: request.cookies.get(authCookieKeys.email)?.value,
    [authCookieKeys.workspaceSlug]: request.cookies.get(authCookieKeys.workspaceSlug)?.value,
    [authCookieKeys.tenantSlug]: request.cookies.get(authCookieKeys.tenantSlug)?.value,
    [authCookieKeys.brandSlug]: request.cookies.get(authCookieKeys.brandSlug)?.value,
    [authCookieKeys.issuedAt]: request.cookies.get(authCookieKeys.issuedAt)?.value,
  };

  const session = resolveAuthSessionFromCookieMap(cookieMap);
  const workspace =
    session.isAuthenticated && session.lane !== "public"
      ? resolveCanonicalWorkspaceContext(session)
      : null;

  return NextResponse.json({
    ok: true,
    session,
    workspace,
  });
}

export async function POST(request: NextRequest) {
  const payload = await readBody(request);
  const laneValue = readString(payload, "lane");
  const email = readString(payload, "email");
  const redirectTo = readString(payload, "redirectTo");

  if (!isAccessLane(laneValue) || laneValue === "public") {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid access lane",
      },
      { status: 400 },
    );
  }

  if (!email) {
    return NextResponse.json(
      {
        ok: false,
        error: "Email is required",
      },
      { status: 400 },
    );
  }

  const workspace = resolveCanonicalWorkspaceContext({
    lane: laneValue,
    workspaceSlug: null,
    tenantSlug: null,
    brandSlug: null,
  });

  const cookieRecord = buildAuthCookieRecord({
    lane: laneValue,
    email,
    workspaceSlug: workspace.workspaceSlug,
    tenantSlug: workspace.tenantSlug,
    brandSlug: workspace.brandSlug,
  });

  const target = createLoginRedirectPath(laneValue, redirectTo);
  const accept = request.headers.get("accept") ?? "";

  if (accept.includes("application/json")) {
    const jsonResponse = NextResponse.json({
      ok: true,
      redirectTo: target,
      lane: laneValue,
      workspace,
    });

    return applyAuthCookies(jsonResponse, cookieRecord);
  }

  const redirectResponse = NextResponse.redirect(new URL(target, request.url), 303);
  return applyAuthCookies(redirectResponse, cookieRecord);
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  return clearAuthCookies(response);
}