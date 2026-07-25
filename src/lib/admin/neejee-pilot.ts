import { getNeejeeOnboardingSnapshot } from "@/lib/admin/onboarding-seed";
import { getNeejeeBrandIntelligenceSnapshot } from "@/lib/admin/brand-intelligence-seed";

type PilotStatus = "blocked" | "review_required" | "in_progress" | "ready";

export type NeejeePilotStage = {
  id: string;
  title: string;
  href: string;
  owner: string;
  status: PilotStatus;
  summary: string;
  signals: string[];
};

export type NeejeePilotAction = {
  label: string;
  href: string;
  tone: "primary" | "secondary" | "ghost";
  detail: string;
};

export type NeejeePilotControlSnapshot = {
  workspace: {
    brand: string;
    pilot: string;
    owner: string;
    updatedAt: string;
  };
  signals: {
    readinessScore: number;
    blockedLanes: number;
    approvedLanguageCount: number;
    prohibitedLanguageCount: number;
    profileStatus: string;
    serviceCount: number;
    pendingIntegrations: number;
  };
  stages: NeejeePilotStage[];
  nextActions: NeejeePilotAction[];
  executiveBrief: string[];
  onboarding: ReturnType<typeof getNeejeeOnboardingSnapshot>;
  brandIntelligence: ReturnType<typeof getNeejeeBrandIntelligenceSnapshot>;
};

function normalizeStatus(value: unknown): PilotStatus {
  const text = String(value ?? "").trim().toLowerCase();

  if (!text) return "in_progress";
  if (text.includes("block")) return "blocked";
  if (text.includes("review")) return "review_required";
  if (text.includes("ready") || text.includes("approved") || text.includes("complete")) return "ready";
  return "in_progress";
}

export function getNeejeePilotControlSnapshot(): NeejeePilotControlSnapshot {
  const onboarding = getNeejeeOnboardingSnapshot();
  const brandIntelligence = getNeejeeBrandIntelligenceSnapshot();

  const readinessCards = Array.isArray((onboarding as any).readinessCards)
    ? ((onboarding as any).readinessCards as Array<any>)
    : [];

  const services = Array.isArray((onboarding as any).services)
    ? ((onboarding as any).services as Array<any>)
    : [];

  const integrations = Array.isArray((onboarding as any).integrations)
    ? ((onboarding as any).integrations as Array<any>)
    : [];

  const brandIdentityCards = Array.isArray((brandIntelligence as any).identityCards)
    ? ((brandIntelligence as any).identityCards as Array<any>)
    : [];

  const approvedLanguage = Array.isArray((brandIntelligence as any).approvedLanguage)
    ? ((brandIntelligence as any).approvedLanguage as Array<any>)
    : [];

  const prohibitedLanguage = Array.isArray((brandIntelligence as any).prohibitedLanguage)
    ? ((brandIntelligence as any).prohibitedLanguage as Array<any>)
    : [];

  const readinessScore = readinessCards.length
    ? Math.round(
        readinessCards.reduce((sum, card) => sum + Number(card.score ?? card.readiness ?? 0), 0) /
          readinessCards.length
      )
    : 0;

  const blockedCards = readinessCards.filter((card) => normalizeStatus(card.status) === "blocked");
  const pendingIntegrations = integrations.filter((item) => normalizeStatus(item.status) !== "ready");

  const profileStatus = String((brandIntelligence as any).profileStatus ?? "review_required");
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
        `${brandIdentityCards.length} identity card(s)`,
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
      : "No hard onboarding blockers are currently visible in the seeded pilot view.",
    pendingIntegrations.length > 0
      ? `${pendingIntegrations.length} integration dependency(ies) still need operational closure before launch.`
      : "Integration readiness is aligned with activation planning.",
  ];

  return {
    workspace: {
      brand: String((onboarding as any).workspace?.brand ?? "Neejee"),
      pilot: "Neejee pilot",
      owner: String((onboarding as any).workspace?.owner ?? "Neejee founder"),
      updatedAt: String(
        (brandIntelligence as any).workspace?.updatedAt ??
          (onboarding as any).workspace?.updatedAt ??
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