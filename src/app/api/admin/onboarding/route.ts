import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SectionId = "company_profile" | "goals" | "channels" | "brand";
type AnyClient = any;

const SECTION_KEY_MAP: Record<SectionId, string> = {
  company_profile: "onboarding.company_profile",
  goals: "onboarding.goals",
  channels: "onboarding.channels",
  brand: "onboarding.brand",
};

const SECTION_IDS: SectionId[] = ["company_profile", "goals", "channels", "brand"];

const EMPTY_SECTIONS: Record<SectionId, unknown> = {
  company_profile: {
    businessName: "",
    industry: "",
    teamSize: "",
    website: "",
    primaryMarket: "",
  },
  goals: {
    primaryObjective: "",
    monthlyRevenueTarget: "",
    leadTarget: "",
    biggestChallenge: "",
    ninetyDayPriority: "",
  },
  channels: [],
  brand: {
    tone: "",
    audience: "",
    valueProposition: "",
    notes: "",
  },
};

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function getServiceClient(): AnyClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase environment configuration.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function getActiveContext(client: AnyClient): Promise<{
  tenantId: string | null;
  brandId: string | null;
  workspaceId: string | null;
}> {
  const settingsResult = await client
    .from("workspace_settings")
    .select("tenant_id, brand_id, workspace_id, updated_at")
    .order("updated_at", { ascending: false })
    .limit(1);

  if (!settingsResult.error && Array.isArray(settingsResult.data) && settingsResult.data.length > 0) {
    const row = settingsResult.data[0];
    return {
      tenantId: row.tenant_id ?? null,
      brandId: row.brand_id ?? null,
      workspaceId: row.workspace_id ?? null,
    };
  }

  const versionsResult = await client
    .from("workspace_setting_versions")
    .select("tenant_id, brand_id, workspace_id, created_at")
    .order("created_at", { ascending: false })
    .limit(1);

  if (!versionsResult.error && Array.isArray(versionsResult.data) && versionsResult.data.length > 0) {
    const row = versionsResult.data[0];
    return {
      tenantId: row.tenant_id ?? null,
      brandId: row.brand_id ?? null,
      workspaceId: row.workspace_id ?? null,
    };
  }

  return {
    tenantId: null,
    brandId: null,
    workspaceId: null,
  };
}

function isPresent(value: unknown): boolean {
  if (value === null || typeof value === "undefined") return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return true;
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.some((item) => isPresent(item));
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).some((item) => isPresent(item));
  }
  return false;
}

function buildSummary(sections: Record<SectionId, unknown>) {
  const totalSections = SECTION_IDS.length;
  const completedSections = SECTION_IDS.filter((sectionId) => isPresent(sections[sectionId])).length;
  const percentComplete = totalSections === 0 ? 0 : Math.round((completedSections / totalSections) * 100);

  return {
    completedSections,
    totalSections,
    percentComplete,
  };
}

function normalizeSections(rows: Array<{ key: string; value: unknown }>): Record<SectionId, unknown> {
  const result = deepClone(EMPTY_SECTIONS);

  for (const sectionId of SECTION_IDS) {
    const key = SECTION_KEY_MAP[sectionId];
    const match = rows.find((row) => row.key === key);
    if (match) {
      result[sectionId] = match.value;
    }
  }

  return result;
}

async function loadSections(client: AnyClient, workspaceId: string) {
  const { data, error } = await client
    .from("workspace_settings")
    .select("id, key, value, created_at, updated_at")
    .eq("workspace_id", workspaceId)
    .in("key", Object.values(SECTION_KEY_MAP))
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  const rows = Array.isArray(data) ? data : [];
  const sections = normalizeSections(rows);

  return {
    rows,
    sections,
    summary: buildSummary(sections),
  };
}

function normalizeIncomingSection(section: unknown): SectionId | null {
  if (section === "company_profile") return "company_profile";
  if (section === "goals") return "goals";
  if (section === "channels") return "channels";
  if (section === "brand") return "brand";
  return null;
}

export async function GET() {
  try {
    const client = getServiceClient();
    const activeContext = await getActiveContext(client);

    if (!activeContext.workspaceId) {
      return NextResponse.json(
        {
          ok: true,
          activeContext,
          sections: deepClone(EMPTY_SECTIONS),
          summary: buildSummary(deepClone(EMPTY_SECTIONS)),
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const payload = await loadSections(client, activeContext.workspaceId);

    return NextResponse.json(
      {
        ok: true,
        activeContext,
        sections: payload.sections,
        summary: payload.summary,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to load onboarding data.",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const section = normalizeIncomingSection(body?.section);
    const value = body?.value;

    if (!section) {
      return NextResponse.json(
        { ok: false, error: "Invalid onboarding section." },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const client = getServiceClient();
    const activeContext = await getActiveContext(client);

    if (!activeContext.workspaceId) {
      return NextResponse.json(
        { ok: false, error: "No active workspace context found." },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const workspaceId = activeContext.workspaceId;
    const tenantId = activeContext.tenantId;
    const brandId = activeContext.brandId;
    const key = SECTION_KEY_MAP[section];
    const actorEmail = process.env.ADMIN_EMAIL ?? "admin@oyeimagine.com";

    const existingResult = await client
      .from("workspace_settings")
      .select("id, key")
      .eq("workspace_id", workspaceId)
      .eq("key", key)
      .limit(1);

    if (existingResult.error) {
      throw existingResult.error;
    }

    const existingRow = Array.isArray(existingResult.data) && existingResult.data.length > 0 ? existingResult.data[0] : null;
    let settingId: string | null = null;
    let action: "created" | "updated" = existingRow ? "updated" : "created";

    if (existingRow?.id) {
      const updateResult = await client
        .from("workspace_settings")
        .update({
          value,
          updated_by_email: actorEmail,
        })
        .eq("id", existingRow.id)
        .select("id")
        .limit(1);

      if (updateResult.error) {
        throw updateResult.error;
      }

      settingId = Array.isArray(updateResult.data) && updateResult.data.length > 0 ? updateResult.data[0].id : existingRow.id;
    } else {
      const insertResult = await client
        .from("workspace_settings")
        .insert({
          tenant_id: tenantId,
          brand_id: brandId,
          workspace_id: workspaceId,
          key,
          value,
          created_by_email: actorEmail,
          updated_by_email: actorEmail,
        })
        .select("id")
        .limit(1);

      if (insertResult.error) {
        throw insertResult.error;
      }

      settingId = Array.isArray(insertResult.data) && insertResult.data.length > 0 ? insertResult.data[0].id : null;
    }

    if (!settingId) {
      throw new Error("Failed to resolve onboarding setting id.");
    }

    const versionResult = await client.from("workspace_setting_versions").insert({
      tenant_id: tenantId,
      brand_id: brandId,
      workspace_id: workspaceId,
      workspace_setting_id: settingId,
      key,
      action,
      value,
      actor_email: actorEmail,
    });

    if (versionResult.error) {
      throw versionResult.error;
    }

    const auditResult = await client.from("admin_audit_events").insert({
      action: "admin_workspace_onboarding_saved",
      actor_email: actorEmail,
      target_type: "workspace",
      target_id: workspaceId,
      payload: {
        section,
        key,
        settingId,
        action,
      },
    });

    if (auditResult.error) {
      throw auditResult.error;
    }

    const payload = await loadSections(client, workspaceId);

    return NextResponse.json(
      {
        ok: true,
        activeContext,
        sections: payload.sections,
        summary: payload.summary,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to save onboarding data.",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}