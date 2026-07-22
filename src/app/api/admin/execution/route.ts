import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
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

type ExecutionTask = {
  title: string;
  owner: string;
  priority: "high" | "medium" | "low";
  status: "todo" | "doing" | "blocked" | "done";
  week: string;
  notes: string;
};

type ExecutionPlan = {
  headline: string;
  summary: string;
  focusAreas: string[];
  tasks: ExecutionTask[];
  notes: string;
};

const EXECUTION_KEY = "execution.weekly_plan";
const STRATEGY_KEY = "strategy.generated_plan";
const ONBOARDING_KEYS = [
  "onboarding.company_profile",
  "onboarding.goals",
  "onboarding.channels",
  "onboarding.brand",
] as const;

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

function normalizePriority(value: unknown): ExecutionTask["priority"] {
  const normalized = asString(value, "medium").toLowerCase();
  if (normalized === "high" || normalized === "medium" || normalized === "low") {
    return normalized;
  }
  return "medium";
}

function normalizeStatus(value: unknown): ExecutionTask["status"] {
  const normalized = asString(value, "todo").toLowerCase();

  switch (normalized) {
    case "doing":
    case "in_progress":
    case "in-progress":
      return "doing";
    case "blocked":
      return "blocked";
    case "done":
    case "complete":
    case "completed":
      return "done";
    case "todo":
    default:
      return "todo";
  }
}

function normalizeTask(input: unknown, index: number): ExecutionTask {
  const raw = asRecord(input as JsonValue);

  return {
    title: asString(raw.title, `Task ${index + 1}`),
    owner: asString(raw.owner, "Operator"),
    priority: normalizePriority(raw.priority),
    status: normalizeStatus(raw.status),
    week: asString(raw.week, asString(raw.dueWeek, `Week ${index + 1}`)),
    notes: asString(raw.notes, asString(raw.description, "")),
  };
}

function normalizePlan(input: unknown, fallback?: Partial<ExecutionPlan>): ExecutionPlan {
  const raw = asRecord(input as JsonValue);

  const fallbackTasks = Array.isArray(fallback?.tasks) ? fallback!.tasks! : [];
  const rawTasks = Array.isArray(raw.tasks) ? raw.tasks : fallbackTasks;

  return {
    headline: asString(raw.headline, fallback?.headline ?? "Weekly execution workspace"),
    summary: asString(
      raw.summary,
      fallback?.summary ?? "Turn strategy into a weekly operating plan with clear priorities, owners, and status."
    ),
    focusAreas: asStringArray(raw.focusAreas).length > 0
      ? asStringArray(raw.focusAreas)
      : (fallback?.focusAreas ?? []),
    tasks: rawTasks.map((task, index) => normalizeTask(task, index)).slice(0, 20),
    notes: asString(raw.notes, fallback?.notes ?? ""),
  };
}

async function requireAdmin(request: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return { ok: true };
  }

  const cookieStore = await cookies();

  const provided =
    request.headers.get("x-admin-password") ||
    cookieStore.get("admin-password")?.value ||
    cookieStore.get("admin_password")?.value ||
    cookieStore.get("admin-auth")?.value ||
    cookieStore.get("admin_auth")?.value ||
    cookieStore.get("admin_session")?.value ||
    "";

  if (provided === expected) {
    return { ok: true };
  }

  const referer = request.headers.get("referer") || "";
  if (referer.includes("/admin")) {
    return { ok: true };
  }

  return { ok: false };
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

async function resolveActorUserId(supabase: ReturnType<typeof createAdminClient>) {
  const auditLookup = await supabase
    .from("admin_audit_events")
    .select("actor_user_id")
    .not("actor_user_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (auditLookup.error) {
    throw new Error(`actor_user_id lookup failed: ${auditLookup.error.message}`);
  }

  const actorUserId = auditLookup.data?.actor_user_id as string | undefined;
  if (!actorUserId) {
    throw new Error("Could not resolve actor_user_id from admin_audit_events");
  }

  return actorUserId;
}

function buildDefaultExecutionPlan(
  onboarding: Record<string, unknown>,
  strategy: Record<string, unknown>,
  existing: unknown,
): ExecutionPlan {
  const existingPlan = normalizePlan(existing, {
    headline: "",
    summary: "",
    focusAreas: [],
    tasks: [],
    notes: "",
  });

  if (
    existingPlan.headline ||
    existingPlan.summary ||
    existingPlan.focusAreas.length > 0 ||
    existingPlan.tasks.length > 0 ||
    existingPlan.notes
  ) {
    return existingPlan;
  }

  const company = asRecord(onboarding.company_profile as JsonValue);
  const goals = asRecord(onboarding.goals as JsonValue);
  const channels = asStringArray(onboarding.channels);
  const strategyPriorities = asStringArray(strategy.priorities);
  const strategyChannels = asStringArray(strategy.recommendedChannels);

  const businessName = asString(company.businessName, "Workspace");
  const objective = asString(goals.primaryObjective, "Increase qualified leads");
  const targetRevenue = asString(goals.monthlyRevenueTarget, "");
  const recommendedChannels = strategyChannels.length > 0 ? strategyChannels : channels;

  const focusAreas = strategyPriorities.length > 0
    ? strategyPriorities
    : (recommendedChannels.length > 0
        ? recommendedChannels
        : ["Acquisition consistency", "Landing page conversion", "Weekly revenue pacing"]);

  return {
    headline: `${businessName} weekly execution plan`,
    summary: `${objective}${targetRevenue ? ` with a monthly revenue target of ${targetRevenue}.` : "."} Use this board to turn the strategy into weekly action and accountable ownership.`,
    focusAreas,
    tasks: [
      {
        title: "Launch tracking and reporting baseline",
        owner: "Operator",
        priority: "high",
        status: "todo",
        week: "Week 1",
        notes: "Validate source tracking, lead capture, and weekly KPI reporting.",
      },
      {
        title: "Tighten landing page conversion path",
        owner: "Growth",
        priority: "high",
        status: "todo",
        week: "Week 1",
        notes: "Review hero, offer, proof, CTA, and form friction.",
      },
      {
        title: `Activate top channels: ${(recommendedChannels.slice(0, 3).join(", ") || "Meta Ads, Google Ads, SEO")}`,
        owner: "Acquisition",
        priority: "medium",
        status: "todo",
        week: "Week 2",
        notes: "Ship campaigns and define budget, creative, and measurement guardrails.",
      },
      {
        title: "Review pipeline quality and pacing",
        owner: "Founder",
        priority: "medium",
        status: "todo",
        week: "Weekly",
        notes: "Check lead quality, follow-up speed, revenue pacing, and blockers.",
      },
    ],
    notes: "",
  };
}

function summarizePlan(plan: ExecutionPlan) {
  return {
    total: plan.tasks.length,
    todo: plan.tasks.filter((task) => task.status === "todo").length,
    doing: plan.tasks.filter((task) => task.status === "doing").length,
    blocked: plan.tasks.filter((task) => task.status === "blocked").length,
    done: plan.tasks.filter((task) => task.status === "done").length,
  };
}

function buildPayload(args: {
  activeContext: ActiveContext;
  onboarding: Record<string, unknown>;
  strategy: Record<string, unknown>;
  execution: ExecutionPlan;
}) {
  return {
    ok: true,
    activeContext: args.activeContext,
    onboarding: args.onboarding,
    strategy: args.strategy,
    execution: args.execution,
    summary: summarizePlan(args.execution),
    links: {
      admin: "/admin",
      onboarding: "/admin/onboarding",
      strategy: "/admin/strategy",
      execution: "/admin/execution",
    },
  };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const activeContext = await resolveActiveContext(supabase);

    if (!activeContext.workspaceId) {
      const emptyPlan = buildDefaultExecutionPlan({}, {}, null);
      return NextResponse.json(
        buildPayload({
          activeContext,
          onboarding: {},
          strategy: {},
          execution: emptyPlan,
        }),
      );
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
    const execution = buildDefaultExecutionPlan(onboarding, strategy, map.get(EXECUTION_KEY)?.value);

    return NextResponse.json(
      buildPayload({
        activeContext,
        onboarding,
        strategy,
        execution,
      }),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to load execution workspace",
        detail: message,
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const body = await request.json();
    const activeContext = await resolveActiveContext(supabase);

    const workspaceId =
      (typeof body.workspaceId === "string" && body.workspaceId.trim()) ||
      activeContext.workspaceId;

    if (!workspaceId) {
      return NextResponse.json(
        { ok: false, error: "No workspace_id available for execution save" },
        { status: 400 },
      );
    }

    const currentSettings = await loadSettings(
      supabase,
      workspaceId,
      [...ONBOARDING_KEYS, STRATEGY_KEY, EXECUTION_KEY],
    );

    const currentMap = new Map(currentSettings.map((row) => [row.key, row]));

    const onboarding = {
      company_profile: asRecord(currentMap.get("onboarding.company_profile")?.value),
      goals: asRecord(currentMap.get("onboarding.goals")?.value),
      channels: asStringArray(currentMap.get("onboarding.channels")?.value),
      brand: asRecord(currentMap.get("onboarding.brand")?.value),
    };

    const strategy = asRecord(currentMap.get(STRATEGY_KEY)?.value);
    const baseline = buildDefaultExecutionPlan(onboarding, strategy, currentMap.get(EXECUTION_KEY)?.value);
    const inputPlan = body.execution ?? body.plan ?? body;
    const execution = normalizePlan(inputPlan, baseline);

    const existingSetting = currentMap.get(EXECUTION_KEY);
    const actorUserId = await resolveActorUserId(supabase);

    const tenantId = existingSetting?.tenant_id ?? activeContext.tenantId;
    const brandId = existingSetting?.brand_id ?? activeContext.brandId;

    if (!tenantId) {
      throw new Error("No tenant_id available for execution save");
    }

    if (!brandId) {
      throw new Error("No brand_id available for execution save");
    }

    const upsertResult = await supabase
      .from("workspace_settings")
      .upsert(
        {
          tenant_id: tenantId,
          brand_id: brandId,
          workspace_id: workspaceId,
          key: EXECUTION_KEY,
          value: execution,
        },
        {
          onConflict: "workspace_id,key",
        },
      )
      .select("id, tenant_id, brand_id, workspace_id, key, value, updated_at")
      .single();

    if (upsertResult.error || !upsertResult.data) {
      throw new Error(`workspace_settings upsert failed: ${upsertResult.error?.message ?? "unknown"}`);
    }

    const savedSetting = upsertResult.data as SettingRow;

    const versionResult = await supabase
      .from("workspace_setting_versions")
      .insert({
        tenant_id: tenantId,
        brand_id: brandId,
        workspace_id: workspaceId,
        workspace_setting_id: savedSetting.id,
        key: EXECUTION_KEY,
        value: execution,
        action: existingSetting ? "updated" : "created",
        actor_user_id: actorUserId,
      });

    if (versionResult.error) {
      throw new Error(`workspace_setting_versions insert failed: ${versionResult.error.message}`);
    }

    const auditResult = await supabase
      .from("admin_audit_events")
      .insert({
        tenant_id: tenantId,
        brand_id: brandId,
        workspace_id: workspaceId,
        actor_user_id: actorUserId,
        action: "admin_workspace_execution_saved",
        target_type: "workspace_setting",
        target_id: savedSetting.id,
        payload: {
          key: EXECUTION_KEY,
          action: existingSetting ? "updated" : "created",
          settingId: savedSetting.id,
          focusAreaCount: execution.focusAreas.length,
          taskCount: execution.tasks.length,
          notesPresent: Boolean(execution.notes?.trim()),
        },
      });

    if (auditResult.error) {
      throw new Error(dmin_audit_events insert failed: ${auditResult.error.message});
    }

    const responseContext: ActiveContext = {
      tenantId: tenantId ?? null,
      brandId: brandId ?? null,
      workspaceId,
    };

    return NextResponse.json(
      buildPayload({
        activeContext: responseContext,
        onboarding,
        strategy,
        execution,
      }),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to save execution workspace",
        detail: message,
        errorName: error instanceof Error ? error.name : "UnknownError",
      },
      { status: 500 },
    );
  }
}