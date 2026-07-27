import * as pilotStore from "@/lib/admin/pilot-store";
import * as strategyStore from "@/lib/admin/strategy-store";
import * as landingPageStore from "@/lib/admin/landing-page-store";
import * as googleAdsStore from "@/lib/admin/google-ads-store";
import * as emailSequenceStore from "@/lib/admin/email-sequence-store";
import * as smsStore from "@/lib/admin/sms-store";
import * as whatsappStore from "@/lib/admin/whatsapp-store";
import { createCampaignSummaryDraftRecord } from "@/lib/admin/campaign-summary-schema";
import { saveCampaignSummaryDraft } from "@/lib/admin/campaign-summary-store";

type LooseRecord = Record<string, unknown>;
type Getter = (id?: string) => unknown;

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

function pushUnique(target: string[], value: string) {
  const normalized = value.trim();
  if (normalized.length === 0) {
    return;
  }

  if (!target.includes(normalized)) {
    target.push(normalized);
  }
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
  "getLandingPageBrief",
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

const getWhatsapp = resolveGetter(whatsappStore, [
  "getWhatsappDraft",
  "getWhatsAppDraft",
]);

export function buildCampaignSummaryDraftFromPilot(pilotId: string) {
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
  const whatsappDraft = asRecord(getWhatsapp(pilotId));

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
  ], "Growth Team");

  const contactName = pickString(pilot, [
    "contactName",
    "contact.name",
    "ownerName",
    "founderName",
  ], "");

  const campaignName = contactName
    ? `${companyName} x ${contactName} Campaign Summary`
    : `${companyName} Campaign Summary`;

  const primaryGoal = pickString(strategy, [
    "goal",
    "primaryGoal",
    "objective",
  ], pickString(pilot, ["goal", "primaryGoal"], "Increase qualified pipeline"));

  const coreOffer =
    pickString(strategy, [
      "offer",
      "coreOffer",
      "valueProposition",
      "positioning",
    ], "") ||
    pickString(landingPage, [
      "headline",
      "heroHeadline",
      "subheadline",
      "valueProposition",
    ], "A clearer conversion path for high-intent prospects");

  const channels: string[] = [];
  pushUnique(channels, "Landing Page");
  pushUnique(channels, "Google Ads");
  pushUnique(channels, "Email Sequence");
  pushUnique(channels, "SMS");
  pushUnique(channels, "WhatsApp");

  const keyMessages: string[] = [];
  pushUnique(
    keyMessages,
    pickString(landingPage, [
      "headline",
      "heroHeadline",
      "valueProposition",
    ], ""),
  );
  pushUnique(
    keyMessages,
    pickString(googleAds, [
      "headlines.0",
      "messages.0.body",
      "ads.0.headline",
      "ads.0.copy",
    ], ""),
  );
  pushUnique(
    keyMessages,
    pickString(emailSequence, [
      "messages.0.subject",
      "emails.0.subject",
      "messages.0.body",
    ], ""),
  );
  pushUnique(
    keyMessages,
    pickString(smsDraft, [
      "messages.0.body",
      "messages.1.body",
    ], ""),
  );
  pushUnique(
    keyMessages,
    pickString(whatsappDraft, [
      "messages.0.body",
      "messages.1.body",
    ], ""),
  );

  const nextSteps: string[] = [];
  pushUnique(nextSteps, "Review the campaign summary with stakeholders.");
  pushUnique(nextSteps, "Validate cross-channel message consistency before launch.");
  pushUnique(nextSteps, "Approve execution timing and launch sequence.");
  pushUnique(
    nextSteps,
    pickString(strategy, [
      "cta",
      "callToAction",
      "nextStep",
    ], ""),
  );

  const notes: string[] = [];
  pushUnique(
    notes,
    `Primary goal: ${primaryGoal}.`,
  );
  pushUnique(
    notes,
    `Core offer: ${coreOffer}.`,
  );
  pushUnique(
    notes,
    "Summary generated from pilot, strategy, landing page, Google Ads, email, SMS, and WhatsApp assets.",
  );
  pushUnique(
    notes,
    `Workspace: ${workspaceId}.`,
  );

  return createCampaignSummaryDraftRecord({
    id: `campaign-summary-${pilotId}`,
    pilotId,
    workspaceId,
    status: "draft",
    campaignName,
    primaryGoal,
    coreOffer,
    channels,
    keyMessages,
    nextSteps,
    notes,
  });
}

export function generateCampaignSummaryDraft(pilotId = "pilot-demo") {
  const draft = buildCampaignSummaryDraftFromPilot(pilotId);
  saveCampaignSummaryDraft(draft);
  return draft;
}