export type ReadinessState = "ready" | "in_progress" | "blocked" | "later";

export type ReadinessCard = {
  slug: string;
  title: string;
  score: number;
  state: ReadinessState;
  summary: string;
  owner: string;
};

export type ServiceModule = {
  slug: string;
  title: string;
  state: ReadinessState;
  owner: string;
  summary: string;
};

export type IntegrationItem = {
  slug: string;
  title: string;
  state: ReadinessState;
  owner: string;
  dependency: string;
  nextAction: string;
};

export type ActivationStep = {
  slug: string;
  title: string;
  state: "done" | "current" | "next" | "waiting";
  summary: string;
};

export type BlockerItem = {
  title: string;
  severity: "critical" | "high" | "medium";
  owner: string;
  action: string;
};

export type TaskItem = {
  title: string;
  owner: string;
  due: string;
  state: "active" | "pending" | "waiting";
};

export type NeejeeOnboardingSnapshot = {
  workspace: {
    slug: string;
    brand: string;
    legalEntity: string;
    stage: string;
    stageSummary: string;
    autonomyLevel: string;
    environment: string;
    pilotState: string;
    updatedAtLabel: string;
  };
  readiness: ReadinessCard[];
  services: ServiceModule[];
  integrations: IntegrationItem[];
  timeline: ActivationStep[];
  blockers: BlockerItem[];
  brandContext: string[];
  tasks: TaskItem[];
  decisions: string[];
};

export function getNeejeeOnboardingSnapshot(): NeejeeOnboardingSnapshot {
  return {
    workspace: {
      slug: "neejee-pilot",
      brand: "Neejee",
      legalEntity: "Oye Imagine Private Limited",
      stage: "Activation preparation",
      stageSummary:
        "Neejee is configured as the first live reference tenant for the Oye !magine AI Growth OS, with onboarding now moving from design-aligned setup into operational activation readiness.",
      autonomyLevel: "Level 2 · Approval-based execution",
      environment: "Draft / sandbox",
      pilotState: "Pilot tenant configured · no live publishing or unrestricted spend",
      updatedAtLabel: "25 Jul 2026 · 08:00 UTC",
    },
    readiness: [
      {
        slug: "brand-profile",
        title: "Brand profile",
        score: 88,
        state: "ready",
        summary: "Neejee brand context, premium positioning and founder-led narrative are now structured well enough for guided execution.",
        owner: "Brand Intelligence",
      },
      {
        slug: "website-ingestion",
        title: "Website ingestion",
        score: 72,
        state: "in_progress",
        summary: "Website and category structure are understood at pilot level, but full governed ingestion and page inventory still need expansion.",
        owner: "Growth Ops",
      },
      {
        slug: "analytics-readiness",
        title: "Analytics readiness",
        score: 54,
        state: "blocked",
        summary: "The reporting surface exists, but verified live analytics and attribution completeness still depend on connected production credentials.",
        owner: "Data & Analytics",
      },
      {
        slug: "search-readiness",
        title: "Search readiness",
        score: 68,
        state: "in_progress",
        summary: "SEO and AI-search planning can begin immediately, but final prioritisation needs fuller Search Console and crawl evidence.",
        owner: "SEO",
      },
      {
        slug: "paid-media-readiness",
        title: "Paid media readiness",
        score: 49,
        state: "blocked",
        summary: "Campaign governance foundations are in place, but production launch still requires verified ad-account connectivity and budget authority.",
        owner: "Performance Marketing",
      },
      {
        slug: "social-readiness",
        title: "Social readiness",
        score: 61,
        state: "in_progress",
        summary: "Content operations direction is defined, but channel-by-channel activation and policy-safe publishing flows need completion.",
        owner: "Social Studio",
      },
      {
        slug: "contract-readiness",
        title: "Contract readiness",
        score: 45,
        state: "blocked",
        summary: "Agreement inventory and signing logic are part of the roadmap, but pilot-grade commercial document automation is not complete yet.",
        owner: "Legal Ops",
      },
      {
        slug: "billing-readiness",
        title: "Billing readiness",
        score: 42,
        state: "blocked",
        summary: "Client media balance and subscription finance architecture are defined directionally, but not yet production-complete.",
        owner: "Finance Ops",
      },
    ],
    services: [
      {
        slug: "seo",
        title: "SEO and AI-search",
        state: "ready",
        owner: "SEO",
        summary: "Ready for audit-led planning, content clustering and initial opportunity mapping.",
      },
      {
        slug: "google-ads",
        title: "Google Ads",
        state: "in_progress",
        owner: "Performance Marketing",
        summary: "Governance model is ready; channel activation depends on connected accounts and approval thresholds.",
      },
      {
        slug: "meta-ads",
        title: "Meta Ads",
        state: "in_progress",
        owner: "Performance Marketing",
        summary: "Draft-mode campaign planning can proceed, but production launch is blocked on verified business assets.",
      },
      {
        slug: "social",
        title: "Organic social",
        state: "in_progress",
        owner: "Social Studio",
        summary: "Calendar, creative and channel pacing can be prepared while publishing connectors are finalised.",
      },
      {
        slug: "landing-pages",
        title: "Landing pages",
        state: "ready",
        owner: "Web Experience",
        summary: "The governed page-generation path is ready for Neejee campaign-page exploration.",
      },
      {
        slug: "creative-studio",
        title: "Creative studio",
        state: "ready",
        owner: "Creative Direction",
        summary: "The brand-safe creative operating layer can now support campaign concept generation.",
      },
      {
        slug: "reporting",
        title: "Executive reporting",
        state: "in_progress",
        owner: "Data & Analytics",
        summary: "Boardroom-style surfaces are emerging, but live-source completeness still needs integration maturity.",
      },
      {
        slug: "marketplace",
        title: "Marketplace specialists",
        state: "ready",
        owner: "Marketplace Ops",
        summary: "Assignment and request lifecycle foundations are now stable enough for pilot-driven service routing.",
      },
      {
        slug: "whatsapp",
        title: "WhatsApp readiness",
        state: "later",
        owner: "Lifecycle Marketing",
        summary: "Architecture will be prepared, but commercial activation remains intentionally disabled.",
      },
      {
        slug: "sms",
        title: "SMS readiness",
        state: "later",
        owner: "Lifecycle Marketing",
        summary: "DLT-sensitive messaging support is deferred until regulatory and vendor activation are ready.",
      },
    ],
    integrations: [
      {
        slug: "website",
        title: "Neejee website",
        state: "ready",
        owner: "Growth Ops",
        dependency: "Pilot site access completed",
        nextAction: "Expand governed page inventory and structured page mapping.",
      },
      {
        slug: "ga4",
        title: "Google Analytics 4",
        state: "blocked",
        owner: "Data & Analytics",
        dependency: "Verified property access required",
        nextAction: "Connect GA4 property and validate event coverage.",
      },
      {
        slug: "search-console",
        title: "Search Console",
        state: "blocked",
        owner: "SEO",
        dependency: "Verified ownership and access required",
        nextAction: "Connect Search Console and pull search-performance baselines.",
      },
      {
        slug: "google-ads",
        title: "Google Ads",
        state: "blocked",
        owner: "Performance Marketing",
        dependency: "Manager access and spend authority required",
        nextAction: "Connect account in test mode and validate campaign draft permissions.",
      },
      {
        slug: "meta-business",
        title: "Meta Business Manager",
        state: "blocked",
        owner: "Performance Marketing",
        dependency: "Business verification and asset access required",
        nextAction: "Link business assets and confirm ad-account roles.",
      },
      {
        slug: "instagram",
        title: "Instagram professional account",
        state: "in_progress",
        owner: "Social Studio",
        dependency: "Channel verification and publishing eligibility",
        nextAction: "Confirm account linkage and posting scope.",
      },
      {
        slug: "linkedin",
        title: "LinkedIn page",
        state: "later",
        owner: "Social Studio",
        dependency: "Brand decision on channel priority",
        nextAction: "Keep dormant until B2B channel activation is approved.",
      },
      {
        slug: "youtube",
        title: "YouTube channel",
        state: "later",
        owner: "Creative Direction",
        dependency: "Video roadmap approval",
        nextAction: "Activate once long-form and short-form video lane is approved.",
      },
      {
        slug: "merchant-center",
        title: "Merchant Center",
        state: "blocked",
        owner: "Commerce Ops",
        dependency: "Feed and product-policy validation",
        nextAction: "Prepare product feed and validate commerce eligibility.",
      },
      {
        slug: "catalog",
        title: "Product catalog",
        state: "in_progress",
        owner: "Commerce Ops",
        dependency: "Structured product export required",
        nextAction: "Normalize categories, offers and product attributes.",
      },
      {
        slug: "payments",
        title: "Payment and billing rail",
        state: "later",
        owner: "Finance Ops",
        dependency: "Commercial and legal structure confirmation",
        nextAction: "Stage client media balance architecture before provider activation.",
      },
    ],
    timeline: [
      {
        slug: "discovery",
        title: "Discovery and brand capture",
        state: "done",
        summary: "Pilot brand context and product intent are defined.",
      },
      {
        slug: "ingestion",
        title: "Website and channel ingestion",
        state: "current",
        summary: "Website, content and operational readiness are being structured into governed inputs.",
      },
      {
        slug: "strategy",
        title: "Strategy synthesis",
        state: "next",
        summary: "Generate the Neejee growth blueprint once connected data is sufficient.",
      },
      {
        slug: "approvals",
        title: "Approvals and commercial sign-off",
        state: "waiting",
        summary: "Budget authority, service scope and commercial approvals must be locked.",
      },
      {
        slug: "configuration",
        title: "Channel configuration",
        state: "waiting",
        summary: "Ad accounts, analytics and reporting rails move here after approvals.",
      },
      {
        slug: "draft-campaigns",
        title: "Draft campaigns and content system",
        state: "waiting",
        summary: "Create campaign drafts, landing pages, calendars and creative variants.",
      },
      {
        slug: "reporting",
        title: "Executive reporting",
        state: "waiting",
        summary: "Stand up repeatable executive, operator and client-level reporting.",
      },
      {
        slug: "activation",
        title: "Guardrailed activation",
        state: "waiting",
        summary: "Move into controlled publishing and draft-to-live launch only after approvals.",
      },
    ],
    blockers: [
      {
        title: "Verified analytics and ad-account credentials are still missing for full activation readiness.",
        severity: "critical",
        owner: "Client + Performance Marketing",
        action: "Collect account access and validate data flow before enabling live execution.",
      },
      {
        title: "Contract package and commercial validity workflow are not yet productised for the Neejee pilot.",
        severity: "high",
        owner: "Legal Ops",
        action: "Define the pilot agreement package and signing path before managed-service activation.",
      },
      {
        title: "Client media balance and billing governance need product-grade visibility before live spend authority is enabled.",
        severity: "high",
        owner: "Finance Ops",
        action: "Implement balance, invoice and approval surfaces before any funded activation lane opens.",
      },
    ],
    brandContext: [
      "Neejee means personal — the brand should feel intimate, considered and culturally rooted rather than mass-market.",
      "The core emotional posture is quiet luxury with authenticity, provenance and founder-led storytelling.",
      "Product narratives should preserve Indian craft depth without sounding touristy, generic or loudly promotional.",
      "The pilot experience should feel premium, calm, intelligent and commerce-ready, not like an agency dashboard.",
      "Brand language should stay elegant, assured and emotionally warm while maintaining operational seriousness.",
    ],
    tasks: [
      {
        title: "Complete GA4 and Search Console connection checklist",
        owner: "Data & Analytics",
        due: "Next operator milestone",
        state: "active",
      },
      {
        title: "Finalize service scope and pilot commercial package",
        owner: "Account Director",
        due: "Before activation review",
        state: "active",
      },
      {
        title: "Prepare first Neejee growth strategy deck structure",
        owner: "Strategy",
        due: "After ingestion checkpoint",
        state: "pending",
      },
      {
        title: "Map product feed normalization requirements",
        owner: "Commerce Ops",
        due: "Before shopping-channel planning",
        state: "pending",
      },
      {
        title: "Define client media balance visibility surface",
        owner: "Finance Ops",
        due: "Before paid-media activation",
        state: "waiting",
      },
    ],
    decisions: [
      "Which service modules go live in the first Neejee operating phase?",
      "Who holds final approval authority for budget, content and campaign launch?",
      "Will Neejee begin with draft-only execution or approval-based execution for paid media?",
      "Which connected data sources are mandatory before the strategy presentation is considered final?",
    ],
  };
}