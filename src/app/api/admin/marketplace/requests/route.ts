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
      .select(
        "id, service_slug, full_name, email, company_name, budget_range, brief, status, created_at, assigned_specialist_slug, assigned_specialist_name"
      )
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
    const hasSpecialistSlug = Boolean(body && Object.prototype.hasOwnProperty.call(body, "specialistSlug"));
    const specialistSlug = text(body?.specialistSlug);

    if (!id || !ALLOWED_STATUSES.has(status)) {
      return NextResponse.json(
        { ok: false, error: "Valid id and status are required." },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const supabase = createSupabaseAdminClient();

    const updatePayload: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (hasSpecialistSlug) {
      if (!specialistSlug) {
        updatePayload.assigned_specialist_id = null;
        updatePayload.assigned_specialist_slug = null;
        updatePayload.assigned_specialist_name = null;
      } else {
        const { data: specialists, error: specialistError } = await supabase
          .from("marketplace_specialists")
          .select("id, slug, full_name")
          .eq("active", true)
          .eq("slug", specialistSlug)
          .limit(1);

        if (specialistError) throw specialistError;

        const specialist = Array.isArray(specialists) && specialists.length > 0 ? specialists[0] : null;

        if (!specialist) {
          return NextResponse.json(
            { ok: false, error: "Selected specialist was not found." },
            { status: 400, headers: { "Cache-Control": "no-store" } },
          );
        }

        updatePayload.assigned_specialist_id = specialist.id;
        updatePayload.assigned_specialist_slug = specialist.slug;
        updatePayload.assigned_specialist_name = specialist.full_name;
      }
    }

    const { data, error } = await supabase
      .from("marketplace_requests")
      .update(updatePayload)
      .eq("id", id)
      .select("id, status, updated_at, assigned_specialist_slug, assigned_specialist_name")
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