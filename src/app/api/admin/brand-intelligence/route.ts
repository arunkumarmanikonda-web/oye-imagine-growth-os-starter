import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import {
  getNeejeeBrandIntelligenceSnapshotLive,
  saveNeejeeBrandIntelligenceSnapshotLive,
} from "@/lib/admin/neejee-live";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const snapshot = await getNeejeeBrandIntelligenceSnapshotLive();

  return NextResponse.json(
    {
      ok: true,
      snapshot,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function PUT(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid JSON body",
      },
      { status: 400 }
    );
  }

  if (!isRecord(body)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Expected an object body",
      },
      { status: 400 }
    );
  }

  const snapshot = await saveNeejeeBrandIntelligenceSnapshotLive(body);

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
    }
  );
}