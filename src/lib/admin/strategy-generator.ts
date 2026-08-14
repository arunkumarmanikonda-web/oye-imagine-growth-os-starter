import { getPilot } from "@/lib/admin/pilot-store";
import {
  isNeejeeContext,
  neejeeBrandTruth,
} from "@/lib/admin/neejee-brand-truth";
import type { NeejeePilotRecord } from "@/lib/admin/pilot-schema";

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
  return normalized || "controlled pilot budget";
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

function buildNeejeeStrategyBrief(pilot: NeejeePilotRecord): StrategyBriefRecord {
  const channels = pilot.primaryChannels.length > 0
    ? pilot.primaryChannels
    : ["seo", "google-ads", "meta-ads"];

  const channelRecommendations: ChannelRecommendation[] = channels.map((channel) => {
    const normalized = normalizeChannelName(channel);
    const lower = channel.toLowerCase();

    if (lower === "seo") {
      return {
        channel: normalized,
        objective: "Capture product, craft, technique, region and care/discovery intent",
        rationale: neejeeBrandTruth.growth.channelIntent.seo,
      };
    }

    if (lower.includes("google")) {
      return {
        channel: normalized,
        objective: "Capture high-intent product discovery and purchase demand",
        rationale: neejeeBrandTruth.growth.channelIntent.googleAds,
      };
    }

    if (lower.includes("meta")) {
      return {
        channel: normalized,
        objective: "Drive visual discovery, retargeting and commerce conversion",
        rationale: neejeeBrandTruth.growth.channelIntent.metaAds,
      };
    }

    return {
      channel: normalized,
      objective: "Deepen relevant product discovery and repeat engagement",
      rationale: neejeeBrandTruth.growth.channelIntent.lifecycle,
    };
  });

  const messagingPillars: StrategyPillar[] = [
    {
      title: "Found with provenance",
      description:
        "Make maker, region, technique, material and origin part of the product value so discovery carries meaning rather than only catalogue metadata.",
    },
    {
      title: "Personal discovery",
      description:
        "Use founder curation, editorial craft stories, gifting and AI-assisted discovery to help shoppers find products that feel considered rather than anonymous.",
    },
    {
      title: "Commerce with restraint",
      description:
        "Improve conversion through clarity, trust, product context and ease of purchase without allowing generic discount language to dominate the brand.",
    },
  ];

  const audienceSegments: AudienceSegment[] = [
    {
      name: "Craft- and design-conscious shoppers",
      painPoints: [
        "Authentic and distinctive products are difficult to discover online",
        "Mass marketplaces often remove maker and provenance context",
        "It is hard to assess distinctiveness and trust from anonymous listings",
      ],
      buyingSignals: [
        "Searches by craft, region, technique, material or category",
        "Engages with maker stories, journal content or curated edits",
        "Uses product visualisation or comparison before purchase",
      ],
    },
    {
      name: "Meaning-led gift and home buyers",
      painPoints: [
        "Generic gifts feel impersonal",
        "Home and lifestyle products can be difficult to imagine in context",
        "Curated, story-rich products are fragmented across many sources",
      ],
      buyingSignals: [
        "Browses founder edits and new arrivals",
        "Uses Concierge or Space for guided discovery",
        "Returns to collections, journal content or email drops",
      ],
    },
  ];

  return saveStrategyBrief({
    pilotId: pilot.id,
    workspaceDisplayName: pilot.workspaceDisplayName,
    brandName: neejeeBrandTruth.identity.displayName,
    status: "generated",
    positioning:
      "Neejee should win through founder-led discovery, provenance and quiet editorial commerce: make India's living craft easier to find, understand and buy without becoming a generic discount marketplace.",
    offerSummary: neejeeBrandTruth.business.model,
    marketSummary:
      "The opportunity is not another anonymous product grid. Neejee can create a trusted discovery layer across textiles, jewellery, accessories, home objects, art, decor and gifting by preserving the maker, region, technique and meaning behind the product.",
    messagingPillars,
    audienceSegments,
    channelRecommendations,
    plan30Days: [
      {
        label: "Truth and measurement",
        actions: [
          "Lock category, provenance and claims taxonomy from live product data",
          "Map ecommerce events from product view through purchase",
          "Build initial search and creative themes from real products, crafts and regions",
        ],
      },
    ],
    plan60Days: [
      {
        label: "Controlled launch",
        actions: [
          "Launch provenance-rich SEO and landing experiments",
          "Run approved paid-search and visual-discovery tests only after provider verification",
          "Start lifecycle journeys around new arrivals, discovery and cart/purchase behaviour",
        ],
      },
    ],
    plan90Days: [
      {
        label: "Learn and scale",
        actions: [
          "Scale categories, queries and creative themes using verified purchase evidence",
          "Increase use of Mirror, Space and Concierge where they improve discovery",
          "Refine acquisition and retention by product, craft, audience and channel economics",
        ],
      },
    ],
    successMetrics: [...neejeeBrandTruth.growth.primaryMetrics],
    assumptions: [
      "Product, catalogue and ecommerce analytics data can be ingested with sufficient freshness",
      "Provenance and product claims used in campaigns are backed by approved source data",
      "External channel execution remains approval-gated until provider-side verification is complete",
    ],
    blockers: [
      "Live paid-media execution remains blocked until provider account and external resource-ID verification exists",
      "Time-sensitive commercial claims must be refreshed from Neejee before publication",
    ],
  });
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
    "Production provider execution must remain approval-gated until verified",
    "Claims used in public campaign assets require approved source evidence",
  ];

  if (pilot.competitors.length === 0) blockers.push("Competitor inputs are still sparse");
  if (pilot.successMetrics.length === 0) blockers.push("Success metrics need stronger quantification");
  return blockers;
}

export function buildStrategyBriefFromPilot(
  pilot: NeejeePilotRecord = getPilot(),
): StrategyBriefRecord {
  if (isNeejeeContext(pilot)) {
    return buildNeejeeStrategyBrief(pilot);
  }

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
      : ["Qualified leads", "Conversion rate", "Cost per acquisition"],
    assumptions: createAssumptions(pilot),
    blockers: createBlockers(pilot),
  });
}

export function generateStrategyBrief(pilotId?: string): StrategyBriefRecord {
  const pilot = getPilot();

  if (pilotId && pilot.id !== pilotId) {
    throw new Error(`Pilot '${pilotId}' not found.`);
  }

  return buildStrategyBriefFromPilot(pilot);
}
