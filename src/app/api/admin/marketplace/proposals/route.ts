import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CreateProposalSchema = z.object({
  requestId: z.string().uuid(),
  specialistSlug: z.string().min(2).optional().nullable(),
  title: z.string().min(3),
  scopeSummary: z.string().min(10),
  deliverables: z.array(z.string().min(2)).min(1).max(12),
  priceInr: z.coerce.number().int().positive(),
  timelineDays: z.coerce.number().int().positive(),
  notes: z.string().optional().nullable(),
});

const UpdateProposalSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["accepted", "rejected"]),
  notes: z.string().optional().nullable(),
});

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

function normalizeDeliverables(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item ?? "").trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value.split(/\r?\n|,/g).map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const supabase = getAdminClient();
    const url = new URL(request.url);
    const requestId = url.searchParams.get("requestId")?.trim();
    const id = url.searchParams.get("id")?.trim();

    let query = supabase
      .from("marketplace_proposals")
      .select("*")
      .order("created_at", { ascending: false });

    if (id) {
      const { data, error } = await query.eq("id", id).maybeSingle();

      if (error) {
        return NextResponse.json(
          { ok: false, error: "Failed to load proposal.", detail: error.message },
          { status: 500, headers: { "Cache-Control": "no-store" } }
        );
      }

      if (!data) {
        return NextResponse.json(
          { ok: false, error: "Proposal not found." },
          { status: 404, headers: { "Cache-Control": "no-store" } }
        );
      }

      return NextResponse.json(
        { ok: true, proposal: data },
        { status: 200, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (requestId) {
      query = query.eq("request_id", requestId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { ok: false, error: "Failed to load proposals.", detail: error.message },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { ok: true, proposals: data ?? [] },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to load proposals.",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const raw = await request.json();

    const parsed = CreateProposalSchema.parse({
      requestId: raw?.requestId,
      specialistSlug: raw?.specialistSlug ?? null,
      title: raw?.title,
      scopeSummary: raw?.scopeSummary,
      deliverables: normalizeDeliverables(raw?.deliverables),
      priceInr: raw?.priceInr,
      timelineDays: raw?.timelineDays,
      notes: raw?.notes ?? null,
    });

    const supabase = getAdminClient();

    const { data: existingRequest, error: requestError } = await supabase
      .from("marketplace_requests")
      .select("id")
      .eq("id", parsed.requestId)
      .maybeSingle();

    if (requestError) {
      return NextResponse.json(
        { ok: false, error: "Failed to validate marketplace request.", detail: requestError.message },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (!existingRequest) {
      return NextResponse.json(
        { ok: false, error: "Marketplace request not found." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    let specialistId: string | null = null;
    let specialistSlug: string | null = null;
    let specialistName: string | null = null;

    if (parsed.specialistSlug) {
      const { data: specialist, error: specialistError } = await supabase
        .from("marketplace_specialists")
        .select("id, slug, full_name")
        .eq("slug", parsed.specialistSlug)
        .eq("active", true)
        .maybeSingle();

      if (specialistError) {
        return NextResponse.json(
          { ok: false, error: "Failed to validate specialist.", detail: specialistError.message },
          { status: 500, headers: { "Cache-Control": "no-store" } }
        );
      }

      if (!specialist) {
        return NextResponse.json(
          { ok: false, error: "Specialist not found." },
          { status: 404, headers: { "Cache-Control": "no-store" } }
        );
      }

      specialistId = specialist.id;
      specialistSlug = specialist.slug;
      specialistName = specialist.full_name;
    }

    const { data: createdProposal, error: insertError } = await supabase
      .from("marketplace_proposals")
      .insert({
        request_id: parsed.requestId,
        specialist_id: specialistId,
        specialist_slug: specialistSlug,
        specialist_name: specialistName,
        title: parsed.title.trim(),
        scope_summary: parsed.scopeSummary.trim(),
        deliverables: parsed.deliverables,
        price_inr: parsed.priceInr,
        timeline_days: parsed.timelineDays,
        notes: parsed.notes ? parsed.notes.trim() : null,
        status: "sent",
      })
      .select("*")
      .single();

    if (insertError) {
      return NextResponse.json(
        { ok: false, error: "Failed to create proposal.", detail: insertError.message },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    const updatePayload: Record<string, unknown> = {
      status: "proposed",
      updated_at: new Date().toISOString(),
    };

    if (specialistId) {
      updatePayload.assigned_specialist_id = specialistId;
      updatePayload.assigned_specialist_slug = specialistSlug;
      updatePayload.assigned_specialist_name = specialistName;
    }

    const { error: updateError } = await supabase
      .from("marketplace_requests")
      .update(updatePayload)
      .eq("id", parsed.requestId);

    if (updateError) {
      return NextResponse.json(
        { ok: false, error: "Proposal created but request update failed.", detail: updateError.message },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { ok: true, proposal: createdProposal },
      { status: 201, headers: { "Cache-Control": "no-store" } }
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
        error: "Failed to create proposal.",
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

    const parsed = UpdateProposalSchema.parse({
      id: raw?.id,
      status: raw?.status,
      notes: raw?.notes ?? null,
    });

    const supabase = getAdminClient();

    const { data: existingProposal, error: proposalError } = await supabase
      .from("marketplace_proposals")
      .select("*")
      .eq("id", parsed.id)
      .maybeSingle();

    if (proposalError) {
      return NextResponse.json(
        { ok: false, error: "Failed to load proposal.", detail: proposalError.message },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (!existingProposal) {
      return NextResponse.json(
        { ok: false, error: "Proposal not found." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    const mergedNotes = [existingProposal.notes, parsed.notes].filter(Boolean).join("\n").trim() || null;

    const { data: updatedProposal, error: updateProposalError } = await supabase
      .from("marketplace_proposals")
      .update({
        status: parsed.status,
        notes: mergedNotes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsed.id)
      .select("*")
      .single();

    if (updateProposalError) {
      return NextResponse.json(
        { ok: false, error: "Failed to update proposal.", detail: updateProposalError.message },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (parsed.status === "accepted") {
      await supabase
        .from("marketplace_proposals")
        .update({
          status: "rejected",
          updated_at: new Date().toISOString(),
        })
        .eq("request_id", existingProposal.request_id)
        .neq("id", existingProposal.id)
        .in("status", ["draft", "sent"]);

      const { error: updateRequestError } = await supabase
        .from("marketplace_requests")
        .update({
          status: "assigned",
          assigned_specialist_id: existingProposal.specialist_id,
          assigned_specialist_slug: existingProposal.specialist_slug,
          assigned_specialist_name: existingProposal.specialist_name,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingProposal.request_id);

      if (updateRequestError) {
        return NextResponse.json(
          { ok: false, error: "Proposal updated but request assignment failed.", detail: updateRequestError.message },
          { status: 500, headers: { "Cache-Control": "no-store" } }
        );
      }
    }

    if (parsed.status === "rejected") {
      const { data: openProposals } = await supabase
        .from("marketplace_proposals")
        .select("id")
        .eq("request_id", existingProposal.request_id)
        .in("status", ["draft", "sent", "accepted"]);

      const shouldClose = !openProposals || openProposals.length === 0;

      const { error: updateRequestError } = await supabase
        .from("marketplace_requests")
        .update({
          status: shouldClose ? "closed" : "proposed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingProposal.request_id);

      if (updateRequestError) {
        return NextResponse.json(
          { ok: false, error: "Proposal updated but request status refresh failed.", detail: updateRequestError.message },
          { status: 500, headers: { "Cache-Control": "no-store" } }
        );
      }
    }

    return NextResponse.json(
      { ok: true, proposal: updatedProposal },
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
        error: "Failed to update proposal.",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}