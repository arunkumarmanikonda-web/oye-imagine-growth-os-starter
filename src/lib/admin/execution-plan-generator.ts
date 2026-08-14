import * as pilotStore from "@/lib/admin/pilot-store";
import * as strategyStore from "@/lib/admin/strategy-store";
import * as landingPageStore from "@/lib/admin/landing-page-store";
import * as googleAdsStore from "@/lib/admin/google-ads-store";
import * as emailSequenceStore from "@/lib/admin/email-sequence-store";
import * as smsStore from "@/lib/admin/sms-store";
import * as whatsappStore from "@/lib/admin/whatsapp-store";
import * as campaignSummaryStore from "@/lib/admin/campaign-summary-store";
import { createExecutionPlanDraftRecord } from "@/lib/admin/execution-plan-schema";
import { saveExecutionPlanDraft } from "@/lib/admin/execution-plan-store";
import {
  isNeejeeContext,
  neejeeBrandTruth,
} from "@/lib/admin/neejee-brand-truth";

type Getter<TResult = unknown> = (...args: any[]) => TResult;

function resolveGetter<TResult = unknown>(
  moduleRef: Record<string, unknown>,
  names: string[],
): Getter<TResult> {
  for (const name of names) {
    const candidate = moduleRef[name];
    if (typeof candidate === "function") return candidate as Getter<TResult>;
  }
  throw new Error(`Unable to resolve getter. Tried: ${names.join(", ")}`);
}

const getPilot = resolveGetter(pilotStore as Record<string, unknown>, ["getPilot", "getPilotDraft", "getPilotById"]);
const getStrategy = resolveGetter(strategyStore, ["getStrategy", "getStrategyRecord", "getStrategyBrief", "getStrategyDraft"]);
const getLandingPage = resolveGetter(landingPageStore as Record<string, unknown>, ["getLandingPageBrief", "getLandingPageDraft", "getLandingPage"]);
const getGoogleAds = resolveGetter(googleAdsStore as Record<string, unknown>, ["getGoogleAdsDraft", "getGoogleAdsCampaignDraft", "getGoogleAdsCampaign"]);
const getEmailSequence = resolveGetter(emailSequenceStore as Record<string, unknown>, ["getEmailSequenceDraft", "getEmailDraft"]);
const getSms = resolveGetter(smsStore as Record<string, unknown>, ["getSmsDraft", "getSmsMessageDraft"]);
const getWhatsapp = resolveGetter(whatsappStore as Record<string, unknown>, ["getWhatsappDraft", "getWhatsAppDraft"]);
const getCampaignSummary = resolveGetter(campaignSummaryStore as Record<string, unknown>, ["getCampaignSummaryDraft", "getCampaignSummary"]);

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function pickFirst(...values: unknown[]): string {
  for (const value of values) {
    const nextValue = asString(value);
    if (nextValue) return nextValue;
  }
  return "";
}

function uniqueStrings(values: Array<string | undefined | null>): string[] {
  const output: string[] = [];
  const seen = new Set<string>();
  for (const value of values) {
    const normalized = asString(value);
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(normalized);
  }
  return output;
}

function coerceRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function extractStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const output: string[] = [];
  for (const item of value) {
    if (typeof item === "string") {
      const nextValue = item.trim();
      if (nextValue) output.push(nextValue);
      continue;
    }
    if (item && typeof item === "object") {
      const record = item as Record<string, unknown>;
      for (const key of ["headline", "title", "subject", "body", "message", "text", "description", "valueProp", "callToAction", "label"]) {
        const nextValue = asString(record[key]);
        if (nextValue) output.push(nextValue);
      }
    }
  }
  return uniqueStrings(output);
}

function extractMessageProof(value: unknown): string[] {
  const record = coerceRecord(value);
  return uniqueStrings([
    ...extractStringList(record["messages"]),
    ...extractStringList(record["emails"]),
    ...extractStringList(record["headlines"]),
    ...extractStringList(record["adCopy"]),
    ...extractStringList(record["descriptions"]),
    ...extractStringList(record["keyMessages"]),
    ...extractStringList(record["nextSteps"]),
    pickFirst(record["headline"], record["valueProp"], record["callToAction"], record["campaignName"]),
  ]);
}

function deriveTimestamp(...records: Array<Record<string, unknown>>): string {
  for (const record of records) {
    for (const key of ["generatedAt", "lastUpdatedAt", "updatedAt", "createdAt"]) {
      const value = asString(record[key]);
      if (value) return value;
    }
  }
  return "2026-01-01T00:00:00.000Z";
}

function buildNeejeeExecutionPlan(input: {
  pilotId: string;
  pilotRecord: Record<string, unknown>;
  strategyRecord: Record<string, unknown>;
  landingPageRecord: Record<string, unknown>;
  googleAdsRecord: Record<string, unknown>;
  emailSequenceRecord: Record<string, unknown>;
  campaignSummaryRecord: Record<string, unknown>;
}) {
  const workspaceId =
    pickFirst(
      input.pilotRecord["workspaceId"],
      input.strategyRecord["workspaceId"],
      input.campaignSummaryRecord["workspaceId"],
    ) || "workspace_neejee_primary";
  const primaryGoal =
    pickFirst(
      input.strategyRecord["primaryGoal"],
      input.strategyRecord["goal"],
      input.campaignSummaryRecord["primaryGoal"],
    ) || neejeeBrandTruth.growth.objectives[2];
  const landingProof = extractMessageProof(input.landingPageRecord).slice(0, 2);
  const adsProof = extractMessageProof(input.googleAdsRecord).slice(0, 2);
  const emailProof = extractMessageProof(input.emailSequenceRecord).slice(0, 2);
  const summaryNextSteps = extractStringList(input.campaignSummaryRecord["nextSteps"]).slice(0, 4);
  const stableTimestamp = deriveTimestamp(
    input.campaignSummaryRecord,
    input.emailSequenceRecord,
    input.googleAdsRecord,
    input.landingPageRecord,
    input.strategyRecord,
    input.pilotRecord,
  );

  return createExecutionPlanDraftRecord({
    id: `execution-plan-${input.pilotId}`,
    pilotId: input.pilotId,
    workspaceId,
    generatedAt: stableTimestamp,
    lastUpdatedAt: stableTimestamp,
    status: "draft",
    campaignName: "Neejee controlled commerce proving loop",
    launchWindow: "Controlled pilot — activation only after named acceptance gates",
    milestones: [
      "Validate current Neejee product, category, provenance and rights data before generating publishable assets.",
      "Verify ecommerce analytics from product view, add-to-cart and checkout through completed purchase.",
      landingProof[0]
        ? `Approve the discovery/landing direction anchored on: "${landingProof[0]}".`
        : "Approve the provenance-led landing and product-discovery direction.",
      adsProof[0]
        ? `Approve paid-search draft messaging without publishing it: "${adsProof[0]}".`
        : "Approve paid-search drafts; keep external publishing disabled.",
      emailProof[0]
        ? `Approve consented lifecycle draft messaging: "${emailProof[0]}".`
        : "Prepare consented lifecycle drafts without sending them.",
      "Only after provider verification, budget authority and maker-checker approval, run a bounded sandbox/live proving action and reconcile the external resource ID back to Oye.",
    ],
    owners: [
      "Neejee brand / commercial approver",
      "Oye Growth Operations",
      "Commerce analytics owner",
      "Performance marketing approver",
      "Lifecycle compliance owner",
    ],
    blockers: [
      "Google/Meta paid execution remains blocked until provider account, spend authority and external execution evidence are verified.",
      "Email/SMS/WhatsApp execution remains blocked until consent, provider/template, opt-out and compliance requirements are verified.",
      "Product-specific provenance, pricing, stock, shipping, returns and promotional claims require current approved source data.",
      "Irreversible commercial/media mutations remain frozen under P0-012 until their separate acceptance gates pass.",
    ],
    checklist: [
      ...summaryNextSteps,
      `Confirm commerce goal: ${primaryGoal}.`,
      "Confirm the exact products/categories and approved provenance evidence used in the proving campaign.",
      "Confirm conversion events and attribution freshness before optimization decisions are enabled.",
      "Confirm creative rights/provenance records in the Neejee tenant asset bucket.",
      "Confirm no channel is represented as live until the external provider proof chain exists.",
    ].slice(0, 8),
    notes: [
      "Neejee is a consumer craft discovery and commerce pilot, not a clinic or B2B lead-generation pilot.",
      `Primary commerce goal: ${primaryGoal}.`,
      "SMS and WhatsApp are optional gated lifecycle channels, not mandatory launch dependencies.",
      "The plan remains draft-only until the relevant provider and production acceptance gates are evidenced.",
    ],
  });
}

export function buildExecutionPlanDraftFromPilot(pilotId = "pilot-demo") {
  const pilot = getPilot(pilotId);
  if (!pilot) throw new Error(`Pilot not found: ${pilotId}`);

  const strategy = getStrategy(pilotId);
  const landingPage = getLandingPage(pilotId);
  const googleAds = getGoogleAds(pilotId);
  const emailSequence = getEmailSequence(pilotId);
  const sms = getSms(pilotId);
  const whatsapp = getWhatsapp(pilotId);
  const campaignSummary = getCampaignSummary(pilotId);

  const pilotRecord = coerceRecord(pilot);
  const strategyRecord = coerceRecord(strategy);
  const landingPageRecord = coerceRecord(landingPage);
  const googleAdsRecord = coerceRecord(googleAds);
  const emailSequenceRecord = coerceRecord(emailSequence);
  const smsRecord = coerceRecord(sms);
  const whatsappRecord = coerceRecord(whatsapp);
  const campaignSummaryRecord = coerceRecord(campaignSummary);

  if (isNeejeeContext(pilotRecord)) {
    return buildNeejeeExecutionPlan({
      pilotId,
      pilotRecord,
      strategyRecord,
      landingPageRecord,
      googleAdsRecord,
      emailSequenceRecord,
      campaignSummaryRecord,
    });
  }

  const workspaceId =
    pickFirst(pilotRecord["workspaceId"], strategyRecord["workspaceId"], campaignSummaryRecord["workspaceId"]) ||
    "workspace-demo";
  const companyName =
    pickFirst(pilotRecord["companyName"], pilotRecord["businessName"], pilotRecord["brandName"], pilotRecord["name"]) ||
    "Pilot Company";
  const contactName =
    pickFirst(pilotRecord["contactName"], pilotRecord["ownerName"], pilotRecord["contact"]) || "Pilot Owner";
  const primaryGoal =
    pickFirst(strategyRecord["primaryGoal"], strategyRecord["goal"], campaignSummaryRecord["primaryGoal"]) ||
    "Launch the campaign";
  const coreOffer =
    pickFirst(
      strategyRecord["coreOffer"],
      strategyRecord["offer"],
      campaignSummaryRecord["coreOffer"],
      landingPageRecord["valueProp"],
      landingPageRecord["positioningStatement"],
    ) || "Clear offer";
  const landingHeadline = pickFirst(
    landingPageRecord["headline"],
    (coerceRecord(landingPageRecord["hero"]))["headline"],
    landingPageRecord["title"],
  );
  const landingCta = pickFirst(
    landingPageRecord["callToAction"],
    landingPageRecord["cta"],
    (coerceRecord(landingPageRecord["hero"]))["primaryCta"],
  );
  const adsProof = extractMessageProof(googleAdsRecord).slice(0, 3);
  const emailProof = extractMessageProof(emailSequenceRecord).slice(0, 3);
  const smsProof = extractMessageProof(smsRecord).slice(0, 2);
  const whatsappProof = extractMessageProof(whatsappRecord).slice(0, 2);
  const summaryMessages = extractMessageProof(campaignSummaryRecord).slice(0, 4);
  const summaryNextSteps = extractStringList(campaignSummaryRecord["nextSteps"]).slice(0, 4);
  const campaignName = uniqueStrings([
    pickFirst(campaignSummaryRecord["campaignName"]),
    `${companyName} ${primaryGoal}`,
  ])[0];
  const stableTimestamp = deriveTimestamp(
    campaignSummaryRecord,
    whatsappRecord,
    smsRecord,
    emailSequenceRecord,
    googleAdsRecord,
    landingPageRecord,
    strategyRecord,
    pilotRecord,
  );

  return createExecutionPlanDraftRecord({
    id: `execution-plan-${pilotId}`,
    pilotId,
    workspaceId,
    generatedAt: stableTimestamp,
    lastUpdatedAt: stableTimestamp,
    status: "draft",
    campaignName,
    launchWindow: pickFirst(strategyRecord["launchWindow"], strategyRecord["timeline"], campaignSummaryRecord["launchWindow"]) || "Controlled launch window",
    milestones: uniqueStrings([
      `Finalize the ${coreOffer.toLowerCase()} offer and landing page for ${campaignName}.`,
      landingHeadline ? `Approve the landing page hook: "${landingHeadline}".` : "",
      adsProof[0] ? `Approve paid acquisition message: "${adsProof[0]}".` : "Approve paid acquisition copy.",
      emailProof[0] ? `Approve lifecycle email message: "${emailProof[0]}".` : "Approve lifecycle email sequence.",
      smsProof[0] || whatsappProof[0] ? "Approve any enabled direct-message follow-up under consent and provider controls." : "",
      `Review performance against ${primaryGoal.toLowerCase()} before scaling.`,
    ]).slice(0, 6),
    owners: uniqueStrings([
      `${contactName} (pilot owner)`,
      landingHeadline ? "Landing page owner" : "",
      adsProof.length > 0 ? "Paid media owner" : "",
      emailProof.length > 0 ? "Lifecycle email owner" : "",
      smsProof.length > 0 ? "SMS owner" : "",
      whatsappProof.length > 0 ? "WhatsApp owner" : "",
    ]),
    blockers: uniqueStrings([
      landingHeadline ? "" : "Finalize landing-page headline before launch.",
      landingCta ? "" : "Confirm the primary CTA for the landing page.",
      adsProof.length > 0 ? "" : "Approve at least one paid acquisition message.",
      emailProof.length > 0 ? "" : "Finalize the opening lifecycle email.",
    ]),
    checklist: uniqueStrings([
      ...summaryNextSteps,
      `Confirm campaign goal: ${primaryGoal}.`,
      `Lock the offer: ${coreOffer}.`,
      landingHeadline ? `Approve landing page copy for "${landingHeadline}".` : "",
      landingCta ? `Verify CTA: ${landingCta}.` : "",
      adsProof[0] ? `Approve paid copy anchored on "${adsProof[0]}".` : "",
      emailProof[0] ? "Approve lifecycle email launch conditions." : "",
      "Assign owners and launch-review date.",
    ]).slice(0, 8),
    notes: uniqueStrings([
      `Campaign context: ${companyName} with ${contactName} as primary approver.`,
      `Primary goal: ${primaryGoal}.`,
      `Offer: ${coreOffer}.`,
      summaryMessages[0] ? `Campaign summary signal: ${summaryMessages[0]}.` : "",
      "External execution remains subject to the applicable provider, approval and budget gates.",
    ]),
  });
}

export function generateExecutionPlanDraft(
  input: string | { pilotId?: string } = "pilot-demo",
) {
  const pilotId = typeof input === "string" ? input : input.pilotId ?? "pilot-demo";
  const draft = buildExecutionPlanDraftFromPilot(pilotId);
  return saveExecutionPlanDraft(draft);
}
