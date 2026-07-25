import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { getNeejeeBrandIntelligenceSnapshotLive } from "@/lib/admin/neejee-live";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const snapshot = getNeejeeBrandIntelligenceSnapshot();

  return NextResponse.json(
    {
      ok: true,
      snapshot,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}