import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { getNeejeeBrandIntelligenceSnapshot } from "@/lib/admin/brand-intelligence-seed";

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