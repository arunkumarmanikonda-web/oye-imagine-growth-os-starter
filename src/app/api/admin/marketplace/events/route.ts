import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getAdminClient() {
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function requireAdmin(request: NextRequest) {
  const configured = String(process.env.ADMIN_SECRET ?? "").trim();

  if (!configured) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized", detail: "No admin secret configured in environment." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const supplied = request.headers.get("x-admin-secret")?.trim();

  if (!supplied || supplied !== configured) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  return null;
}

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const supabase = getAdminClient();
    const url = new URL(request.url);
    const requestId = url.searchParams.get("requestId")?.trim();
    const proposalId = url.searchParams.get("proposalId")?.trim();

    let query = supabase
      .from("marketplace_request_events")
      .select("*")
      .order("created_at", { ascending: false });

    if (requestId) {
      query = query.eq("request_id", requestId);
    }

    if (proposalId) {
      query = query.eq("proposal_id", proposalId);
    }

    const { data, error } = await query.limit(100);

    if (error) {
      return NextResponse.json(
        { ok: false, error: "Failed to load marketplace events.", detail: error.message },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { ok: true, events: data ?? [] },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to load marketplace events.",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}