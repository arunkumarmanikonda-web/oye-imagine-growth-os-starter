import { getWorkspaceDisplayName } from "@/lib/admin/workspace-branding";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
const workspaceDisplayName = getWorkspaceDisplayName();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RequestBody = {
  serviceId?: string;
  serviceSlug?: string;
  fullName?: string;
  email?: string;
  companyName?: string;
  phone?: string;
  website?: string;
  budgetRange?: string;
  brief?: string;
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidUrl(value: string): boolean {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as RequestBody | null;

    const serviceId = text(body?.serviceId);
    const serviceSlug = text(body?.serviceSlug);
    const fullName = text(body?.fullName);
    const email = text(body?.email).toLowerCase();
    const companyName = text(body?.companyName);
    const phone = text(body?.phone);
    const website = text(body?.website);
    const budgetRange = text(body?.budgetRange);
    const brief = text(body?.brief);

    if (!fullName || !email || !brief) {
      return NextResponse.json(
        { ok: false, error: "fullName, email and brief are required." },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "Invalid email address." },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    if (!isValidUrl(website)) {
      return NextResponse.json(
        { ok: false, error: "website must be a valid http(s) URL." },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const supabase = createSupabaseAdminClient();

    let resolvedServiceId: string | null = null;
    let resolvedServiceSlug: string | null = null;

    if (serviceId || serviceSlug) {
      let lookup = supabase
        .from("marketplace_services")
        .select("id, slug")
        .eq("active", true);

      if (serviceId) {
        lookup = lookup.eq("id", serviceId);
      } else {
        lookup = lookup.eq("slug", serviceSlug);
      }

      const { data: serviceRows, error: serviceError } = await lookup.limit(1);

      if (serviceError) throw serviceError;

      const service = Array.isArray(serviceRows) && serviceRows.length > 0 ? serviceRows[0] : null;

      if (!service) {
        return NextResponse.json(
          { ok: false, error: "Selected service was not found." },
          { status: 400, headers: { "Cache-Control": "no-store" } },
        );
      }

      resolvedServiceId = service.id;
      resolvedServiceSlug = service.slug;
    }

    const insertPayload = {
      service_id: resolvedServiceId,
      service_slug: resolvedServiceSlug,
      full_name: fullName,
      email,
      company_name: companyName || null,
      phone: phone || null,
      website: website || null,
      budget_range: budgetRange || null,
      brief,
      status: "submitted",
      source: "marketplace",
    };

    const { data, error } = await supabase
      .from("marketplace_requests")
      .insert(insertPayload)
      .select("id, status, created_at")
      .limit(1);

    if (error) throw error;

    const row = Array.isArray(data) && data.length > 0 ? data[0] : null;

    return NextResponse.json(
      {
        ok: true,
      workspaceDisplayName,
        request: row,
        message: "Marketplace request submitted.",
      },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to submit marketplace request.",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
