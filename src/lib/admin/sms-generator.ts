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
      "subject",
      "body",
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

function truncateSms(value: string, maxLength = 160): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

export function buildSmsDraftFromPilot(
  pilotId: string,
): SmsDraftRecord {
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
  const emailSequenceCandidate = asRecord(getEmailSequenceDraft());
  const existingSmsCandidate = asRecord(getSmsDraft());

  const strategyRecord = matchesPilotId(strategyCandidate, pilotId)
    ? strategyCandidate
    : null;
  const landingPageRecord = matchesPilotId(landingPageCandidate, pilotId)
    ? landingPageCandidate
    : null;
  const googleAdsRecord = matchesPilotId(googleAdsCandidate, pilotId)
    ? googleAdsCandidate
    : null;
  const emailSequenceRecord = matchesPilotId(emailSequenceCandidate, pilotId)
    ? emailSequenceCandidate
    : null;
  const existingSmsRecord = matchesPilotId(existingSmsCandidate, pilotId)
    ? existingSmsCandidate
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

  const persona = pickString(
    strategyRecord,
    ["audience", "persona", "idealCustomerProfile"],
    pickNestedString(existingSmsRecord, ["audience", "persona"], "Founder-led B2B growth team"),
  );

  const painPoint = pickString(
    strategyRecord,
    ["painPoint", "problemStatement", "customerPain"],
    pickNestedString(
      existingSmsRecord,
      ["audience", "painPoint"],
      "Campaign execution is fragmented across strategy, pages, ads, and follow-up",
    ),
  );

  const desiredOutcome = pickString(
    strategyRecord,
    ["desiredOutcome", "valueProposition", "positioning"],
    pickNestedString(
      existingSmsRecord,
      ["audience", "desiredOutcome"],
      "Launch coordinated campaigns faster with less rewriting across channels",
    ),
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
      "Turn one brief into aligned pages, ads, email, and follow-up.",
    ),
  );

  const adHeadlines = normalizeStringArray(
    googleAdsRecord ? googleAdsRecord["headlines"] : undefined,
  );
  const adDescriptions = normalizeStringArray(
    googleAdsRecord ? googleAdsRecord["descriptions"] : undefined,
  );
  const emailSubjects = normalizeStringArray(
    emailSequenceRecord ? emailSequenceRecord["emails"] : undefined,
  );

  const goal = pickString(
    existingSmsRecord,
    ["goal"],
    "Start a reply-oriented conversation that leads to a tailored follow-up draft.",
  );

  const firstHook =
    adHeadlines[0] ?? emailSubjects[0] ?? headline ?? `A better way to launch ${companyName} campaigns`;
  const proofPoint =
    adDescriptions[0] ?? subheadline ?? desiredOutcome;
  const followUpAngle =
    emailSubjects[1] ?? adHeadlines[1] ?? `Keep every campaign asset aligned`;

  return createSmsDraftRecord({
    pilotId,
    workspaceId,
    senderName,
    audience: {
      persona,
      painPoint,
      desiredOutcome,
    },
    goal,
    messages: [
      {
        id: "sms-1",
        body: truncateSms(
          `Hi, ${senderName} here. ${firstHook}. ${painPoint}. Want the short overview?`,
        ),
        sendDelayHours: 0,
        goal: "Open the conversation with the core pain point and offer.",
      },
      {
        id: "sms-2",
        body: truncateSms(
          `Quick follow-up: ${followUpAngle}. ${proofPoint} Worth a quick look?`,
        ),
        sendDelayHours: 24,
        goal: "Reinforce the practical benefit with concise proof.",
      },
      {
        id: "sms-3",
        body: truncateSms(
          `If helpful, I can send a tailored draft for your funnel so your team can react to something concrete.`,
        ),
        sendDelayHours: 72,
        goal: "Prompt a reply for a tailored next step.",
      },
    ],
    notes: [
      "Keep SMS copy short, direct, and conversational.",
      `Landing page anchor: ${headline}`,
      "Sequence flow: hook, proof, reply prompt.",
    ],
  });
}

export function generateSmsDraft(
  pilotId: string,
): SmsDraftRecord {
  const draft = buildSmsDraftFromPilot(pilotId);
  return saveSmsDraft(draft);
}