import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AnyClient = any;
type TaskStatus = "todo" | "in_progress" | "blocked" | "done";
type TaskPriority = "high" | "medium" | "low";

type ExecutionTask = {
  id: string;
  title: string;
  description: string;
  owner: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueWeek: string;
  notes: string;
};

type ExecutionPlan = {
  headline: string;
  summary: string;
  focusAreas: string[];
  tasks: ExecutionTask[];
  notes: string;
};

type StrategySections = {
  company_profile: Record<string, unknown>;
  goals: Record<string, unknown>;
  channels: string[];
  brand: Record<string, unknown>;
};

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

  return {
    tenantId: null,
    brandId: null,
    workspaceId: null,
  };
}

async function resolveActorUserId(client: AnyClient, actorEmail: string): Promise<string | null> {
  const auditResult = await client
    .from("admin_audit_events")
    .select("actor_user_id, created_at")
    .eq("actor_email", actorEmail)
    .order("created_at", { ascending: false })
    .limit(1);

  if (!auditResult.error && Array.isArray(auditResult.data) && auditResult.data.length > 0) {
    const value = auditResult.data[0]?.actor_user_id;
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  const settingsResult = await client
    .from("workspace_settings")
    .select("created_by_user_id, updated_at")
    .eq("created_by_email", actorEmail)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (!settingsResult.error && Array.isArray(settingsResult.data) && settingsResult.data.length > 0) {
    const value = settingsResult.data[0]?.created_by_user_id;
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  const notesResult = await client
    .from("workspace_notes")
    .select("created_by_user_id, updated_at")
    .eq("created_by_email", actorEmail)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (!notesResult.error && Array.isArray(notesResult.data) && notesResult.data.length > 0) {
    const value = notesResult.data[0]?.created_by_user_id;
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  return null;
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function nonEmpty(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

async function loadOnboardingSections(client: AnyClient, workspaceId: string): Promise<StrategySections> {
  const { data, error } = await client
    .from("workspace_settings")
    .select("key, value")
    .eq("workspace_id", workspaceId)
    .in("key", [
      "onboarding.company_profile",
      "onboarding.goals",
      "onboarding.channels",
      "onboarding.brand",
    ]);

  if (error) {
    throw error;
  }

  const rows = Array.isArray(data) ? data : [];

  return {
    company_profile: asObject(rows.find((row) => row.key === "onboarding.company_profile")?.value),
    goals: asObject(rows.find((row) => row.key === "onboarding.goals")?.value),
    channels: asStringArray(rows.find((row) => row.key === "onboarding.channels")?.value),
    brand: asObject(rows.find((row) => row.key === "onboarding.brand")?.value),
  };
}

async function loadStrategyValue(client: AnyClient, workspaceId: string): Promise<Record<string, unknown>> {
  const { data, error } = await client
    .from("workspace_settings")
    .select("value")
    .eq("workspace_id", workspaceId)
    .eq("key", "strategy.generated_plan")
    .limit(1);

  if (error) {
    throw error;
  }

  if (Array.isArray(data) && data.length > 0) {
    return asObject(data[0].value);
  }

  return {};
}

function isTaskStatus(value: unknown): value is TaskStatus {
  return value === "todo" || value === "in_progress" || value === "blocked" || value === "done";
}

function isTaskPriority(value: unknown): value is TaskPriority {
  return value === "high" || value === "medium" || value === "low";
}

function normalizeTask(value: unknown, index: number): ExecutionTask {
  const obj = asObject(value);

  return {
    id: nonEmpty(obj.id, `task-${index + 1}`),
    title: nonEmpty(obj.title, `Task ${index + 1}`),
    description: nonEmpty(obj.description, "Action item"),
    owner: nonEmpty(obj.owner, "Growth owner"),
    status: isTaskStatus(obj.status) ? obj.status : "todo",
    priority: isTaskPriority(obj.priority) ? obj.priority : "medium",
    dueWeek: nonEmpty(obj.dueWeek, `Week ${index + 1}`),
    notes: typeof obj.notes === "string" ? obj.notes : "",
  };
}

function generateDefaultExecutionPlan(onboarding: StrategySections, strategyValue: Record<string, unknown>): ExecutionPlan {
  const company = onboarding.company_profile;
  const goals = onboarding.goals;
  const brand = onboarding.brand;
  const channels = onboarding.channels.length > 0 ? onboarding.channels : ["Meta Ads", "Google Ads", "Email"];
  const strategyChannels = asStringArray(strategyValue.recommendedChannels);
  const focusAreas = strategyChannels.length > 0 ? strategyChannels : channels;

  const businessName = nonEmpty(company.businessName, "This workspace");
  const primaryObjective = nonEmpty(goals.primaryObjective, "improve growth performance");
  const priority = nonEmpty(goals.ninetyDayPriority, "build a repeatable growth engine");
  const challenge = nonEmpty(goals.biggestChallenge, "lead consistency");
  const audience = nonEmpty(brand.audience, "the target audience");
  const valueProp = nonEmpty(brand.valueProposition, "a clear business offer");

  return {
    headline: `${businessName} weekly execution plan`,
    summary: `Translate the strategy into weekly execution across ${focusAreas.join(", ")} while focusing on ${primaryObjective} and reducing ${challenge}.`,
    focusAreas,
    tasks: [
      {
        id: "task-1",
        title: "Finalize ICP and offer framing",
        description: `Refine positioning for ${audience} and lock the core offer around ${valueProp}.`,
        owner: "Founder",
        status: "todo",
        priority: "high",
        dueWeek: "Week 1",
        notes: "",
      },
      {
        id: "task-2",
        title: "Launch primary acquisition campaigns",
        description: `Push first execution sprint across ${focusAreas.join(", ")} with clear tracking.`,
        owner: "Performance marketer",
        status: "todo",
        priority: "high",
        dueWeek: "Week 1",
        notes: "",
      },
      {
        id: "task-3",
        title: "Improve landing page conversion",
        description: "Audit CTA, page structure, and lead capture flow for faster conversion uplift.",
        owner: "Web / funnel owner",
        status: "in_progress",
        priority: "high",
        dueWeek: "Week 2",
        notes: "",
      },
      {
        id: "task-4",
        title: "Set weekly reporting rhythm",
        description: `Review progress against ${primaryObjective} and ${priority}.`,
        owner: "Ops lead",
        status: "todo",
        priority: "medium",
        dueWeek: "Week 2",
        notes: "",
      },
      {
        id: "task-5",
        title: "Implement follow-up automation",
        description: "Add response SLA and nurture sequence for all inbound leads.",
        owner: "CRM owner",
        status: "blocked",
        priority: "medium",
        dueWeek: "Week 3",
        notes: "",
      },
      {
        id: "task-6",
        title: "Publish trust-building proof",
        description: "Create one proof asset: case study, testimonial, or comparison content.",
        owner: "Content owner",
        status: "todo",
        priority: "medium",
        dueWeek: "Week 3",
        notes: "",
      },
    ],
    notes: "",
  };
}

function normalizeExecutionPlan(value: unknown, fallback: ExecutionPlan): ExecutionPlan {
  const obj = asObject(value);
  const focusAreas = asStringArray(obj.focusAreas);
  const tasks = Array.isArray(obj.tasks)
    ? obj.tasks.map((task, index) => normalizeTask(task, index))
    : fallback.tasks;

  return {
    headline: nonEmpty(obj.headline, fallback.headline),
    summary: nonEmpty(obj.summary, fallback.summary),
    focusAreas: focusAreas.length > 0 ? focusAreas : fallback.focusAreas,
    tasks: tasks.length > 0 ? tasks : fallback.tasks,
    notes: typeof obj.notes === "string" ? obj.notes : fallback.notes,
  };
}

async function loadExistingExecutionPlan(client: AnyClient, workspaceId: string): Promise<{ id: string | null; value: unknown | null }> {
  const { data, error } = await client
    .from("workspace_settings")
    .select("id, value")
    .eq("workspace_id", workspaceId)
    .eq("key", "execution.weekly_plan")
    .limit(1);

  if (error) {
    throw error;
  }

  if (Array.isArray(data) && data.length > 0) {
    return {
      id: data[0].id ?? null,
      value: data[0].value ?? null,
    };
  }

  return {
    id: null,
    value: null,
  };
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
          onboarding: {
            company_profile: {},
            goals: {},
            channels: [],
            brand: {},
          },
          execution: null,
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const onboarding = await loadOnboardingSections(client, activeContext.workspaceId);
    const strategyValue = await loadStrategyValue(client, activeContext.workspaceId);
    const fallbackPlan = generateDefaultExecutionPlan(onboarding, strategyValue);
    const existingExecution = await loadExistingExecutionPlan(client, activeContext.workspaceId);
    const execution = existingExecution.value
      ? normalizeExecutionPlan(existingExecution.value, fallbackPlan)
      : fallbackPlan;

    return NextResponse.json(
      {
        ok: true,
        activeContext,
        onboarding,
        execution,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to load execution plan.",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json().catch(() => null);

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
    const actorEmail = process.env.ADMIN_EMAIL ?? "admin@oyeimagine.com";
    const actorUserId = await resolveActorUserId(client, actorEmail);

    if (!actorUserId) {
      throw new Error("Could not resolve actor_user_id for execution audit.");
    }

    const onboarding = await loadOnboardingSections(client, workspaceId);
    const strategyValue = await loadStrategyValue(client, workspaceId);
    const fallbackPlan = generateDefaultExecutionPlan(onboarding, strategyValue);
    const normalizedPlan = normalizeExecutionPlan(body?.plan, fallbackPlan);
    const existingExecution = await loadExistingExecutionPlan(client, workspaceId);

    let settingId = existingExecution.id;
    let action: "created" | "updated" = settingId ? "updated" : "created";

    if (settingId) {
      const updateResult = await client
        .from("workspace_settings")
        .update({
          value: normalizedPlan,
          updated_by_email: actorEmail,
        })
        .eq("id", settingId)
        .select("id")
        .limit(1);

      if (updateResult.error) {
        throw updateResult.error;
      }

      if (Array.isArray(updateResult.data) && updateResult.data.length > 0) {
        settingId = updateResult.data[0].id;
      }
    } else {
      const insertResult = await client
        .from("workspace_settings")
        .insert({
          tenant_id: tenantId,
          brand_id: brandId,
          workspace_id: workspaceId,
          key: "execution.weekly_plan",
          value: normalizedPlan,
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
      throw new Error("Failed to resolve execution plan setting id.");
    }

    const versionResult = await client.from("workspace_setting_versions").insert({
      tenant_id: tenantId,
      brand_id: brandId,
      workspace_id: workspaceId,
      workspace_setting_id: settingId,
      key: "execution.weekly_plan",
      action,
      value: normalizedPlan,
      actor_email: actorEmail,
    });

    if (versionResult.error) {
      throw versionResult.error;
    }

    const auditResult = await client.from("admin_audit_events").insert({
      action: "admin_workspace_execution_saved",
      actor_user_id: actorUserId,
      actor_email: actorEmail,
      target_type: "workspace",
      target_id: workspaceId,
      payload: {
        key: "execution.weekly_plan",
        action,
        settingId,
      },
    });

    if (auditResult.error) {
      throw auditResult.error;
    }

    return NextResponse.json(
      {
        ok: true,
        activeContext,
        onboarding,
        execution: normalizedPlan,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to save execution plan.",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}