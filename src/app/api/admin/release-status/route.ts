import { requireAdmin } from "@/lib/admin-route";
import { buildCommercialOnboardingWorkspace } from "@/lib/pilot/commercial-onboarding-workspace";
import type { ServiceKey } from "@/lib/pilot/onboarding-types";
import type {
  CommercialBillingModel,
  CommercialPaymentTerm,
  CommercialScopeLane,
} from "@/lib/recovery/commercial-agreement-types";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AnyClient = any;

function hasEnv(name: string): boolean {
  const value = process.env[name];
  return Boolean(value && value.trim().length > 0);
}

function toBoolean(value: string | null, fallback = false): boolean {
  if (value == null) return fallback;
  return ["1", "true", "yes", "y"].includes(value.trim().toLowerCase());
}

function toNumber(value: string | null, fallback = 0): number {
  if (value == null || value.trim() === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function hasCommercialEvidenceSignal(searchParams: URLSearchParams): boolean {
  for (const key of ["companyName", "tenantId", "intakeId"]) {
    const value = searchParams.get(key);
    if (value && value.trim().length > 0) {
      return true;
    }
  }
  return false;
}

function buildCommercialEvidence(searchParams: URLSearchParams) {
  if (!hasCommercialEvidenceSignal(searchParams)) {
    return null;
  }

  const tenantId = searchParams.get("tenantId")?.trim() || "tenant_demo";
  const companyName = searchParams.get("companyName")?.trim() || "Unknown company";
  const legalName = searchParams.get("legalName")?.trim() || null;
  const websiteUrl = searchParams.get("websiteUrl")?.trim() || null;
  const industry = searchParams.get("industry")?.trim() || null;
  const countriesServed = searchParams.getAll("country");
  const servicesRequested = searchParams.getAll("service") as ServiceKey[];
  const requestedLanes = (searchParams.getAll("lane").length
    ? searchParams.getAll("lane")
    : ["growth_strategy"]) as CommercialScopeLane[];

  const workspace = buildCommercialOnboardingWorkspace({
    intakeId: searchParams.get("intakeId")?.trim() || "intake_demo",
    tenantId,
    companyName,
    legalName,
    websiteUrl,
    industry,
    countriesServed,
    servicesRequested,
    autonomyLevel: toNumber(searchParams.get("autonomyLevel"), 1) as 0 | 1 | 2 | 3 | 4,
    billingCurrency: searchParams.get("billingCurrency")?.trim() || "INR",
    clientTradeName: searchParams.get("clientTradeName")?.trim() || companyName,
    clientPrimaryContactName: searchParams.get("clientPrimaryContactName")?.trim() || null,
    clientPrimaryContactEmail: searchParams.get("clientPrimaryContactEmail")?.trim() || null,
    clientGstin: searchParams.get("clientGstin")?.trim() || null,
    businessEmail: searchParams.get("businessEmail")?.trim() || null,
    domainVerified: toBoolean(searchParams.get("domainVerified")),
    businessEmailVerified: toBoolean(searchParams.get("businessEmailVerified")),
    authorizedRepresentativeName:
      searchParams.get("authorizedRepresentativeName")?.trim() || null,
    authorizedRepresentativeEmail:
      searchParams.get("authorizedRepresentativeEmail")?.trim() || null,
    authorizedRepresentativeVerified: toBoolean(
      searchParams.get("authorizedRepresentativeVerified"),
    ),
    billingIdentityConfirmed: toBoolean(searchParams.get("billingIdentityConfirmed")),
    requestedLanes,
    billingModel: (searchParams.get("billingModel")?.trim() || "monthly_retainer") as CommercialBillingModel,
    baseFeeInr: toNumber(searchParams.get("baseFeeInr"), 0),
    paymentTerm: (searchParams.get("paymentTerm")?.trim() || "net_15") as CommercialPaymentTerm,
    contractSigned: toBoolean(searchParams.get("contractSigned")),
    esignProviderReady: toBoolean(searchParams.get("esignProviderReady")),
    subscriptionActive: toBoolean(searchParams.get("subscriptionActive")),
    invoiceProfileReady: toBoolean(searchParams.get("invoiceProfileReady")),
    paymentMethodReady: toBoolean(searchParams.get("paymentMethodReady")),
    approvalPolicyReady: toBoolean(searchParams.get("approvalPolicyReady")),
    strategyGenerated: toBoolean(searchParams.get("strategyGenerated")),
    strategyApproved: toBoolean(searchParams.get("strategyApproved")),
    invoiceStatus: (searchParams.get("invoiceStatus")?.trim() || "not_issued") as
      | "not_issued"
      | "issued"
      | "paid"
      | "overdue",
    approvalOpenCount: toNumber(searchParams.get("approvalOpenCount"), 0),
    auditCoverage: toNumber(searchParams.get("auditCoverage"), 0),
    mediaBalanceAmount: toNumber(searchParams.get("mediaBalanceAmount"), 0),
    currency: searchParams.get("currency")?.trim() || "INR",

    esignCredentialsPresent: toBoolean(searchParams.get("esignCredentialsPresent")),
    esignBusinessVerified: toBoolean(searchParams.get("esignBusinessVerified")),
    esignLiveAccountConnected: toBoolean(searchParams.get("esignLiveAccountConnected")),
    esignWebhookConfigured: toBoolean(searchParams.get("esignWebhookConfigured")),
    esignCallbackVerified: toBoolean(searchParams.get("esignCallbackVerified")),

    paymentGatewayCredentialsPresent: toBoolean(searchParams.get("paymentGatewayCredentialsPresent")),
    paymentGatewayBusinessVerified: toBoolean(searchParams.get("paymentGatewayBusinessVerified")),
    paymentGatewayLiveAccountConnected: toBoolean(searchParams.get("paymentGatewayLiveAccountConnected")),
    paymentGatewayWebhookConfigured: toBoolean(searchParams.get("paymentGatewayWebhookConfigured")),
    paymentGatewayCallbackVerified: toBoolean(searchParams.get("paymentGatewayCallbackVerified")),
  });

  return {
    companyName: workspace.intake.companyName,
    commercialReviewStatus: workspace.readyForCommercialReview ? "ready" : "blocked",
    commercialReviewBlockers: workspace.commercialReviewBlockers,
    providerReadinessStatus: workspace.providerReadiness.status,
    providerReadinessBlockers: workspace.providerReadiness.blockers,
    activationStatus: workspace.activationSummary.status,
    activationBlockers: workspace.activationSummary.blockers,
    continuityReady: workspace.continuitySummary.readyForActivation,
    continuityBlockers: workspace.continuitySummary.blockers,
    sharedBlockers: Array.from(
      new Set([
        ...workspace.commercialReviewBlockers,
        ...workspace.activationSummary.blockers,
        ...workspace.continuitySummary.blockers,
      ]),
    ),
  };
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

  const { searchParams } = new URL(request.url);
  const commercialEvidence = buildCommercialEvidence(searchParams);

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
        commercialEvidence,
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
      commercialEvidence,
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
