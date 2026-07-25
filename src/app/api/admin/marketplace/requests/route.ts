import { getWorkspaceDisplayName } from "@/lib/admin/workspace-branding";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-route";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
const workspaceDisplayName = getWorkspaceDisplayName();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestStatusSchema = z.enum([
  "submitted",
  "reviewing",
  "proposed",
  "assigned",
  "closed",
  "rejected",
]);

const UpdateRequestSchema = z.object({
  id: z.string().uuid(),
  status: RequestStatusSchema,
  specialistSlug: z.string().min(2).optional().nullable(),
});

type MarketplaceAdminClient = ReturnType<typeof createSupabaseAdminClient>;

async function appendEvent(
  supabase: MarketplaceAdminClient,
  requestId: string,
  eventType: string,
  payload: Record<string, unknown>,
  proposalId?: string | null,
) {
  const { error } = await supabase.from("marketplace_request_events").insert({
    request_id: requestId,
    proposal_id: proposalId ?? null,
    event_type: eventType,
    actor: "admin",
    payload,
  });

  if (error) {
    throw new Error(`Failed to insert marketplace event: ${error.message}`);
  }
}

async function resolveSpecialist(
  supabase: MarketplaceAdminClient,
  specialistSlug: string | null,
) {
  if (!specialistSlug) {
    return {
      specialist_id: null,
      assigned_specialist_slug: null,
      assigned_specialist_name: null,
    };
  }

  const { data, error } = await supabase
    .from("marketplace_specialists")
    .select("id, slug, full_name")
    .eq("slug", specialistSlug)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Specialist not found.");
  }

  return {
    specialist_id: data.id,
    assigned_specialist_slug: data.slug,
    assigned_specialist_name: data.full_name,
  };
}

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const supabase = createSupabaseAdminClient();
    const id = new URL(request.url).searchParams.get("id")?.trim();

    let query = supabase
      .from("marketplace_requests")
      .select(
        "id, service_slug, full_name, email, company_name, phone, website, budget_range, brief, status, created_at, assigned_specialist_slug, assigned_specialist_name"
      )
      .order("created_at", { ascending: false });

    if (id) {
      const { data, error } = await query.eq("id", id).maybeSingle();

      if (error) {
        return NextResponse.json(
          { ok: false, error: "Failed to load marketplace request.", detail: error.message },
          { status: 500, headers: { "Cache-Control": "no-store" } }
        );
      }

      if (!data) {
        return NextResponse.json(
          { ok: false, error: "Marketplace request not found." },
          { status: 404, headers: { "Cache-Control": "no-store" } }
        );
      }

      return NextResponse.json(
        { ok: true,
      workspaceDisplayName, request: data },
        { status: 200, headers: { "Cache-Control": "no-store" } }
      );
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { ok: false, error: "Failed to load marketplace requests.", detail: error.message },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { ok: true, requests: data ?? [] },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to load marketplace requests.",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function PUT(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const raw = await request.json();
    const parsed = UpdateRequestSchema.parse({
      id: raw?.id,
      status: raw?.status,
      specialistSlug: raw?.specialistSlug ?? null,
    });

    const supabase = createSupabaseAdminClient();
    const specialistFields = await resolveSpecialist(
      supabase,
      parsed.specialistSlug ?? null,
    );

    const payload: Record<string, unknown> = {
      status: parsed.status,
      updated_at: new Date().toISOString(),
      assigned_specialist_id: specialistFields.specialist_id,
      assigned_specialist_slug: specialistFields.assigned_specialist_slug,
      assigned_specialist_name: specialistFields.assigned_specialist_name,
    };

    const { data, error } = await supabase
      .from("marketplace_requests")
      .update(payload)
      .eq("id", parsed.id)
      .select(
        "id, status, updated_at, assigned_specialist_slug, assigned_specialist_name"
      )
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { ok: false, error: "Failed to update marketplace request.", detail: error.message },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (!data) {
      return NextResponse.json(
        { ok: false, error: "Marketplace request not found." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    const eventType =
      data.status === "closed"
        ? "request_closed"
        : data.status === "assigned"
          ? "request_assigned"
          : "request_status_changed";

    await appendEvent(
      supabase,
      data.id,
      eventType,
      {
        status: data.status,
        assigned_specialist_slug: data.assigned_specialist_slug ?? null,
        assigned_specialist_name: data.assigned_specialist_name ?? null,
      },
      null,
    );

    return NextResponse.json(
      { ok: true, request: data },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Invalid request body.", issues: error.issues },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: "Failed to update marketplace request.",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}