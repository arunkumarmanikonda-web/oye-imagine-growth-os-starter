import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { getNeejeePilotControlSnapshot } from "@/lib/admin/neejee-pilot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) {
    return unauthorized;
  }

  return NextResponse.json(
    {
      ok: true,
      snapshot: getNeejeePilotControlSnapshot(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}