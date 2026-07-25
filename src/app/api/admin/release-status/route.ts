import { getWorkspaceDisplayName } from "@/lib/admin/workspace-branding";
import { adminError, adminJson, adminUnauthorized } from "@/lib/admin-api";
import { requireAdmin } from "@/lib/admin-route";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AnyClient = any;

function hasEnv(name: string): boolean {
  const value = process.env[name];
  return Boolean(value && value.trim().length > 0);
}

function getServiceClient(): AnyClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function getCount(
  client: AnyClient,
  table: string,
  configure?: (query: any) => any,
): Promise<number | null> {
  try {
    let query = client.from(table).select("*", { count: "exact", head: true });
    if (configure) {
      query = configure(query);
    }

    const { count, error } = await query;
    if (error) {
      return null;
    }

    return typeof count === "number" ? count : null;
  } catch {
    return null;
  }
}

async function getLatestTimestamp(
  client: AnyClient,
  table: string,
  column: string,
  configure?: (query: any) => any,
): Promise<string | null> {
  try {
    let query = client.from(table).select(column).order(column, { ascending: false }).limit(1);
    if (configure) {
      query = configure(query);
    }

    const { data, error } = await query;
    if (error || !Array.isArray(data) || data.length === 0) {
      return null;
    }

    const value = data[0]?.[column];
    return typeof value === "string" ? value : null;
  } catch {
    return null;
  }
}

async function getActiveContext(client: AnyClient): Promise<{
  tenantId: string | null;
  brandId: string | null;
  workspaceId: string | null;
  source: string | null;
}> {
  try {
    const { data, error } = await client
      .from("workspace_settings")
      .select("tenant_id, brand_id, workspace_id, updated_at")
      .order("updated_at", { ascending: false })
      .limit(1);

    if (error || !Array.isArray(data) || data.length === 0) {
      return {
        tenantId: null,
        brandId: null,
        workspaceId: null,
        source: null,
      };
    }

    const row = data[0] ?? {};

    return {
      tenantId: row.tenant_id ?? null,
      brandId: row.brand_id ?? null,
      workspaceId: row.workspace_id ?? null,
      source: "workspace_settings",
    };
  } catch {
    return {
      tenantId: null,
      brandId: null,
      workspaceId: null,
      source: null,
    };
  }
}

export async function GET(request: Request) {
  const adminAuthError = requireAdmin(request);
  if (adminAuthError) return adminAuthError;
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: hasEnv("NEXT_PUBLIC_SUPABASE_URL"),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: hasEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    SUPABASE_SERVICE_ROLE_KEY: hasEnv("SUPABASE_SERVICE_ROLE_KEY"),
    ADMIN_PASSWORD: hasEnv("ADMIN_PASSWORD"),
  };

  const links = {
    admin: "/admin",
    settings: "/admin/settings",
    ops: "/admin/ops",
  };

  const client = getServiceClient();

  if (!client) {
    return NextResponse.json(
      {
        ok: true,
        generatedAt: new Date().toISOString(),
        activeContext: {
          tenantId: null,
          brandId: null,
          workspaceId: null,
          source: null,
        },
        counts: {
          activeNotes: null,
          archivedNotes: null,
          workspaceSettings: null,
          settingVersions: null,
          recentAuditEvents: null,
        },
        latestActivity: {
          notes: null,
          settings: null,
          versions: null,
          audit: null,
        },
        env,
        links,
        warnings: ["SUPABASE_SERVICE_ROLE_KEY and/or NEXT_PUBLIC_SUPABASE_URL missing."],
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const sevenDaysAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    activeContext,
    activeNotes,
    archivedNotes,
    workspaceSettings,
    settingVersions,
    recentAuditEvents,
    latestNotes,
    latestSettings,
    latestVersions,
    latestAudit,
  ] = await Promise.all([
    getActiveContext(client),
    getCount(client, "workspace_notes", (query) => query.is("archived_at", null)),
    getCount(client, "workspace_notes", (query) => query.not("archived_at", "is", null)),
    getCount(client, "workspace_settings"),
    getCount(client, "workspace_setting_versions"),
    getCount(client, "admin_audit_events", (query) => query.gte("created_at", sevenDaysAgoIso)),
    getLatestTimestamp(client, "workspace_notes", "updated_at"),
    getLatestTimestamp(client, "workspace_settings", "updated_at"),
    getLatestTimestamp(client, "workspace_setting_versions", "created_at"),
    getLatestTimestamp(client, "admin_audit_events", "created_at"),
  ]);

  return NextResponse.json(
    {
      ok: true,
      generatedAt: new Date().toISOString(),
      activeContext,
      counts: {
        activeNotes,
        archivedNotes,
        workspaceSettings,
        settingVersions,
        recentAuditEvents,
      },
      latestActivity: {
        notes: latestNotes,
        settings: latestSettings,
        versions: latestVersions,
        audit: latestAudit,
      },
      env,
      links,
      warnings: [],
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
