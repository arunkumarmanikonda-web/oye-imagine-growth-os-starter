import { NextResponse } from "next/server";

export function adminJson(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function adminUnauthorized(detail?: string) {
  return NextResponse.json(
    {
      ok: false,
      error: "Unauthorized",
      detail: detail ?? "Unauthorized",
    },
    { status: 401 }
  );
}

export function adminError(status: number, error: string, detail?: string) {
  return NextResponse.json(
    {
      ok: false,
      error,
      ...(detail ? { detail } : {}),
    },
    { status }
  );
}