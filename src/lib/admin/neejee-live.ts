import { getNeejeeOnboardingSnapshot } from "@/lib/admin/onboarding-seed";
import { getNeejeeBrandIntelligenceSnapshot } from "@/lib/admin/brand-intelligence-seed";
import type {
  NeejeePilotAction,
  NeejeePilotControlSnapshot,
  NeejeePilotStage,
} from "@/lib/admin/neejee-pilot";

type AnyRecord = Record<string, any>;
type PilotStatus = "blocked" | "review_required" | "in_progress" | "ready";

const TABLES = ["workspace_settings", "workspace_notes", "workspace_summary"] as const;

function isRecord(value: unknown): value is AnyRecord {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function deepMerge<T>(base: T, overlay: unknown): T {
  if (Array.isArray(base)) {
    return (Array.isArray(overlay) ? overlay : base) as T;
  }

  if (isRecord(base) && isRecord(overlay)) {
    const result: AnyRecord = { ...base };

    for (const [key, value] of Object.entries(overlay)) {
      const current = result[key];

      if (Array.isArray(value)) {
        result[key] = value;
        continue;
      }

      if (isRecord(value) && isRecord(current)) {
        result[key] = deepMerge(current, value);
        continue;
      }

      if (value !== undefined && value !== null) {
        result[key] = value;
      }
    }

    return result as T;
  }

  return ((overlay ?? base) as T);
}

function safeString(value: unknown): string {
  try {
    return JSON.stringify(value).toLowerCase();
  } catch {
    return String(value ?? "").toLowerCase();
  }
}

function containsNeejee(value: unknown): boolean {
  return safeString(value).includes("neejee");
}

function normalizeStatus(value: unknown): PilotStatus {
  const text = String(value ?? "").trim().toLowerCase();

  if (!text) return "in_progress";
  if (text.includes("block")) return "blocked";
  if (text.includes("review")) return "review_required";
  if (text.includes("ready") || text.includes("approved") || text.includes("complete")) return "ready";
  return "in_progress";
}

async function readSupabaseRows(): Promise<AnyRecord[]> {
  try {
    const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
    const admin = createSupabaseAdminClient();

    const groups = await Promise.all(
      TABLES.map(async (table) => {
        try {
          const { data, error } = await admin.from(table).select("*").limit(50);
          if (error || !Array.isArray(data)) return [];
          return data as AnyRecord[];
        } catch {
          return [];
        }
      })
    );

    return groups.flat();
  } catch {
    return [];
  }
}

function collectCandidates(value: unknown, bucket: AnyRecord[] = [], depth = 0): AnyRecord[] {
  if (depth > 3 || !isRecord(value)) {
    return bucket;
  }

  bucket.push(value);

  for (const nested of Object.values(value)) {
    if (isRecord(nested)) {
      collectCandidates(nested, bucket, depth + 1);
    }
  }

  return bucket;
}

function findBestOverlay(rows: AnyRecord[], requiredKeys: string[]): AnyRecord | null {
  let best: AnyRecord | null = null;
  let bestScore = 0;

  for (const row of rows) {
    const rowBonus = containsNeejee(row) ? 2 : 0;

    for (const candidate of collectCandidates(row)) {
      let score = rowBonus;

      for (const key of requiredKeys) {
        if (key in candidate) score += 4;
      }

      if (containsNeejee(candidate)) score += 2;

      if (score > bestScore) {
        best = candidate;
        bestScore = score;
      }
    }
  }

  return best;
}

function latestUpdatedAt(rows: AnyRecord[]): string | undefined {
  const values = rows
    .flatMap((row) => [row.updated_at, row.updatedAt, row.created_at, row.createdAt])
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .sort();

  return values.length ? values[values.length - 1] : undefined;
}

export async function getNeejeeOnboardingSnapshotLive() {
  const base = getNeejeeOnboardingSnapshot();
  const rows = await readSupabaseRows();
  const overlay = findBestOverlay(rows, ["readinessCards", "services", "integrations", "brandContext"]);
  const merged = overlay ? deepMerge(base, overlay) : base;
  const updatedAt = latestUpdatedAt(rows);

  return deepMerge(merged, {
    workspace: {
      updatedAtLabel: String(
        updatedAt ??
          ((merged as AnyRecord).workspace?.updatedAtLabel ??
            (merged as AnyRecord).workspace?.updatedAt ??
            "")
      ),
    },
  });
}

export async function getNeejeeBrandIntelligenceSnapshotLive() {
  const base = getNeejeeBrandIntelligenceSnapshot();
  const rows = await readSupabaseRows();
  const overlay = findBestOverlay(rows, [
    "identityCards",
    "approvedLanguage",
    "prohibitedLanguage",
    "positioning",
    "profileStatus",
  ]);
  const merged = overlay ? deepMerge(base, overlay) : base;
  const updatedAt = latestUpdatedAt(rows);

  return deepMerge(merged, {
    workspace: {
      updatedAt: String(
        updatedAt ??
          ((merged as AnyRecord).workspace?.updatedAt ??
            (merged as AnyRecord).workspace?.updatedAtLabel ??
            "")
      ),
    },
  });
}

export async function getNeejeePilotControlSnapshotLive(): Promise<NeejeePilotControlSnapshot> {
  const onboarding = await getNeejeeOnboardingSnapshotLive();
  const brandIntelligence = await getNeejeeBrandIntelligenceSnapshotLive();

  const readinessCards = Array.isArray((onboarding as AnyRecord).readinessCards)
    ? (((onboarding as AnyRecord).readinessCards as AnyRecord[]) ?? [])
    : [];

  const services = Array.isArray((onboarding as AnyRecord).services)
    ? (((onboarding as AnyRecord).services as AnyRecord[]) ?? [])
    : [];

  const integrations = Array.isArray((onboarding as AnyRecord).integrations)
    ? (((onboarding as AnyRecord).integrations as AnyRecord[]) ?? [])
    : [];

  const identityCards = Array.isArray((brandIntelligence as AnyRecord).identityCards)
    ? (((brandIntelligence as AnyRecord).identityCards as AnyRecord[]) ?? [])
    : [];

  const approvedLanguage = Array.isArray((brandIntelligence as AnyRecord).approvedLanguage)
    ? (((brandIntelligence as AnyRecord).approvedLanguage as AnyRecord[]) ?? [])
    : [];

  const prohibitedLanguage = Array.isArray((brandIntelligence as AnyRecord).prohibitedLanguage)
    ? (((brandIntelligence as AnyRecord).prohibitedLanguage as AnyRecord[]) ?? [])
    : [];

  const readinessScore = readinessCards.length
    ? Math.round(
        readinessCards.reduce((sum, card) => sum + Number(card.score ?? card.readiness ?? 0), 0) /
          readinessCards.length
      )
    : 0;

  const blockedCards = readinessCards.filter((card) => normalizeStatus(card.status) === "blocked");
  const pendingIntegrations = integrations.filter((item) => normalizeStatus(item.status) !== "ready");

  const profileStatus = String((brandIntelligence as AnyRecord).profileStatus ?? "review_required");
  const brandStatus = normalizeStatus(profileStatus);

  const onboardingStatus: PilotStatus =
    blockedCards.length > 0 ? "blocked" : readinessScore >= 80 ? "ready" : "in_progress";

  const summaryStatus: PilotStatus =
    onboardingStatus === "blocked" || brandStatus === "blocked"
      ? "blocked"
      : brandStatus === "review_required"
      ? "review_required"
      : "in_progress";

  const activationStatus: PilotStatus =
    onboardingStatus === "ready" && brandStatus === "ready" && pendingIntegrations.length === 0
      ? "ready"
      : blockedCards.length > 0 || pendingIntegrations.length > 1
      ? "blocked"
      : "in_progress";

  const stages: NeejeePilotStage[] = [
    {
      id: "onboarding",
      title: "Onboarding readiness",
      href: "/admin/onboarding",
      owner: "Client activation",
      status: onboardingStatus,
      summary:
        onboardingStatus === "ready"
          ? "Core onboarding lanes are in shape for activation planning."
          : "Operational readiness still needs review before launch approval.",
      signals: [
        `${readinessCards.length} readiness lane(s)`,
        `${blockedCards.length} blocked lane(s)`,
        `${services.length} configured service track(s)`,
      ],
    },
    {
      id: "brand-intelligence",
      title: "Brand intelligence",
      href: "/admin/brand-intelligence",
      owner: "Brand strategy",
      status: brandStatus,
      summary:
        brandStatus === "ready"
          ? "Voice, positioning, and language controls are approved for pilot use."
          : "Brand profile requires review before the pilot voice is treated as canonical.",
      signals: [
        `${identityCards.length} identity card(s)`,
        `${approvedLanguage.length} approved language cue(s)`,
        `${prohibitedLanguage.length} prohibited language cue(s)`,
      ],
    },
    {
      id: "summary",
      title: "Executive readiness summary",
      href: "/admin/summary",
      owner: "Leadership operations",
      status: summaryStatus,
      summary:
        summaryStatus === "blocked"
          ? "Leadership summary is constrained by readiness or brand-review blockers."
          : "Decision support is ready to consolidate the pilot operating picture.",
      signals: [
        `Readiness score ${readinessScore}`,
        `Profile status ${profileStatus}`,
        `${pendingIntegrations.length} integration gap(s)`,
      ],
    },
    {
      id: "activation",
      title: "Pilot activation launch",
      href: "/admin/marketplace",
      owner: "Growth operations",
      status: activationStatus,
      summary:
        activationStatus === "ready"
          ? "Activation can move toward approved marketplace execution."
          : "Activation remains staged behind readiness, integration, or brand-review controls.",
      signals: [
        `${services.length} monetization track(s)`,
        `${pendingIntegrations.length} pending integration(s)`,
        activationStatus === "ready" ? "Go-live eligible" : "Hold for controlled rollout",
      ],
    },
  ];

  const nextActions: NeejeePilotAction[] = [];

  if (blockedCards.length > 0) {
    nextActions.push({
      label: "Resolve onboarding blockers",
      href: "/admin/onboarding",
      tone: "primary",
      detail: `Clear ${blockedCards.length} blocked readiness lane(s) before activation approval.`,
    });
  }

  if (brandStatus !== "ready") {
    nextActions.push({
      label: "Approve brand intelligence profile",
      href: "/admin/brand-intelligence",
      tone: blockedCards.length > 0 ? "secondary" : "primary",
      detail: "Promote the Neejee brand profile from review state to approved pilot guidance.",
    });
  }

  if (pendingIntegrations.length > 0) {
    nextActions.push({
      label: "Close integration gaps",
      href: "/admin/onboarding",
      tone: "secondary",
      detail: `${pendingIntegrations.length} integration dependency(ies) still need activation planning.`,
    });
  }

  nextActions.push({
    label: "Review executive summary",
    href: "/admin/summary",
    tone: "ghost",
    detail: "Use the leadership snapshot to align operations, brand, and delivery readiness.",
  });

  nextActions.push({
    label: "Inspect marketplace readiness",
    href: "/admin/marketplace",
    tone: "ghost",
    detail: "Validate the downstream execution surface before opening live pilot operations.",
  });

  const executiveBrief: string[] = [
    `Neejee is running as a controlled pilot with a readiness score of ${readinessScore} across onboarding lanes.`,
    brandStatus === "ready"
      ? "Brand intelligence is approved for guided execution."
      : `Brand intelligence remains in ${profileStatus} state and should be treated as a gated input.`,
    blockedCards.length > 0
      ? `${blockedCards.length} blocked onboarding lane(s) still prevent clean activation.`
      : "No hard onboarding blockers are currently visible in the current workspace data.",
    pendingIntegrations.length > 0
      ? `${pendingIntegrations.length} integration dependency(ies) still need operational closure before launch.`
      : "Integration readiness is aligned with activation planning.",
  ];

  return {
    workspace: {
      brand: String((onboarding as AnyRecord).workspace?.brand ?? "Neejee"),
      pilot: "Neejee pilot",
      owner: String((onboarding as AnyRecord).workspace?.owner ?? "Neejee founder"),
      updatedAt: String(
        (brandIntelligence as AnyRecord).workspace?.updatedAt ??
          (onboarding as AnyRecord).workspace?.updatedAt ??
          new Date().toISOString()
      ),
    },
    signals: {
      readinessScore,
      blockedLanes: blockedCards.length,
      approvedLanguageCount: approvedLanguage.length,
      prohibitedLanguageCount: prohibitedLanguage.length,
      profileStatus,
      serviceCount: services.length,
      pendingIntegrations: pendingIntegrations.length,
    },
    stages,
    nextActions,
    executiveBrief,
    onboarding,
    brandIntelligence,
  };
}

/* M13E_WRITE_RAILS_START */
type NeejeeSnapshotWriteKind = "onboarding" | "brand_intelligence" | "pilot_control";

const NEEJEE_WRITE_TABLE = "workspace_settings";
const NEEJEE_WORKSPACE_SLUG = "neejee";

async function getNeejeeWriteAdminClient() {
  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  return createSupabaseAdminClient();
}

async function persistNeejeeSnapshot(kind: NeejeeSnapshotWriteKind, snapshot: AnyRecord) {
  const admin = await getNeejeeWriteAdminClient();
  const runner: any = admin.from(NEEJEE_WRITE_TABLE);

  const payload = {
    workspace_slug: NEEJEE_WORKSPACE_SLUG,
    snapshot_type: kind,
    snapshot,
    updated_at: new Date().toISOString(),
  };

  try {
    const upsertResult = await runner.upsert(payload);
    if (!upsertResult?.error) {
      return payload.updated_at;
    }
  } catch {
    // fall through to insert
  }

  const insertResult = await runner.insert(payload);
  if (insertResult?.error) {
    throw new Error(
      `Failed to persist ${kind}: ${String(insertResult.error.message ?? "unknown error")}`
    );
  }

  return payload.updated_at;
}

export async function saveNeejeeOnboardingSnapshotLive(patch: unknown) {
  const current = await getNeejeeOnboardingSnapshotLive();
  const merged = deepMerge(current, isRecord(patch) ? patch : {});

  const updatedAt = await persistNeejeeSnapshot("onboarding", merged as AnyRecord);

  return deepMerge(merged, {
    workspace: {
      updatedAtLabel: String(
        updatedAt ??
          ((merged as AnyRecord).workspace?.updatedAtLabel ??
            (merged as AnyRecord).workspace?.updatedAt ??
            "")
      ),
    },
  });
}

export async function saveNeejeeBrandIntelligenceSnapshotLive(patch: unknown) {
  const current = await getNeejeeBrandIntelligenceSnapshotLive();
  const merged = deepMerge(current, isRecord(patch) ? patch : {});

  const updatedAt = await persistNeejeeSnapshot("brand_intelligence", merged as AnyRecord);

  return deepMerge(merged, {
    workspace: {
      updatedAt: String(
        updatedAt ??
          ((merged as AnyRecord).workspace?.updatedAt ??
            (merged as AnyRecord).workspace?.updatedAtLabel ??
            "")
      ),
    },
  });
}

export async function saveNeejeePilotControlSnapshotLive(patch: unknown) {
  const current = await getNeejeePilotControlSnapshotLive();
  const merged = deepMerge(current, isRecord(patch) ? patch : {});

  const updatedAt = await persistNeejeeSnapshot("pilot_control", merged as AnyRecord);

  return deepMerge(merged, {
    workspace: {
      updatedAt: String(
        updatedAt ??
          ((merged as AnyRecord).workspace?.updatedAt ??
            (merged as AnyRecord).workspace?.updatedAtLabel ??
            "")
      ),
    },
  });
}
/* M13E_WRITE_RAILS_END */
