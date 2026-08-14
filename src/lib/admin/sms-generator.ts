import { getEmailSequenceDraft } from "@/lib/admin/email-sequence-store";
import { getGoogleAdsDraft } from "@/lib/admin/google-ads-store";
import { getLandingPageBrief } from "@/lib/admin/landing-page-store";
import { getPilot } from "@/lib/admin/pilot-store";
import { getSmsDraft, saveSmsDraft } from "@/lib/admin/sms-store";
import {
  createSmsDraftRecord,
  type SmsDraftRecord,
} from "@/lib/admin/sms-schema";
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
    const text = pickString(record, ["text", "title", "headline", "description", "copy", "value", "label", "subject", "body"]);
    if (text) items.push(text);
  }
  return items;
}

function matchesPilotId(source: LooseRecord | null, pilotId: string): boolean {
  if (!source) return false;
  const value = pickString(source, ["pilotId", "id"]);
  return !value || value === pilotId;
}

function truncateSms(value: string, maxLength = 160): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

function buildNeejeeSmsDraft(input: {
  pilotId: string;
  pilotRecord: LooseRecord;
  landingPageRecord: LooseRecord | null;
}): SmsDraftRecord {
  const workspaceId = pickString(input.pilotRecord, ["workspaceId"], "workspace_neejee_primary");
  const destination = pickString(
    input.landingPageRecord,
    ["url", "pageUrl", "shareUrl", "publishedUrl"],
    neejeeBrandTruth.identity.website,
  );

  return createSmsDraftRecord({
    pilotId: input.pilotId,
    workspaceId,
    senderName: "Neejee",
    audience: {
      persona: "Consented Neejee shoppers with a relevant discovery, cart, order or return trigger",
      painPoint: "A short mobile message should help the shopper return to a relevant product journey without generic sales pressure",
      desiredOutcome: "Drive a useful return visit, cart recovery or product discovery action with clear consent and frequency controls",
    },
    goal: "Support consented ecommerce lifecycle actions, not cold B2B prospecting.",
    messages: [
      {
        id: "sms-1",
        body: truncateSms(`Neejee: Something worth finding is waiting. Continue your discovery at ${destination}`),
        sendDelayHours: 0,
        goal: "Return an opted-in shopper to a relevant discovery or product journey.",
      },
      {
        id: "sms-2",
        body: truncateSms(`Neejee: Still considering a piece? Revisit the product story, maker and details before deciding. ${destination}`),
        sendDelayHours: 24,
        goal: "Support consideration without inventing a discount or urgency claim.",
      },
      {
        id: "sms-3",
        body: truncateSms(`Neejee: Prefer guided discovery? Return to Neejee and use the relevant shopping tools when available. ${destination}`),
        sendDelayHours: 72,
        goal: "Offer a relevant return path for discovery-oriented shoppers.",
      },
    ],
    notes: [
      "Draft only. Production SMS requires explicit consent, DLT/template approval where applicable, opt-out handling and provider verification.",
      "Replace generic destination with the shopper's consented, relevant product/cart/collection deep link before execution.",
      "Do not add discount, stock, shipping or urgency claims without fresh approved data.",
    ],
  });
}

export function buildSmsDraftFromPilot(pilotId: string): SmsDraftRecord {
  const pilotRecord = asRecord(getPilot());
  if (!pilotRecord) throw new Error(`Pilot not found: ${pilotId}`);
  const resolvedPilotId = pickString(pilotRecord, ["pilotId", "id"]);
  if (resolvedPilotId && resolvedPilotId !== pilotId) throw new Error(`Pilot not found: ${pilotId}`);

  const strategyCandidate = asRecord(getStrategyBrief());
  const landingPageCandidate = asRecord(getLandingPageBrief());
  const googleAdsCandidate = asRecord(getGoogleAdsDraft());
  const emailSequenceCandidate = asRecord(getEmailSequenceDraft());
  const existingSmsCandidate = asRecord(getSmsDraft());
  const strategyRecord = matchesPilotId(strategyCandidate, pilotId) ? strategyCandidate : null;
  const landingPageRecord = matchesPilotId(landingPageCandidate, pilotId) ? landingPageCandidate : null;
  const googleAdsRecord = matchesPilotId(googleAdsCandidate, pilotId) ? googleAdsCandidate : null;
  const emailSequenceRecord = matchesPilotId(emailSequenceCandidate, pilotId) ? emailSequenceCandidate : null;
  const existingSmsRecord = matchesPilotId(existingSmsCandidate, pilotId) ? existingSmsCandidate : null;

  if (isNeejeeContext(pilotRecord)) {
    return buildNeejeeSmsDraft({ pilotId, pilotRecord, landingPageRecord });
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
  const persona = pickString(
    strategyRecord,
    ["audience", "persona", "idealCustomerProfile"],
    pickNestedString(existingSmsRecord, ["audience", "persona"], "Qualified audience"),
  );
  const painPoint = pickString(
    strategyRecord,
    ["painPoint", "problemStatement", "customerPain"],
    pickNestedString(existingSmsRecord, ["audience", "painPoint"], "The audience needs a clearer reason to act"),
  );
  const desiredOutcome = pickString(
    strategyRecord,
    ["desiredOutcome", "valueProposition", "positioning"],
    pickNestedString(existingSmsRecord, ["audience", "desiredOutcome"], "Move from interest to a relevant next action"),
  );
  const headline = pickNestedString(
    landingPageRecord,
    ["hero", "headline"],
    pickString(landingPageRecord, ["headline", "title"], `${companyName}: a clearer next step`),
  );
  const subheadline = pickNestedString(
    landingPageRecord,
    ["hero", "subheadline"],
    pickString(landingPageRecord, ["subheadline", "description"], "Keep the message and next action aligned."),
  );
  const adHeadlines = normalizeStringArray(googleAdsRecord ? googleAdsRecord["headlines"] : undefined);
  const adDescriptions = normalizeStringArray(googleAdsRecord ? googleAdsRecord["descriptions"] : undefined);
  const emailSubjects = normalizeStringArray(emailSequenceRecord ? emailSequenceRecord["emails"] : undefined);
  const firstHook = adHeadlines[0] ?? emailSubjects[0] ?? headline;
  const proofPoint = adDescriptions[0] ?? subheadline ?? desiredOutcome;
  const followUpAngle = adHeadlines[1] ?? emailSubjects[1] ?? "A relevant next step";

  return createSmsDraftRecord({
    pilotId,
    workspaceId,
    senderName,
    audience: { persona, painPoint, desiredOutcome },
    goal: pickString(existingSmsRecord, ["goal"], "Support a consented next action."),
    messages: [
      {
        id: "sms-1",
        body: truncateSms(`${companyName}: ${firstHook}. ${painPoint}`),
        sendDelayHours: 0,
        goal: "Open with the approved value proposition.",
      },
      {
        id: "sms-2",
        body: truncateSms(`${companyName}: ${followUpAngle}. ${proofPoint}`),
        sendDelayHours: 24,
        goal: "Reinforce the approved proof point.",
      },
      {
        id: "sms-3",
        body: truncateSms(`${companyName}: If this remains relevant, continue with the approved next step.`),
        sendDelayHours: 72,
        goal: "Offer a low-pressure final next action.",
      },
    ],
    notes: ["Draft only; production send requires consent and provider/compliance verification."],
  });
}

export function generateSmsDraft(pilotId: string): SmsDraftRecord {
  const draft = buildSmsDraftFromPilot(pilotId);
  return saveSmsDraft(draft);
}
