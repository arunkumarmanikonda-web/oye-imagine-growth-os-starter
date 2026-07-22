import { requireAdmin } from "@/lib/admin-route";
import { adminJson, adminError, adminUnauthorized } from "@/lib/admin-api";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AnyClient = any;

type StrategySections = {
  company_profile: Record<string, unknown>;
  goals: Record<string, unknown>;
  channels: string[];
  brand: Record<string, unknown>;
};

type StrategyPlan = {
  headline: string;
  summary: string;
  priorities: string[];
  recommendedChannels: string[];
  ninetyDayPlan: Array<{
    phase: string;
    focus: string;
    actions: string[];
  }>;
  messaging: string[];
  metrics: string[];
  notes: string;
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

  return null;
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
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

  const company = rows.find((row) => row.key === "onboarding.company_profile")?.value;
  const goals = rows.find((row) => row.key === "onboarding.goals")?.value;
  const channels = rows.find((row) => row.key === "onboarding.channels")?.value;
  const brand = rows.find((row) => row.key === "onboarding.brand")?.value;

  return {
    company_profile: asObject(company),
    goals: asObject(goals),
    channels: asStringArray(channels),
    brand: asObject(brand),
  };
}

function nonEmpty(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function generateStrategyPlan(sections: StrategySections, existingNotes: string): StrategyPlan {
  const company = sections.company_profile;
  const goals = sections.goals;
  const channels = sections.channels;
  const brand = sections.brand;

  const businessName = nonEmpty(company.businessName, "This workspace");
  const industry = nonEmpty(company.industry, "the business");
  const primaryMarket = nonEmpty(company.primaryMarket, "the target market");
  const primaryObjective = nonEmpty(goals.primaryObjective, "improve growth performance");
  const revenueTarget = nonEmpty(goals.monthlyRevenueTarget, "the target revenue");
  const leadTarget = nonEmpty(goals.leadTarget, "the target lead volume");
  const biggestChallenge = nonEmpty(goals.biggestChallenge, "inconsistent growth execution");
  const ninetyDayPriority = nonEmpty(goals.ninetyDayPriority, "build a repeatable growth engine");
  const tone = nonEmpty(brand.tone, "clear and trusted");
  const audience = nonEmpty(brand.audience, "the core audience");
  const valueProposition = nonEmpty(brand.valueProposition, "a clear business offer");
  const recommendedChannels = channels.length > 0
    ? channels
    : ["Meta Ads", "Google Ads", "Email"];

  const priorities = [
    `Focus the next 90 days on ${ninetyDayPriority}.`,
    `Build demand generation around ${primaryObjective}.`,
    `Reduce friction caused by ${biggestChallenge}.`,
    `Align messaging for ${audience} in ${primaryMarket}.`,
  ];

  const ninetyDayPlan = [
    {
      phase: "Days 1-30",
      focus: "Foundation",
      actions: [
        "Confirm offer, audience, and conversion path.",
        "Create one reporting view for leads, spend, and revenue.",
        "Define the weekly operating rhythm for channel review.",
      ],
    },
    {
      phase: "Days 31-60",
      focus: "Acquisition",
      actions: [
        `Scale the strongest acquisition mix across ${recommendedChannels.join(", ")}.`,
        "Improve landing page and form conversion rates.",
        "Add remarketing and follow-up automation.",
      ],
    },
    {
      phase: "Days 61-90",
      focus: "Optimization",
      actions: [
        `Tune campaigns against revenue target ${revenueTarget} and lead target ${leadTarget}.`,
        "Prioritize best-performing messages and audiences.",
        "Document repeatable tests and next-quarter bets.",
      ],
    },
  ];

  const messaging = [
    `${businessName} helps ${audience} achieve outcomes with a ${tone} brand voice.`,
    `Lead with the value proposition: ${valueProposition}.`,
    `Position the offer around business impact instead of generic activity.`,
  ];

  const metrics = [
    "Qualified leads per week",
    "Cost per qualified lead",
    "Lead-to-opportunity conversion",
    "Opportunity-to-revenue conversion",
    "Revenue attributed by channel",
  ];

  return {
    headline: `${businessName} growth strategy`,
    summary: `${businessName} operates in ${industry} and should prioritize ${primaryObjective} in ${primaryMarket}. The working plan focuses on ${recommendedChannels.join(", ")} while solving ${biggestChallenge}.`,
    priorities,
    recommendedChannels,
    ninetyDayPlan,
    messaging,
    metrics,
    notes: existingNotes,
  };
}

async function loadExistingStrategyPlan(client: AnyClient, workspaceId: string): Promise<{ id: string | null; value: StrategyPlan | null }> {
  const { data, error } = await client
    .from("workspace_settings")
    .select("id, value")
    .eq("workspace_id", workspaceId)
    .eq("key", "strategy.generated_plan")
    .limit(1);

  if (error) {
    throw error;
  }

  if (Array.isArray(data) && data.length > 0) {
    return {
      id: data[0].id ?? null,
      value: (data[0].value as StrategyPlan) ?? null,
    };
  }

  return { id: null, value: null };
}

export async function GET(request: Request) {
  const adminAuthError = requireAdmin(request);
  if (adminAuthError) {
    return adminAuthError;
  }
  try {
    const client = getServiceClient();
    const activeContext = await getActiveContext(client);

    if (!activeContext.workspaceId) {
      return adminJson(
        {
          ok: true,
          activeContext,
          onboarding: {
            company_profile: {},
            goals: {},
            channels: [],
            brand: {},
          },
          strategy: null,
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const onboarding = await loadOnboardingSections(client, activeContext.workspaceId);
    const existingPlan = await loadExistingStrategyPlan(client, activeContext.workspaceId);
    const notes = existingPlan.value?.notes ?? "";
    const strategy = generateStrategyPlan(onboarding, notes);

    return adminJson(
      {
        ok: true,
        activeContext,
        onboarding,
        strategy,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return adminJson(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to load strategy.",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export async function PUT(request: Request) {
  const adminAuthError = requireAdmin(request);
  if (adminAuthError) {
    return adminAuthError;
  }
  try {
    const body = await request.json().catch(() => null);
    const incomingNotes = typeof body?.notes === "string" ? body.notes : "";

    const client = getServiceClient();
    const activeContext = await getActiveContext(client);

    if (!activeContext.workspaceId) {
      return adminJson(
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
      throw new Error("Could not resolve actor_user_id for strategy audit.");
    }

    const onboarding = await loadOnboardingSections(client, workspaceId);
    const existingPlan = await loadExistingStrategyPlan(client, workspaceId);
    const generatedPlan = generateStrategyPlan(onboarding, incomingNotes);

    let settingId = existingPlan.id;
    let action: "created" | "updated" = settingId ? "updated" : "created";

    if (settingId) {
      const updateResult = await client
        .from("workspace_settings")
        .update({
          value: generatedPlan,
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
          key: "strategy.generated_plan",
          value: generatedPlan,
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
      throw new Error("Failed to resolve strategy setting id.");
    }

    const versionResult = await client.from("workspace_setting_versions").insert({
      tenant_id: tenantId,
      brand_id: brandId,
      workspace_id: workspaceId,
      workspace_setting_id: settingId,
      key: "strategy.generated_plan",
      action,
      value: generatedPlan,
      actor_email: actorEmail,
    });

    if (versionResult.error) {
      throw versionResult.error;
    }

    const auditResult = await client.from("admin_audit_events").insert({
      action: "admin_workspace_strategy_saved",
      actor_user_id: actorUserId,
      actor_email: actorEmail,
      target_type: "workspace",
      target_id: workspaceId,
      payload: {
        key: "strategy.generated_plan",
        action,
        settingId,
      },
    });

    if (auditResult.error) {
      throw auditResult.error;
    }

    return adminJson(
      {
        ok: true,
        activeContext,
        onboarding,
        strategy: generatedPlan,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return adminJson(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to save strategy.",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}