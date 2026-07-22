import { adminJson, adminError, adminUnauthorized } from "@/lib/admin-api";
import { requireAdmin } from "@/lib/admin-route";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

type ActiveContext = {
  tenantId: string;
  tenantName: string;
  tenantSlug: string | null;
  brandId: string | null;
  brandName: string | null;
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string | null;
};

type SettingRow = {
  id: string;
  key: string;
  value: unknown;
  created_by_email: string | null;
  updated_by_email: string | null;
  created_at: string;
  updated_at: string;
};

type SettingVersionRow = {
  id: string;
  workspace_setting_id: string | null;
  key: string;
  action: "created" | "updated" | "deleted" | "restored";
  value: unknown;
  actor_email: string | null;
  created_at: string;
};

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error("Missing environment variable: " + name);
  }
  return value;
}

async function createAuthClient() {
  const cookieStore = await cookies();

  return createServerClient(
    getEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: any }>) {
          try {
            for (const cookie of cookiesToSet) {
              cookieStore.set(cookie.name, cookie.value, cookie.options);
            }
          } catch {
            // ignored
          }
        },
      },
    }
  );
}

function createServiceClient() {
  return createClient(
    getEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

async function requireUser() {
  const authClient = await createAuthClient();
  const {
    data: { user },
    error,
  } = await authClient.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

async function getActiveContext(
  serviceClient: ReturnType<typeof createServiceClient>
): Promise<ActiveContext | null> {
  const cookieStore = await cookies();
  const workspaceId = cookieStore.get("oye_admin_workspace_id")?.value;

  if (!workspaceId) {
    return null;
  }

  const { data: workspace, error: workspaceError } = await serviceClient
    .from("workspaces")
    .select("id, name, slug, tenant_id, brand_id")
    .eq("id", workspaceId)
    .single();

  if (workspaceError || !workspace) {
    return null;
  }

  const { data: tenant } = await serviceClient
    .from("tenants")
    .select("id, display_name, slug")
    .eq("id", workspace.tenant_id)
    .single();

  let brandName: string | null = null;

  if (workspace.brand_id) {
    const { data: brand } = await serviceClient
      .from("brands")
      .select("id, name")
      .eq("id", workspace.brand_id)
      .single();

    brandName = brand?.name ?? null;
  }

  return {
    tenantId: workspace.tenant_id,
    tenantName: tenant?.display_name ?? "Unknown Tenant",
    tenantSlug: tenant?.slug ?? null,
    brandId: workspace.brand_id ?? null,
    brandName,
    workspaceId: workspace.id,
    workspaceName: workspace.name,
    workspaceSlug: workspace.slug ?? null,
  };
}

function isValidKey(key: string): boolean {
  return /^[a-zA-Z0-9._-]{1,120}$/.test(key);
}

function normalizeLimit(value: string | null, fallback: number, max: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(Math.floor(parsed), max);
}

function normalizeVersionAction(
  value: string | null
): "created" | "updated" | "deleted" | "restored" | null {
  if (value === "created" || value === "updated" || value === "deleted" || value === "restored") {
    return value;
  }
  return null;
}

async function writeAudit(
  serviceClient: ReturnType<typeof createServiceClient>,
  user: { id: string; email?: string | null },
  active: ActiveContext,
  action: string,
  payload: Record<string, unknown>
) {
  const { error } = await serviceClient.from("admin_audit_events").insert({
    actor_user_id: user.id,
    actor_email: user.email ?? null,
    action,
    target_type: "workspace",
    target_id: active.workspaceId,
    tenant_id: active.tenantId,
    brand_id: active.brandId,
    workspace_id: active.workspaceId,
    payload,
  });

  if (error) {
    throw new Error("Failed to write admin audit event: " + error.message);
  }
}

async function writeVersion(
  serviceClient: ReturnType<typeof createServiceClient>,
  user: { id: string; email?: string | null },
  active: ActiveContext,
  params: {
    workspaceSettingId: string | null;
    key: string;
    action: "created" | "updated" | "deleted" | "restored";
    value: unknown;
  }
) {
  const { error } = await serviceClient.from("workspace_setting_versions").insert({
    tenant_id: active.tenantId,
    brand_id: active.brandId,
    workspace_id: active.workspaceId,
    workspace_setting_id: params.workspaceSettingId,
    key: params.key,
    action: params.action,
    value: params.value,
    actor_user_id: user.id,
    actor_email: user.email ?? null,
  });

  if (error) {
    throw new Error("Failed to write workspace setting version: " + error.message);
  }
}

export async function GET(request: NextRequest) {
  const adminAuthError = requireAdmin(request);
  if (adminAuthError) {
    return adminAuthError;
  }
  try {
    const user = await requireUser();

    if (!user) {
      return adminJson({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const serviceClient = createServiceClient();
    const active = await getActiveContext(serviceClient);

    if (!active) {
      return adminJson(
        { ok: false, error: "No active admin workspace selected" },
        { status: 400 }
      );
    }

    const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
    const versionAction = normalizeVersionAction(request.nextUrl.searchParams.get("versionAction"));
    const settingsLimit = normalizeLimit(request.nextUrl.searchParams.get("settingsLimit"), 25, 200);
    const versionsLimit = normalizeLimit(request.nextUrl.searchParams.get("versionsLimit"), 30, 200);

    let settingsQuery = serviceClient
      .from("workspace_settings")
      .select("id, key, value, created_by_email, updated_by_email, created_at, updated_at")
      .eq("workspace_id", active.workspaceId)
      .order("updated_at", { ascending: false })
      .limit(settingsLimit);

    if (q) {
      settingsQuery = settingsQuery.ilike("key", "%" + q + "%");
    }

    const { data: items, error: itemsError } = await settingsQuery;

    if (itemsError) {
      return adminJson({ ok: false, error: itemsError.message }, { status: 500 });
    }

    let versionsQuery = serviceClient
      .from("workspace_setting_versions")
      .select("id, workspace_setting_id, key, action, value, actor_email, created_at")
      .eq("workspace_id", active.workspaceId)
      .order("created_at", { ascending: false })
      .limit(versionsLimit);

    if (q) {
      versionsQuery = versionsQuery.ilike("key", "%" + q + "%");
    }

    if (versionAction) {
      versionsQuery = versionsQuery.eq("action", versionAction);
    }

    const { data: recentVersions, error: versionsError } = await versionsQuery;

    if (versionsError) {
      return adminJson({ ok: false, error: versionsError.message }, { status: 500 });
    }

    return adminJson({
      ok: true,
      active,
      filters: {
        q,
        versionAction,
        settingsLimit,
        versionsLimit,
      },
      items: (items ?? []) as SettingRow[],
      recentVersions: (recentVersions ?? []) as SettingVersionRow[],
    });
  } catch (error) {
    return adminJson(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const adminAuthError = requireAdmin(request);
  if (adminAuthError) {
    return adminAuthError;
  }
  try {
    const user = await requireUser();

    if (!user) {
      return adminJson({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const key = typeof body?.key === "string" ? body.key.trim() : "";
    const value = body?.value;

    if (!key || !isValidKey(key)) {
      return adminJson(
        { ok: false, error: "Invalid key. Use letters, numbers, dot, underscore, or dash." },
        { status: 400 }
      );
    }

    if (value === undefined) {
      return adminJson({ ok: false, error: "value is required" }, { status: 400 });
    }

    const serviceClient = createServiceClient();
    const active = await getActiveContext(serviceClient);

    if (!active) {
      return adminJson(
        { ok: false, error: "No active admin workspace selected" },
        { status: 400 }
      );
    }

    const { data: existing } = await serviceClient
      .from("workspace_settings")
      .select("id")
      .eq("workspace_id", active.workspaceId)
      .eq("key", key)
      .maybeSingle();

    const payload: Record<string, unknown> = {
      tenant_id: active.tenantId,
      brand_id: active.brandId,
      workspace_id: active.workspaceId,
      key,
      value,
      updated_by_user_id: user.id,
      updated_by_email: user.email ?? null,
    };

    if (!existing) {
      payload.created_by_user_id = user.id;
      payload.created_by_email = user.email ?? null;
    }

    const { data: row, error } = await serviceClient
      .from("workspace_settings")
      .upsert(payload, { onConflict: "workspace_id,key" })
      .select("id, key, value, created_by_email, updated_by_email, created_at, updated_at")
      .single();

    if (error) {
      return adminJson({ ok: false, error: error.message }, { status: 500 });
    }

    await writeVersion(
      serviceClient,
      { id: user.id, email: user.email },
      active,
      {
        workspaceSettingId: row.id,
        key,
        action: existing ? "updated" : "created",
        value,
      }
    );

    await writeAudit(
      serviceClient,
      { id: user.id, email: user.email },
      active,
      existing ? "admin_workspace_setting_updated" : "admin_workspace_setting_created",
      { key, settingId: row.id }
    );

    return adminJson({
      ok: true,
      active,
      item: row as SettingRow,
    });
  } catch (error) {
    return adminJson(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const adminAuthError = requireAdmin(request);
  if (adminAuthError) {
    return adminAuthError;
  }
  try {
    const user = await requireUser();

    if (!user) {
      return adminJson({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const versionId = typeof body?.versionId === "string" ? body.versionId : "";

    if (!versionId) {
      return adminJson({ ok: false, error: "versionId is required" }, { status: 400 });
    }

    const serviceClient = createServiceClient();
    const active = await getActiveContext(serviceClient);

    if (!active) {
      return adminJson(
        { ok: false, error: "No active admin workspace selected" },
        { status: 400 }
      );
    }

    const { data: version, error: versionError } = await serviceClient
      .from("workspace_setting_versions")
      .select("id, workspace_setting_id, key, action, value")
      .eq("id", versionId)
      .eq("workspace_id", active.workspaceId)
      .single();

    if (versionError || !version) {
      return adminJson({ ok: false, error: "Version not found" }, { status: 404 });
    }

    const { data: existing } = await serviceClient
      .from("workspace_settings")
      .select("id")
      .eq("workspace_id", active.workspaceId)
      .eq("key", version.key)
      .maybeSingle();

    const payload: Record<string, unknown> = {
      tenant_id: active.tenantId,
      brand_id: active.brandId,
      workspace_id: active.workspaceId,
      key: version.key,
      value: version.value,
      updated_by_user_id: user.id,
      updated_by_email: user.email ?? null,
    };

    if (!existing) {
      payload.created_by_user_id = user.id;
      payload.created_by_email = user.email ?? null;
    }

    const { data: row, error: restoreError } = await serviceClient
      .from("workspace_settings")
      .upsert(payload, { onConflict: "workspace_id,key" })
      .select("id, key, value, created_by_email, updated_by_email, created_at, updated_at")
      .single();

    if (restoreError) {
      return adminJson({ ok: false, error: restoreError.message }, { status: 500 });
    }

    await writeVersion(
      serviceClient,
      { id: user.id, email: user.email },
      active,
      {
        workspaceSettingId: row.id,
        key: row.key,
        action: "restored",
        value: row.value,
      }
    );

    await writeAudit(
      serviceClient,
      { id: user.id, email: user.email },
      active,
      "admin_workspace_setting_restored",
      {
        key: row.key,
        settingId: row.id,
        sourceVersionId: version.id,
      }
    );

    return adminJson({
      ok: true,
      active,
      item: row as SettingRow,
      restoredFromVersionId: version.id,
    });
  } catch (error) {
    return adminJson(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const adminAuthError = requireAdmin(request);
  if (adminAuthError) {
    return adminAuthError;
  }
  try {
    const user = await requireUser();

    if (!user) {
      return adminJson({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const id = typeof body?.id === "string" ? body.id : "";

    if (!id) {
      return adminJson({ ok: false, error: "id is required" }, { status: 400 });
    }

    const serviceClient = createServiceClient();
    const active = await getActiveContext(serviceClient);

    if (!active) {
      return adminJson(
        { ok: false, error: "No active admin workspace selected" },
        { status: 400 }
      );
    }

    const { data: existing, error: existingError } = await serviceClient
      .from("workspace_settings")
      .select("id, key, value")
      .eq("id", id)
      .eq("workspace_id", active.workspaceId)
      .single();

    if (existingError || !existing) {
      return adminJson({ ok: false, error: "Setting not found" }, { status: 404 });
    }

    await writeVersion(
      serviceClient,
      { id: user.id, email: user.email },
      active,
      {
        workspaceSettingId: null,
        key: existing.key,
        action: "deleted",
        value: existing.value,
      }
    );

    const { error: deleteError } = await serviceClient
      .from("workspace_settings")
      .delete()
      .eq("id", id)
      .eq("workspace_id", active.workspaceId);

    if (deleteError) {
      return adminJson({ ok: false, error: deleteError.message }, { status: 500 });
    }

    await writeAudit(
      serviceClient,
      { id: user.id, email: user.email },
      active,
      "admin_workspace_setting_deleted",
      { key: existing.key, settingId: existing.id }
    );

    return adminJson({
      ok: true,
      active,
      deletedId: existing.id,
      deletedKey: existing.key,
    });
  } catch (error) {
    return adminJson(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}