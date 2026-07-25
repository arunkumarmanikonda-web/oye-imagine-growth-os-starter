import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { getNeejeePilotControlSnapshotLive } from "@/lib/admin/neejee-live";

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
      snapshot: await getNeejeePilotControlSnapshotLive(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}