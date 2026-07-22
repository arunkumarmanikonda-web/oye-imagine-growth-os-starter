import { requireAdmin } from "@/lib/admin-route";
import { adminJson, adminError, adminUnauthorized } from "@/lib/admin-api";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type ActiveContext = {
  tenantId: string | null;
  brandId: string | null;
  workspaceId: string | null;
};

type SettingRow = {
  id: string;
  tenant_id?: string | null;
  brand_id?: string | null;
  workspace_id: string;
  key: string;
  value: JsonValue;
  updated_at?: string | null;
};

type AuditRow = {
  id: string;
  action: string;
  target_type?: string | null;
  target_id?: string | null;
  payload?: JsonValue;
  created_at?: string | null;
};

const ONBOARDING_KEYS = [
  "onboarding.company_profile",
  "onboarding.goals",
  "onboarding.channels",
  "onboarding.brand",
] as const;

const STRATEGY_KEY = "strategy.generated_plan";
const EXECUTION_KEY = "execution.weekly_plan";

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function asRecord(value: JsonValue | undefined | null): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : String(item ?? "").trim()))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

async function resolveActiveContext(supabase: ReturnType<typeof createAdminClient>): Promise<ActiveContext> {
  const latestSetting = await supabase
    .from("workspace_settings")
    .select("tenant_id, brand_id, workspace_id")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latestSetting.error && latestSetting.data?.workspace_id) {
    return {
      tenantId: (latestSetting.data.tenant_id as string | null) ?? null,
      brandId: (latestSetting.data.brand_id as string | null) ?? null,
      workspaceId: latestSetting.data.workspace_id as string,
    };
  }

  const latestVersion = await supabase
    .from("workspace_setting_versions")
    .select("tenant_id, brand_id, workspace_id")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latestVersion.error && latestVersion.data?.workspace_id) {
    return {
      tenantId: (latestVersion.data.tenant_id as string | null) ?? null,
      brandId: (latestVersion.data.brand_id as string | null) ?? null,
      workspaceId: latestVersion.data.workspace_id as string,
    };
  }

  return {
    tenantId: null,
    brandId: null,
    workspaceId: null,
  };
}

async function loadSettings(
  supabase: ReturnType<typeof createAdminClient>,
  workspaceId: string,
  keys: string[],
) {
  const response = await supabase
    .from("workspace_settings")
    .select("id, tenant_id, brand_id, workspace_id, key, value, updated_at")
    .eq("workspace_id", workspaceId)
    .in("key", keys);

  if (response.error) {
    throw new Error(`workspace_settings lookup failed: ${response.error.message}`);
  }

  return (response.data ?? []) as SettingRow[];
}

async function countRows(
  supabase: ReturnType<typeof createAdminClient>,
  table: "workspace_settings" | "workspace_setting_versions" | "admin_audit_events",
  workspaceId: string,
) {
  const response = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId);

  if (response.error) {
    throw new Error(`${table} count failed: ${response.error.message}`);
  }

  return response.count ?? 0;
}

async function recentAuditEvents(
  supabase: ReturnType<typeof createAdminClient>,
  workspaceId: string,
) {
  const response = await supabase
    .from("admin_audit_events")
    .select("id, action, target_type, target_id, payload, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (response.error) {
    throw new Error(`admin_audit_events query failed: ${response.error.message}`);
  }

  return (response.data ?? []) as AuditRow[];
}

function executionSummary(execution: Record<string, unknown>) {
  const tasks = Array.isArray(execution.tasks) ? execution.tasks : [];
  const normalized = tasks.map((task) => asRecord(task as JsonValue));

  return {
    total: normalized.length,
    todo: normalized.filter((task) => asString(task.status).toLowerCase() === "todo").length,
    doing: normalized.filter((task) => asString(task.status).toLowerCase() === "doing").length,
    blocked: normalized.filter((task) => asString(task.status).toLowerCase() === "blocked").length,
    done: normalized.filter((task) => asString(task.status).toLowerCase() === "done").length,
  };
}

export async function GET(request: NextRequest) {
  try {
  const adminAuthError = requireAdmin(request);
  if (adminAuthError) {
    return adminAuthError;
  }

    const supabase = createAdminClient();
    const activeContext = await resolveActiveContext(supabase);

    if (!activeContext.workspaceId) {
      return adminJson({
        ok: true,
        activeContext,
        onboarding: {},
        strategy: {},
        execution: {},
        executionSummary: { total: 0, todo: 0, doing: 0, blocked: 0, done: 0 },
        counts: { settings: 0, versions: 0, audit: 0 },
        recentAudit: [],
        links: {
          admin: "/admin",
          onboarding: "/admin/onboarding",
          strategy: "/admin/strategy",
          execution: "/admin/execution",
          summary: "/admin/summary",
        },
      });
    }

    const settings = await loadSettings(
      supabase,
      activeContext.workspaceId,
      [...ONBOARDING_KEYS, STRATEGY_KEY, EXECUTION_KEY],
    );

    const map = new Map(settings.map((row) => [row.key, row]));

    const onboarding = {
      company_profile: asRecord(map.get("onboarding.company_profile")?.value),
      goals: asRecord(map.get("onboarding.goals")?.value),
      channels: asStringArray(map.get("onboarding.channels")?.value),
      brand: asRecord(map.get("onboarding.brand")?.value),
    };

    const strategy = asRecord(map.get(STRATEGY_KEY)?.value);
    const execution = asRecord(map.get(EXECUTION_KEY)?.value);

    const [settingsCount, versionsCount, auditCount, recentAudit] = await Promise.all([
      countRows(supabase, "workspace_settings", activeContext.workspaceId),
      countRows(supabase, "workspace_setting_versions", activeContext.workspaceId),
      countRows(supabase, "admin_audit_events", activeContext.workspaceId),
      recentAuditEvents(supabase, activeContext.workspaceId),
    ]);

    const latestUpdatedAt = settings
      .map((row) => row.updated_at)
      .filter(Boolean)
      .sort()
      .reverse()[0] ?? null;

    return adminJson({
      ok: true,
      activeContext,
      onboarding,
      strategy,
      execution,
      executionSummary: executionSummary(execution),
      counts: {
        settings: settingsCount,
        versions: versionsCount,
        audit: auditCount,
      },
      latestUpdatedAt,
      recentAudit,
      links: {
        admin: "/admin",
        onboarding: "/admin/onboarding",
        strategy: "/admin/strategy",
        execution: "/admin/execution",
        summary: "/admin/summary",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return adminJson(
      {
        ok: false,
        error: "Failed to load admin summary",
        detail: message,
      },
      { status: 500 },
    );
  }
}