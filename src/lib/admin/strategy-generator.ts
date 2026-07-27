import { getPilot, type NeejeePilotRecord } from "@/lib/admin/pilot-store";

import { saveStrategyBrief } from "./strategy-store";
import type {
  AudienceSegment,
  ChannelRecommendation,
  StrategyBriefRecord,
  StrategyMilestone,
  StrategyPillar,
} from "./strategy-schema";

function toCurrencyLabel(value: string): string {
  const normalized = value.trim();
  if (!normalized) {
    return "controlled pilot budget";
  }

  return normalized;
}

function normalizeChannelName(value: string): string {
  return value
    .split("-")
    .map((part) => {
      const lower = part.trim().toLowerCase();
      if (lower === "seo") return "SEO";
      if (lower === "meta") return "Meta";
      if (lower === "ads") return "Ads";
      if (lower === "google") return "Google";
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

function createMessagingPillars(pilot: NeejeePilotRecord): StrategyPillar[] {
  const goals = pilot.goals.length > 0 ? pilot.goals : ["qualified leads", "predictable growth"];
  const offer = pilot.offer || "growth operating system";

  return [
    {
      title: "Outcome clarity",
      description: `Tie ${offer} delivery to measurable outcomes such as ${goals[0]}.`,
    },
    {
      title: "Operator confidence",
      description: `Show ${pilot.targetAudience || "operators"} a governed workflow with visible approvals, reporting, and execution ownership.`,
    },
    {
      title: "Speed with control",
      description: `Launch faster in ${pilot.geo || "priority markets"} without sacrificing tracking, visibility, or channel discipline.`,
    },
  ];
}

function createAudienceSegments(pilot: NeejeePilotRecord): AudienceSegment[] {
  const targetAudience = pilot.targetAudience || "Founders and operators";
  const competitors = pilot.competitors.length > 0 ? pilot.competitors : ["incumbent agencies"];

  return [
    {
      name: targetAudience,
      painPoints: [
        "Lead flow is inconsistent",
        "Channel performance is hard to compare",
        "Vendors do not provide execution transparency",
      ],
      buyingSignals: [
        "Requests frequent performance reviews",
        "Needs faster launch velocity",
        `Benchmarking against ${competitors[0]}`,
      ],
    },
    {
      name: `${pilot.industry || "Service"} growth owners`,
      painPoints: [
        "Growth execution is fragmented across tools",
        "Offers are not translated into channel strategy",
        "Budget allocation lacks clear evidence",
      ],
      buyingSignals: [
        `Has active budget around ${toCurrencyLabel(pilot.monthlyBudget)}`,
        "Wants structured approval checkpoints",
        "Needs a repeatable operating cadence",
      ],
    },
  ];
}

function createChannelRecommendations(pilot: NeejeePilotRecord): ChannelRecommendation[] {
  const channels = pilot.primaryChannels.length > 0
    ? pilot.primaryChannels
    : ["seo", "google-ads", "meta-ads"];

  return channels.map((channel) => ({
    channel: normalizeChannelName(channel),
    objective:
      channel === "seo"
        ? "Capture high-intent organic demand"
        : channel.includes("google")
          ? "Drive qualified conversion demand"
          : "Support audience education and retargeting",
    rationale: `Align ${normalizeChannelName(channel)} with ${pilot.goals[0] || "pilot demand generation"} for ${pilot.brandName || "the brand"} in ${pilot.geo || "priority markets"}.`,
  }));
}

function createPlanMilestones(pilot: NeejeePilotRecord): {
  plan30Days: StrategyMilestone[];
  plan60Days: StrategyMilestone[];
  plan90Days: StrategyMilestone[];
} {
  return {
    plan30Days: [
      {
        label: "Foundation",
        actions: [
          `Validate positioning for ${pilot.brandName || "the brand"}`,
          `Finalize audience focus: ${pilot.targetAudience || "operators"}`,
          `Approve core offer: ${pilot.offer || "growth operating system"}`,
        ],
      },
    ],
    plan60Days: [
      {
        label: "Launch",
        actions: [
          "Ship landing page and tracking baseline",
          "Activate first channel experiments",
          `Measure progress against ${pilot.successMetrics[0] || "qualified leads"}`,
        ],
      },
    ],
    plan90Days: [
      {
        label: "Optimization",
        actions: [
          "Scale winning channels with governance checkpoints",
          "Refine messaging by segment and offer response",
          "Publish operator-facing reporting rhythm",
        ],
      },
    ],
  };
}

function createAssumptions(pilot: NeejeePilotRecord): string[] {
  return [
    `${pilot.brandName || "Client"} can approve strategy decisions within 48 hours`,
    "Tracking and reporting access can be configured during the pilot",
    `Monthly budget of ${toCurrencyLabel(pilot.monthlyBudget)} is available for controlled experiments`,
  ];
}

function createBlockers(pilot: NeejeePilotRecord): string[] {
  const blockers = [
    "Production RBAC and approval hardening still pending",
    "Compliance review workflow is not fully automated yet",
  ];

  if (pilot.competitors.length === 0) {
    blockers.push("Competitor inputs are still sparse");
  }

  if (pilot.successMetrics.length === 0) {
    blockers.push("Success metrics need stronger quantification");
  }

  return blockers;
}

export function buildStrategyBriefFromPilot(
  pilot: NeejeePilotRecord = getPilot(),
): StrategyBriefRecord {
  const plans = createPlanMilestones(pilot);

  return saveStrategyBrief({
    pilotId: pilot.id,
    workspaceDisplayName: pilot.workspaceDisplayName,
    brandName: pilot.brandName,
    status: "generated",
    positioning: `${pilot.brandName || "The brand"} should win in ${pilot.geo || "its market"} by offering a governed, measurable path to ${pilot.goals[0] || "growth"} for ${pilot.targetAudience || "its target audience"}.`,
    offerSummary: pilot.offer || "Growth operating system pilot",
    marketSummary: `${pilot.industry || "Service"} buyers in ${pilot.geo || "target geographies"} need trust, clarity, and measurable performance before scaling spend.`,
    messagingPillars: createMessagingPillars(pilot),
    audienceSegments: createAudienceSegments(pilot),
    channelRecommendations: createChannelRecommendations(pilot),
    plan30Days: plans.plan30Days,
    plan60Days: plans.plan60Days,
    plan90Days: plans.plan90Days,
    successMetrics: pilot.successMetrics.length > 0
      ? pilot.successMetrics
      : ["Qualified leads", "Consultation rate", "Cost per lead"],
    assumptions: createAssumptions(pilot),
    blockers: createBlockers(pilot),
  });
}

export function generateStrategyBrief(
  pilotId?: string,
): StrategyBriefRecord {
  const pilot = getPilot();

  if (pilotId && pilot.id !== pilotId) {
    throw new Error(`Pilot '${pilotId}' not found.`);
  }

  return buildStrategyBriefFromPilot(pilot);
}