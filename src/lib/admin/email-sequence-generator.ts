import { getGoogleAdsDraft } from "@/lib/admin/google-ads-store";
import {
  createEmailSequenceDraftRecord,
  type EmailSequenceDraftRecord,
} from "@/lib/admin/email-sequence-schema";
import { saveEmailSequenceDraft } from "@/lib/admin/email-sequence-store";
import { getLandingPageBrief } from "@/lib/admin/landing-page-store";
import { getPilot } from "@/lib/admin/pilot-store";
import { getStrategyBrief } from "@/lib/admin/strategy-store";

type LooseRecord = Record<string, unknown>;

function asRecord(value: unknown): LooseRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as LooseRecord)
    : null;
}

function pickString(
  source: LooseRecord | null,
  keys: string[],
  fallback = "",
): string {
  if (!source) {
    return fallback;
  }

  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return fallback;
}

function pickNestedString(
  source: LooseRecord | null,
  path: string[],
  fallback = "",
): string {
  let current: unknown = source;

  for (const segment of path) {
    const record = asRecord(current);
    if (!record || !(segment in record)) {
      return fallback;
    }

    current = record[segment];
  }

  return typeof current === "string" && current.trim() ? current.trim() : fallback;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const items: string[] = [];

  for (const entry of value) {
    if (typeof entry === "string" && entry.trim()) {
      items.push(entry.trim());
      continue;
    }

    const record = asRecord(entry);
    if (!record) {
      continue;
    }

    const text = pickString(record, [
      "text",
      "title",
      "headline",
      "description",
      "copy",
      "value",
      "label",
    ]);

    if (text) {
      items.push(text);
    }
  }

  return items;
}

function matchesPilotId(source: LooseRecord | null, pilotId: string): boolean {
  if (!source) {
    return false;
  }

  const value = pickString(source, ["pilotId", "id"]);
  return !value || value === pilotId;
}

export function buildEmailSequenceDraftFromPilot(
  pilotId: string,
): EmailSequenceDraftRecord {
  const pilotRecord = asRecord(getPilot());

  if (!pilotRecord) {
    throw new Error(`Pilot not found: ${pilotId}`);
  }

  const resolvedPilotId = pickString(pilotRecord, ["pilotId", "id"]);
  if (resolvedPilotId && resolvedPilotId !== pilotId) {
    throw new Error(`Pilot not found: ${pilotId}`);
  }

  const strategyCandidate = asRecord(getStrategyBrief());
  const landingPageCandidate = asRecord(getLandingPageBrief());
  const googleAdsCandidate = asRecord(getGoogleAdsDraft());

  const strategyRecord = matchesPilotId(strategyCandidate, pilotId)
    ? strategyCandidate
    : null;
  const landingPageRecord = matchesPilotId(landingPageCandidate, pilotId)
    ? landingPageCandidate
    : null;
  const googleAdsRecord = matchesPilotId(googleAdsCandidate, pilotId)
    ? googleAdsCandidate
    : null;

  const workspaceId = pickString(pilotRecord, ["workspaceId"], "workspace-demo");
  const companyName = pickString(
    pilotRecord,
    ["companyName", "businessName", "brandName", "name", "workspaceName"],
    "Neejee",
  );
  const senderName = pickString(
    pilotRecord,
    ["senderName", "contactName", "founderName", "ownerName"],
    `${companyName} Team`,
  );
  const senderEmail = pickString(
    pilotRecord,
    ["senderEmail", "contactEmail", "email", "founderEmail"],
    "founder@example.com",
  );

  const persona = pickString(
    strategyRecord,
    ["audience", "persona", "idealCustomerProfile"],
    pickString(
      pilotRecord,
      ["persona", "targetPersona", "idealCustomerProfile"],
      "Founder-led B2B growth team",
    ),
  );

  const painPoint = pickString(
    strategyRecord,
    ["painPoint", "problemStatement", "customerPain"],
    "Campaign execution is fragmented across strategy, pages, ads, and email",
  );

  const desiredOutcome = pickString(
    strategyRecord,
    ["desiredOutcome", "valueProposition", "positioning"],
    "Ship coordinated campaigns faster without rewriting each asset",
  );

  const strategySummary = pickString(
    strategyRecord,
    ["summary", "executiveSummary", "coreStrategy", "positioning"],
    `${companyName} helps teams turn one strategy into coordinated execution.`,
  );

  const headline = pickNestedString(
    landingPageRecord,
    ["hero", "headline"],
    pickString(
      landingPageRecord,
      ["headline", "title"],
      `${companyName} keeps every campaign asset aligned`,
    ),
  );

  const subheadline = pickNestedString(
    landingPageRecord,
    ["hero", "subheadline"],
    pickString(
      landingPageRecord,
      ["subheadline", "description"],
      "Turn one brief into aligned pages, ads, and lifecycle email.",
    ),
  );

  const primaryCta = pickNestedString(
    landingPageRecord,
    ["hero", "primaryCta"],
    pickString(landingPageRecord, ["primaryCta", "ctaLabel"], "View landing page"),
  );

  const landingPageUrl = pickString(
    landingPageRecord,
    ["url", "pageUrl", "shareUrl", "publishedUrl"],
    `https://example.com/${pilotId}/landing-page`,
  );

  const adHeadlines = normalizeStringArray(
    googleAdsRecord ? googleAdsRecord["headlines"] : undefined,
  );
  const adDescriptions = normalizeStringArray(
    googleAdsRecord ? googleAdsRecord["descriptions"] : undefined,
  );
  const campaignName = pickString(
    googleAdsRecord,
    ["campaignName", "name"],
    `${companyName} growth system`,
  );

  const firstSubject =
    adHeadlines[0] ?? `A better way to launch ${companyName} campaigns`;
  const secondSubject =
    adHeadlines[1] ?? `How ${companyName} keeps campaign execution aligned`;
  const thirdSubject = `Want a tailored ${companyName} sequence for your team?`;

  const proofPoint =
    adDescriptions[0] ?? subheadline ?? strategySummary;

  return createEmailSequenceDraftRecord({
    pilotId,
    workspaceId,
    sequenceName: `${companyName} founder introduction sequence`,
    senderName,
    senderEmail,
    audience: {
      persona,
      painPoint,
      desiredOutcome,
    },
    strategySummary,
    landingPageUrl,
    emails: [
      {
        id: "email-1",
        subject: firstSubject,
        previewText: headline,
        body:
          `Hi there,\n\n` +
          `${painPoint}\n\n` +
          `${strategySummary}\n\n` +
          `The fastest way to evaluate the fit is to review the landing page message we built around this angle.\n\n` +
          `You can start here: ${landingPageUrl}`,
        ctaLabel: primaryCta,
        ctaHref: landingPageUrl,
        sendDelayDays: 0,
        goal: "Introduce the core offer and connect it to the primary pain point.",
      },
      {
        id: "email-2",
        subject: secondSubject,
        previewText: proofPoint,
        body:
          `Hi there,\n\n` +
          `A coordinated system works because every asset reinforces the same message.\n\n` +
          `Landing page hook: ${headline}\n` +
          `Google Ads campaign: ${campaignName}\n` +
          `Core proof point: ${proofPoint}\n\n` +
          `This reduces rewrite cycles and helps the team ship faster without losing the thread.`,
        ctaLabel: "See example workflow",
        ctaHref: landingPageUrl,
        sendDelayDays: 3,
        goal: "Show how the strategy, page, ads, and email stay aligned.",
      },
      {
        id: "email-3",
        subject: thirdSubject,
        previewText: "Reply if you want a version mapped to your funnel and offer.",
        body:
          `Hi there,\n\n` +
          `If the positioning is close, I can map the same structure to your funnel and current offer.\n\n` +
          `That usually makes the decision much easier because your team can react to a concrete draft instead of abstract recommendations.\n\n` +
          `Reply and I will send a tailored version.`,
        ctaLabel: "Reply to this email",
        ctaHref: `mailto:${senderEmail}`,
        sendDelayDays: 7,
        goal: "Prompt a reply or request for a tailored follow-up.",
      },
    ],
    notes: [
      "Align email subject lines with proven Google Ads language.",
      `Landing page anchor: ${headline}`,
      "Sequence flow: problem, proof, action.",
    ],
  });
}

export function generateEmailSequenceDraft(
  pilotId: string,
): EmailSequenceDraftRecord {
  const draft = buildEmailSequenceDraftFromPilot(pilotId);
  return saveEmailSequenceDraft(draft);
}