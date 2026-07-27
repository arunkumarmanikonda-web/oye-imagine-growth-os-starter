import { getWorkspaceDisplayName } from "@/lib/admin/workspace-branding";

import {
  createLandingPageBriefRecord,
  type LandingPageBriefRecord,
} from "./landing-page-schema";

export function createDefaultLandingPageBriefFixture(): LandingPageBriefRecord {
  const workspaceDisplayName = getWorkspaceDisplayName();

  return createLandingPageBriefRecord({
    workspaceDisplayName,
    brandName: "Neejee Clinics",
    pilotId: "neejee-pilot",
    strategyId: "neejee-strategy-brief",
    status: "draft",
    hero: {
      headline: "Neejee Clinics growth operating system for modern healthcare teams",
      subheadline:
        "Launch measurable patient-demand systems with operator visibility, approval guardrails, and faster execution.",
      primaryCta: "Book a strategy session",
      secondaryCta: "Review pilot plan",
    },
    sections: [
      {
        id: "positioning",
        title: "Why Neejee",
        description:
          "Translate strategy into a landing page that explains trust, outcomes, and execution clarity for clinics.",
        bullets: [
          "Governed operator workflow",
          "Qualified demand generation",
          "Clear reporting and approval controls",
        ],
      },
      {
        id: "offer",
        title: "What the pilot delivers",
        description:
          "Show the immediate value of the pilot with practical deliverables and a measurable execution path.",
        bullets: [
          "Strategy brief",
          "Landing page planning",
          "SEO and paid media readiness",
        ],
      },
      {
        id: "proof",
        title: "Why buyers should trust the process",
        description:
          "Reinforce operator trust with transparent systems, proof points, and compliance-aware execution language.",
        bullets: [
          "Approval checkpoints",
          "Operator-facing reporting",
          "Performance visibility by channel",
        ],
      },
    ],
    seoMeta: {
      title: "Neejee Clinics | Strategy-led growth operating system",
      description:
        "Strategy-led landing page brief for Neejee Clinics focused on qualified demand, trust, and measurable execution.",
      keywords: [
        "Neejee Clinics",
        "healthcare growth system",
        "clinic lead generation",
        "landing page strategy",
      ],
    },
    ctas: [
      "Book a strategy session",
      "Review pilot plan",
      "Request channel roadmap",
    ],
    proofPoints: [
      "Built from pilot strategy brief",
      "Mapped to qualified lead goals",
      "Structured for governed execution",
    ],
    assets: [
      {
        type: "logo",
        label: "Neejee primary logo",
        description: "Use the approved brand logo in the hero and footer.",
      },
      {
        type: "testimonial",
        label: "Operator testimonial",
        description: "Short credibility quote from a healthcare operator persona.",
      },
      {
        type: "illustration",
        label: "Governed growth workflow",
        description: "Visual showing strategy, approvals, launch, and reporting loop.",
      },
    ],
  });
}

export const defaultLandingPageBriefFixture = createDefaultLandingPageBriefFixture();