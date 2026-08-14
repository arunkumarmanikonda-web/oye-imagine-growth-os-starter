import { getGoogleAdsDraft } from "@/lib/admin/google-ads-store";
import {
  createEmailSequenceDraftRecord,
  type EmailSequenceDraftRecord,
} from "@/lib/admin/email-sequence-schema";
import { saveEmailSequenceDraft } from "@/lib/admin/email-sequence-store";
import { getLandingPageBrief } from "@/lib/admin/landing-page-store";
import { getPilot } from "@/lib/admin/pilot-store";
import { getStrategyBrief } from "@/lib/admin/strategy-store";
import {
  isNeejeeContext,
  neejeeBrandTruth,
} from "@/lib/admin/neejee-brand-truth";

type LooseRecord = Record<string, unknown>;

function asRecord(value: unknown): LooseRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as LooseRecord)
    : null;
}

function pickString(source: LooseRecord | null, keys: string[], fallback = ""): string {
  if (!source) return fallback;
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return fallback;
}

function pickNestedString(source: LooseRecord | null, path: string[], fallback = ""): string {
  let current: unknown = source;
  for (const segment of path) {
    const record = asRecord(current);
    if (!record || !(segment in record)) return fallback;
    current = record[segment];
  }
  return typeof current === "string" && current.trim() ? current.trim() : fallback;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const items: string[] = [];
  for (const entry of value) {
    if (typeof entry === "string" && entry.trim()) {
      items.push(entry.trim());
      continue;
    }
    const record = asRecord(entry);
    if (!record) continue;
    const text = pickString(record, ["text", "title", "headline", "description", "copy", "value", "label"]);
    if (text) items.push(text);
  }
  return items;
}

function matchesPilotId(source: LooseRecord | null, pilotId: string): boolean {
  if (!source) return false;
  const value = pickString(source, ["pilotId", "id"]);
  return !value || value === pilotId;
}

function buildNeejeeEmailSequence(input: {
  pilotId: string;
  pilotRecord: LooseRecord;
  strategyRecord: LooseRecord | null;
  landingPageRecord: LooseRecord | null;
  googleAdsRecord: LooseRecord | null;
}): EmailSequenceDraftRecord {
  const workspaceId = pickString(input.pilotRecord, ["workspaceId"], "workspace_neejee_primary");
  const companyName = neejeeBrandTruth.identity.displayName;
  const landingPageUrl = pickString(
    input.landingPageRecord,
    ["url", "pageUrl", "shareUrl", "publishedUrl"],
    neejeeBrandTruth.identity.website,
  );
  const heroHeadline = pickNestedString(
    input.landingPageRecord,
    ["hero", "headline"],
    "Find craft worth knowing. Find something personal.",
  );
  const adHeadlines = normalizeStringArray(
    input.googleAdsRecord ? input.googleAdsRecord["headlines"] : undefined,
  );

  return createEmailSequenceDraftRecord({
    pilotId: input.pilotId,
    workspaceId,
    sequenceName: "Neejee discovery and return journey",
    senderName: "Neejee",
    senderEmail: "hello@neejee.com",
    audience: {
      persona: "Craft- and design-conscious shoppers exploring distinctive products, meaningful gifts and provenance-rich collections",
      painPoint: "Authentic, story-rich craft is difficult to discover in anonymous product grids",
      desiredOutcome: "Help each shopper find a relevant piece, understand why it matters and return for further discovery",
    },
    strategySummary:
      "Use founder-led curation, provenance, product discovery and relevant AI assistance to deepen ecommerce engagement without turning Neejee into a discount-led marketplace.",
    landingPageUrl,
    emails: [
      {
        id: "email-1",
        subject: adHeadlines[0] ?? "Something worth finding at Neejee",
        previewText: heroHeadline,
        body:
          `Hello,\n\n` +
          `Neejee is built for the things that are easy to miss in a crowded marketplace: the maker, the place, the technique and the reason a piece feels personal.\n\n` +
          `Start with the latest discoveries and follow the story that matters to you.\n\n` +
          `${landingPageUrl}`,
        ctaLabel: "Explore Neejee",
        ctaHref: landingPageUrl,
        sendDelayDays: 0,
        goal: "Begin a consented discovery journey with provenance and product relevance.",
      },
      {
        id: "email-2",
        subject: "Look closer: the story behind the piece",
        previewText: "Maker, region, technique and material belong in the discovery.",
        body:
          `Hello,\n\n` +
          `The most useful reason to return is not another generic promotion. It is a better way to understand what you are looking at.\n\n` +
          `Explore products through craft, region, technique, material and story, then move directly to the pieces that feel relevant to you.`,
        ctaLabel: "Discover the craft",
        ctaHref: `${neejeeBrandTruth.identity.website}/about`,
        sendDelayDays: 3,
        goal: "Deepen trust and product discovery through approved provenance context.",
      },
      {
        id: "email-3",
        subject: "Need help finding the right one?",
        previewText: "Use Neejee discovery tools when choice needs a little context.",
        body:
          `Hello,\n\n` +
          `When you want to see a wearable on you, place a home object in your space, or find a thoughtful gift, Neejee's discovery experiences are designed to help.\n\n` +
          `Use Mirror, Space or Concierge where the relevant product journey supports it, and keep exploring from there.`,
        ctaLabel: "Continue discovering",
        ctaHref: neejeeBrandTruth.identity.website,
        sendDelayDays: 7,
        goal: "Support relevant return discovery and commerce without unsupported urgency.",
      },
    ],
    notes: [
      "Draft only. Do not send until consent, sender-domain, unsubscribe and provider compliance are verified.",
      "Use behavioural triggers and actual product/category data before production lifecycle activation.",
      "Do not insert shipping, returns, discount or availability claims without a fresh approved source.",
    ],
  });
}

export function buildEmailSequenceDraftFromPilot(pilotId: string): EmailSequenceDraftRecord {
  const pilotRecord = asRecord(getPilot());
  if (!pilotRecord) throw new Error(`Pilot not found: ${pilotId}`);

  const resolvedPilotId = pickString(pilotRecord, ["pilotId", "id"]);
  if (resolvedPilotId && resolvedPilotId !== pilotId) throw new Error(`Pilot not found: ${pilotId}`);

  const strategyCandidate = asRecord(getStrategyBrief());
  const landingPageCandidate = asRecord(getLandingPageBrief());
  const googleAdsCandidate = asRecord(getGoogleAdsDraft());
  const strategyRecord = matchesPilotId(strategyCandidate, pilotId) ? strategyCandidate : null;
  const landingPageRecord = matchesPilotId(landingPageCandidate, pilotId) ? landingPageCandidate : null;
  const googleAdsRecord = matchesPilotId(googleAdsCandidate, pilotId) ? googleAdsCandidate : null;

  if (isNeejeeContext(pilotRecord)) {
    return buildNeejeeEmailSequence({
      pilotId,
      pilotRecord,
      strategyRecord,
      landingPageRecord,
      googleAdsRecord,
    });
  }

  const workspaceId = pickString(pilotRecord, ["workspaceId"], "workspace-demo");
  const companyName = pickString(
    pilotRecord,
    ["companyName", "businessName", "brandName", "name", "workspaceName"],
    "Client",
  );
  const senderName = pickString(
    pilotRecord,
    ["senderName", "contactName", "founderName", "ownerName"],
    `${companyName} Team`,
  );
  const senderEmail = pickString(
    pilotRecord,
    ["senderEmail", "contactEmail", "email", "founderEmail"],
    "sender@example.com",
  );
  const persona = pickString(
    strategyRecord,
    ["audience", "persona", "idealCustomerProfile"],
    pickString(pilotRecord, ["persona", "targetPersona", "idealCustomerProfile", "targetAudience"], "Qualified audience"),
  );
  const painPoint = pickString(
    strategyRecord,
    ["painPoint", "problemStatement", "customerPain"],
    "The audience needs a clearer reason to act",
  );
  const desiredOutcome = pickString(
    strategyRecord,
    ["desiredOutcome", "valueProposition", "positioning"],
    "Move from interest to a relevant next action",
  );
  const strategySummary = pickString(
    strategyRecord,
    ["summary", "executiveSummary", "coreStrategy", "positioning"],
    `${companyName} should keep lifecycle messages aligned to the approved offer and audience.`,
  );
  const headline = pickNestedString(
    landingPageRecord,
    ["hero", "headline"],
    pickString(landingPageRecord, ["headline", "title"], `${companyName}: a clearer next step`),
  );
  const subheadline = pickNestedString(
    landingPageRecord,
    ["hero", "subheadline"],
    pickString(landingPageRecord, ["subheadline", "description"], "Keep message and next action aligned."),
  );
  const primaryCta = pickNestedString(
    landingPageRecord,
    ["hero", "primaryCta"],
    pickString(landingPageRecord, ["primaryCta", "ctaLabel"], "Learn more"),
  );
  const landingPageUrl = pickString(
    landingPageRecord,
    ["url", "pageUrl", "shareUrl", "publishedUrl"],
    `https://example.com/${pilotId}/landing-page`,
  );
  const adHeadlines = normalizeStringArray(googleAdsRecord ? googleAdsRecord["headlines"] : undefined);
  const adDescriptions = normalizeStringArray(googleAdsRecord ? googleAdsRecord["descriptions"] : undefined);
  const firstSubject = adHeadlines[0] ?? `A clearer next step with ${companyName}`;
  const secondSubject = adHeadlines[1] ?? `How ${companyName} keeps the message aligned`;
  const proofPoint = adDescriptions[0] ?? subheadline ?? strategySummary;

  return createEmailSequenceDraftRecord({
    pilotId,
    workspaceId,
    sequenceName: `${companyName} lifecycle draft`,
    senderName,
    senderEmail,
    audience: { persona, painPoint, desiredOutcome },
    strategySummary,
    landingPageUrl,
    emails: [
      {
        id: "email-1",
        subject: firstSubject,
        previewText: headline,
        body: `Hello,\n\n${painPoint}\n\n${strategySummary}\n\n${landingPageUrl}`,
        ctaLabel: primaryCta,
        ctaHref: landingPageUrl,
        sendDelayDays: 0,
        goal: "Introduce the approved offer and next action.",
      },
      {
        id: "email-2",
        subject: secondSubject,
        previewText: proofPoint,
        body: `Hello,\n\n${proofPoint}\n\n${desiredOutcome}`,
        ctaLabel: primaryCta,
        ctaHref: landingPageUrl,
        sendDelayDays: 3,
        goal: "Reinforce the value proposition with consistent proof.",
      },
      {
        id: "email-3",
        subject: `A relevant next step from ${companyName}`,
        previewText: "Continue only if this remains useful and relevant.",
        body: `Hello,\n\nIf this is still relevant, the next step is here: ${landingPageUrl}`,
        ctaLabel: primaryCta,
        ctaHref: landingPageUrl,
        sendDelayDays: 7,
        goal: "Offer a final low-pressure next action.",
      },
    ],
    notes: ["Draft only; production send requires consent and provider/compliance verification."],
  });
}

export function generateEmailSequenceDraft(pilotId: string): EmailSequenceDraftRecord {
  const draft = buildEmailSequenceDraftFromPilot(pilotId);
  return saveEmailSequenceDraft(draft);
}
