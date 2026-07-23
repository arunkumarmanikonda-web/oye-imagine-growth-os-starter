import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_STATUSES = new Set(["submitted", "reviewing", "assigned", "closed", "rejected"]);

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(request: Request) {
  const adminAuthError = requireAdmin(request);
  if (adminAuthError) return adminAuthError;

  try {
    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("marketplace_requests")
      .select("id, service_slug, full_name, email, company_name, budget_range, brief, status, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(
      { ok: true, requests: data ?? [] },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to load marketplace requests.",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export async function PUT(request: Request) {
  const adminAuthError = requireAdmin(request);
  if (adminAuthError) return adminAuthError;

  try {
    const body = await request.json().catch(() => null);
    const id = text(body?.id);
    const status = text(body?.status);

    if (!id || !ALLOWED_STATUSES.has(status)) {
      return NextResponse.json(
        { ok: false, error: "Valid id and status are required." },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("marketplace_requests")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, status, updated_at")
      .limit(1);

    if (error) throw error;

    return NextResponse.json(
      {
        ok: true,
        request: Array.isArray(data) && data.length > 0 ? data[0] : null,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to update request status.",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
