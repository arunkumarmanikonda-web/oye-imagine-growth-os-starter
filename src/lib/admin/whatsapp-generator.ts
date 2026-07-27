import * as pilotStore from "@/lib/admin/pilot-store";
import * as strategyStore from "@/lib/admin/strategy-store";
import * as landingPageStore from "@/lib/admin/landing-page-store";
import * as googleAdsStore from "@/lib/admin/google-ads-store";
import * as emailSequenceStore from "@/lib/admin/email-sequence-store";
import * as smsStore from "@/lib/admin/sms-store";
import { createWhatsappDraftRecord } from "@/lib/admin/whatsapp-schema";
import { saveWhatsappDraft } from "@/lib/admin/whatsapp-store";

type LooseRecord = Record<string, unknown>;
type Getter = (id: string) => unknown;

function resolveGetter(moduleValue: unknown, names: string[]): Getter {
  const table = moduleValue as LooseRecord;

  for (const name of names) {
    let candidate: unknown;

    try {
      candidate = table[name];
    } catch {
      candidate = undefined;
    }

    if (typeof candidate === "function") {
      return candidate as Getter;
    }
  }

  throw new Error(`Unable to resolve getter. Tried: ${names.join(", ")}`);
}

function asRecord(value: unknown): LooseRecord {
  return value !== null && typeof value === "object" ? (value as LooseRecord) : {};
}

function readPath(source: unknown, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = source;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }

    if (Array.isArray(current)) {
      const index = Number(part);
      if (!Number.isInteger(index)) {
        return undefined;
      }

      current = current[index];
      continue;
    }

    if (typeof current !== "object") {
      return undefined;
    }

    current = (current as LooseRecord)[part];
  }

  return current;
}

function pickString(source: unknown, paths: string[], fallback = ""): string {
  for (const path of paths) {
    const value = readPath(source, path);
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
  }

  return fallback;
}

function truncate(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦`;
}

const getPilot = resolveGetter(pilotStore, [
  "getPilot",
  "getPilotRecord",
  "getPilotDraft",
]);

const getStrategy = resolveGetter(strategyStore, [
  "getStrategy",
  "getStrategyRecord",
  "getStrategyBrief",
  "getStrategyDraft",
]);

const getLandingPage = resolveGetter(landingPageStore, [
  "getLandingPageDraft",
  "getLandingPage",
]);

const getGoogleAds = resolveGetter(googleAdsStore, [
  "getGoogleAdsDraft",
  "getGoogleAds",
]);

const getEmailSequence = resolveGetter(emailSequenceStore, [
  "getEmailSequenceDraft",
  "getEmailSequence",
]);

const getSms = resolveGetter(smsStore, [
  "getSmsDraft",
  "getSms",
]);

export function buildWhatsappDraftFromPilot(pilotId: string) {
  const pilotValue = getPilot(pilotId);
  if (!pilotValue) {
    throw new Error(`Pilot not found for ID "${pilotId}"`);
  }

  const pilot = asRecord(pilotValue);
  const strategy = asRecord(getStrategy(pilotId));
  const landingPage = asRecord(getLandingPage(pilotId));
  const googleAds = asRecord(getGoogleAds(pilotId));
  const emailSequence = asRecord(getEmailSequence(pilotId));
  const smsDraft = asRecord(getSms(pilotId));

  const workspaceId =
    pickString(pilot, ["workspaceId"], "") ||
    pickString(strategy, ["workspaceId"], "") ||
    "workspace-demo";

  const companyName = pickString(pilot, [
    "companyName",
    "company.name",
    "businessName",
    "brandName",
    "workspaceName",
  ], "your team");

  const contactName = pickString(pilot, [
    "contactName",
    "contact.name",
    "ownerName",
    "founderName",
  ], "");

  const senderName = contactName ? `${contactName} at ${companyName}` : companyName;

  const audience = pickString(strategy, [
    "audience",
    "primaryAudience",
    "customerSegment",
  ], pickString(pilot, ["audience", "targetAudience"], "qualified prospects"));

  const goal = pickString(strategy, [
    "goal",
    "primaryGoal",
    "objective",
  ], pickString(pilot, ["goal", "primaryGoal"], "book more qualified conversations"));

  const headline = pickString(landingPage, [
    "headline",
    "heroHeadline",
    "title",
  ], "A clearer path to better conversion");

  const valueProp = pickString(landingPage, [
    "subheadline",
    "valueProposition",
    "description",
    "heroSubheadline",
  ], "A focused message that helps prospects understand the next step faster");

  const adProof = pickString(googleAds, [
    "headlines.0",
    "messages.0.body",
    "ads.0.headline",
    "ads.0.copy",
  ], "The strongest paid hooks are already proving what gets attention");

  const emailProof = pickString(emailSequence, [
    "emails.0.subject",
    "messages.0.subject",
    "messages.0.body",
  ], "The email sequence is already aligned around the same offer");

  const smsProof = pickString(smsDraft, [
    "messages.0.body",
    "messages.1.body",
  ], "The SMS touchpoints reinforce the same concise value proposition");

  const callToAction = pickString(strategy, [
    "callToAction",
    "cta",
  ], "Want me to send the best next step?");

  const messageOne = truncate(
    `Hi - ${headline}. ${valueProp}. I'm reaching out for ${audience}. If this is relevant, I can send the quick version here. - ${senderName}`,
    340,
  );

  const messageTwo = truncate(
    `Quick proof point: ${adProof}. We kept this aligned with email and SMS too - ${emailProof}. ${smsProof}`,
    340,
  );

  const messageThree = truncate(
    `If the goal is to ${goal.toLowerCase()}, this WhatsApp sequence can move people from interest to reply without changing the story across channels. ${callToAction}`,
    340,
  );

  return createWhatsappDraftRecord({
    id: `whatsapp-${pilotId}`,
    pilotId,
    workspaceId,
    status: "draft",
    senderName,
    goal,
    messages: [
      {
        id: `${pilotId}-whatsapp-1`,
        body: messageOne,
      },
      {
        id: `${pilotId}-whatsapp-2`,
        body: messageTwo,
      },
      {
        id: `${pilotId}-whatsapp-3`,
        body: messageThree,
      },
    ],
    notes: [
      "Generated from pilot, strategy, landing page, Google Ads, email sequence, and SMS assets for cross-channel consistency.",
    ],
  });
}

export function generateWhatsappDraft(pilotId = "pilot-demo") {
  const draft = buildWhatsappDraftFromPilot(pilotId);
  saveWhatsappDraft(draft);
  return draft;
}