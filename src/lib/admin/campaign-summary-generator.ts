import * as pilotStore from "@/lib/admin/pilot-store";
import * as strategyStore from "@/lib/admin/strategy-store";
import * as landingPageStore from "@/lib/admin/landing-page-store";
import * as googleAdsStore from "@/lib/admin/google-ads-store";
import * as emailSequenceStore from "@/lib/admin/email-sequence-store";
import * as smsStore from "@/lib/admin/sms-store";
import * as whatsappStore from "@/lib/admin/whatsapp-store";
import { createCampaignSummaryDraftRecord } from "@/lib/admin/campaign-summary-schema";
import { saveCampaignSummaryDraft } from "@/lib/admin/campaign-summary-store";
import {
  isNeejeeContext,
  neejeeBrandTruth,
} from "@/lib/admin/neejee-brand-truth";

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
    if (typeof candidate === "function") return candidate as Getter;
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
    if (current === null || current === undefined) return undefined;
    if (Array.isArray(current)) {
      const index = Number(part);
      if (!Number.isInteger(index)) return undefined;
      current = current[index];
      continue;
    }
    if (typeof current !== "object") return undefined;
    current = (current as LooseRecord)[part];
  }
  return current;
}

function pickString(source: unknown, paths: string[], fallback = ""): string {
  for (const path of paths) {
    const value = readPath(source, path);
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return fallback;
}

function pushUnique(target: string[], value: string) {
  const normalized = value.trim();
  if (normalized && !target.includes(normalized)) target.push(normalized);
}

const getPilot = resolveGetter(pilotStore, ["getPilot", "getPilotRecord", "getPilotDraft"]);
const getStrategy = resolveGetter(strategyStore, ["getStrategy", "getStrategyRecord", "getStrategyBrief", "getStrategyDraft"]);
const getLandingPage = resolveGetter(landingPageStore, ["getLandingPageBrief", "getLandingPageDraft", "getLandingPage"]);
const getGoogleAds = resolveGetter(googleAdsStore, ["getGoogleAdsDraft", "getGoogleAds"]);
const getEmailSequence = resolveGetter(emailSequenceStore, ["getEmailSequenceDraft", "getEmailSequence"]);
const getSms = resolveGetter(smsStore, ["getSmsDraft", "getSms"]);
const getWhatsapp = resolveGetter(whatsappStore, ["getWhatsappDraft", "getWhatsAppDraft"]);

function buildNeejeeCampaignSummary(pilotId: string, pilot: LooseRecord) {
  const strategy = asRecord(getStrategy(pilotId));
  const landingPage = asRecord(getLandingPage(pilotId));
  const googleAds = asRecord(getGoogleAds(pilotId));
  const emailSequence = asRecord(getEmailSequence(pilotId));
  const workspaceId =
    pickString(pilot, ["workspaceId"], "") ||
    pickString(strategy, ["workspaceId"], "") ||
    "workspace_neejee_primary";

  const primaryGoal =
    pickString(strategy, ["goal", "primaryGoal", "objective"], "") ||
    neejeeBrandTruth.growth.objectives[2];
  const coreOffer =
    pickString(strategy, ["offer", "coreOffer", "valueProposition", "positioning"], "") ||
    neejeeBrandTruth.business.model;

  const keyMessages: string[] = [];
  pushUnique(
    keyMessages,
    pickString(
      landingPage,
      ["hero.headline", "headline", "heroHeadline", "valueProposition"],
      "Find craft worth knowing. Find something personal.",
    ),
  );
  pushUnique(
    keyMessages,
    pickString(
      googleAds,
      ["headlines.0", "adCopy.0.headline1", "ads.0.headline"],
      "Discover Neejee through craft, provenance and considered curation.",
    ),
  );
  pushUnique(
    keyMessages,
    pickString(
      emailSequence,
      ["emails.0.subject", "messages.0.subject"],
      "Lifecycle messages should deepen relevant product and craft discovery.",
    ),
  );
  pushUnique(
    keyMessages,
    "Maker, region, technique, material and product-specific proof must come from approved source data.",
  );

  return createCampaignSummaryDraftRecord({
    id: `campaign-summary-${pilotId}`,
    pilotId,
    workspaceId,
    status: "draft",
    campaignName: "Neejee controlled commerce growth summary",
    primaryGoal,
    coreOffer,
    channels: [
      "Landing / Product Discovery",
      "SEO / AI Search",
      "Google Ads — Draft Only",
      "Meta / Visual Discovery — Planned",
      "Email Lifecycle — Draft Only",
    ],
    keyMessages,
    nextSteps: [
      "Validate the campaign summary against current Neejee product, category and provenance data.",
      "Confirm ecommerce measurement from product view through purchase before performance claims are used.",
      "Keep paid media in draft mode until provider account, spend authority and external execution evidence are verified.",
      "Keep email, SMS and WhatsApp execution disabled until consent, template/provider and opt-out requirements are verified for the relevant journey.",
      "Approve only product-specific provenance and time-sensitive commercial claims backed by fresh source evidence.",
    ],
    notes: [
      `Primary goal: ${primaryGoal}.`,
      `Core offer: ${coreOffer}.`,
      "Neejee success is evaluated as commerce and discovery, not B2B lead generation.",
      "SMS and WhatsApp are not mandatory launch channels; they remain gated lifecycle options.",
      `Workspace: ${workspaceId}.`,
    ],
  });
}

export function buildCampaignSummaryDraftFromPilot(pilotId: string) {
  const pilotValue = getPilot(pilotId);
  if (!pilotValue) throw new Error(`Pilot not found for ID "${pilotId}"`);
  const pilot = asRecord(pilotValue);

  if (isNeejeeContext(pilot)) return buildNeejeeCampaignSummary(pilotId, pilot);

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
  const companyName = pickString(
    pilot,
    ["companyName", "company.name", "businessName", "brandName", "workspaceName"],
    "Growth Team",
  );
  const contactName = pickString(
    pilot,
    ["contactName", "contact.name", "ownerName", "founderName"],
    "",
  );
  const campaignName = contactName
    ? `${companyName} x ${contactName} Campaign Summary`
    : `${companyName} Campaign Summary`;
  const primaryGoal = pickString(
    strategy,
    ["goal", "primaryGoal", "objective"],
    pickString(pilot, ["goal", "primaryGoal"], "Increase qualified conversion"),
  );
  const coreOffer =
    pickString(strategy, ["offer", "coreOffer", "valueProposition", "positioning"], "") ||
    pickString(
      landingPage,
      ["hero.headline", "headline", "heroHeadline", "subheadline", "valueProposition"],
      "A clearer conversion path for qualified demand",
    );

  const channels: string[] = [];
  pushUnique(channels, "Landing Page");
  pushUnique(channels, "Google Ads");
  pushUnique(channels, "Email Sequence");
  if (Object.keys(smsDraft).length > 0) pushUnique(channels, "SMS");
  if (Object.keys(whatsappDraft).length > 0) pushUnique(channels, "WhatsApp");

  const keyMessages: string[] = [];
  pushUnique(keyMessages, pickString(landingPage, ["hero.headline", "headline", "heroHeadline", "valueProposition"], ""));
  pushUnique(keyMessages, pickString(googleAds, ["headlines.0", "adCopy.0.headline1", "messages.0.body", "ads.0.headline", "ads.0.copy"], ""));
  pushUnique(keyMessages, pickString(emailSequence, ["messages.0.subject", "emails.0.subject", "messages.0.body"], ""));
  pushUnique(keyMessages, pickString(smsDraft, ["messages.0.body", "messages.1.body"], ""));
  pushUnique(keyMessages, pickString(whatsappDraft, ["messages.0.body", "messages.1.body"], ""));

  const nextSteps: string[] = [
    "Review the campaign summary with stakeholders.",
    "Validate cross-channel message consistency before launch.",
    "Approve execution timing and launch sequence.",
  ];
  pushUnique(nextSteps, pickString(strategy, ["cta", "callToAction", "nextStep"], ""));

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
    notes: [
      `Primary goal: ${primaryGoal}.`,
      `Core offer: ${coreOffer}.`,
      "Summary generated from currently available pilot campaign assets.",
      `Workspace: ${workspaceId}.`,
    ],
  });
}

export function generateCampaignSummaryDraft(pilotId = "pilot-demo") {
  const draft = buildCampaignSummaryDraftFromPilot(pilotId);
  saveCampaignSummaryDraft(draft);
  return draft;
}
