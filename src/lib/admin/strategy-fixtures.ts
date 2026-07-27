import { getWorkspaceDisplayName } from "@/lib/admin/workspace-branding";

import {
  createStrategyBriefRecord,
  type StrategyBriefRecord,
} from "./strategy-schema";

export function createDefaultStrategyBriefFixture(): StrategyBriefRecord {
  const workspaceDisplayName = getWorkspaceDisplayName();

  return createStrategyBriefRecord({
    workspaceDisplayName,
    brandName: "Neejee Clinics",
    pilotId: "neejee-pilot",
    status: "draft",
    positioning:
      "Neejee should position itself as a measurable, operator-friendly growth engine for modern clinics and healthcare businesses.",
    offerSummary:
      "Start with a focused pilot covering onboarding clarity, strategy generation, landing page planning, SEO clusters, and paid media readiness.",
    marketSummary:
      "Clinic operators need dependable lead generation, clear governance, and execution visibility without adding internal complexity.",
    messagingPillars: [
      {
        title: "Revenue clarity",
        description:
          "Show a direct path from channel activity to qualified consultations and booked appointments.",
      },
      {
        title: "Operator trust",
        description:
          "Highlight governance, visibility, and approval-based execution suitable for healthcare teams.",
      },
      {
        title: "Execution speed",
        description:
          "Reduce time from strategy to launch with reusable playbooks and structured workflows.",
      },
    ],
    audienceSegments: [
      {
        name: "Founders and clinic owners",
        painPoints: [
          "Unpredictable lead flow",
          "Agency opacity",
          "Weak attribution across channels",
        ],
        buyingSignals: [
          "Actively reviewing monthly spend",
          "Requests weekly reporting",
          "Needs rapid pilot proof",
        ],
      },
      {
        name: "Multi-location operators",
        painPoints: [
          "Fragmented execution",
          "Inconsistent brand messaging",
          "No unified growth dashboard",
        ],
        buyingSignals: [
          "Expanding to new geographies",
          "Hiring marketing coordinators",
          "Requires approval workflow",
        ],
      },
    ],
    channelRecommendations: [
      {
        channel: "SEO",
        objective: "Capture high-intent search demand",
        rationale: "Build durable demand capture for treatment, clinic, and geo-intent queries.",
      },
      {
        channel: "Google Ads",
        objective: "Drive qualified consultation demand",
        rationale: "Convert urgent and commercial-intent queries with strict budget control.",
      },
      {
        channel: "Meta Ads",
        objective: "Create retargeting and offer amplification",
        rationale: "Support remarketing, social proof, and creative testing for lead quality uplift.",
      },
    ],
    plan30Days: [
      {
        label: "Foundation",
        actions: [
          "Finalize positioning",
          "Approve ICP and geo priorities",
          "Lock landing page brief",
        ],
      },
    ],
    plan60Days: [
      {
        label: "Launch",
        actions: [
          "Publish landing page",
          "Activate SEO topic cluster",
          "Launch first paid media experiments",
        ],
      },
    ],
    plan90Days: [
      {
        label: "Optimization",
        actions: [
          "Scale winning channels",
          "Refine messaging by segment",
          "Introduce executive dashboard reporting",
        ],
      },
    ],
    successMetrics: [
      "Qualified leads",
      "Consultation bookings",
      "Cost per lead",
      "Landing page conversion rate",
    ],
    assumptions: [
      "Client can approve strategy within 48 hours",
      "Landing page build resources are available",
      "Tracking stack can be configured during pilot",
    ],
    blockers: [
      "No final compliance review flow yet",
      "Production RBAC still pending for approval actions",
    ],
  });
}

export const defaultStrategyBriefFixture = createDefaultStrategyBriefFixture();