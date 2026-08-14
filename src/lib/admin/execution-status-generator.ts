import * as pilotStore from "@/lib/admin/pilot-store";
import * as strategyStore from "@/lib/admin/strategy-store";
import * as landingPageStore from "@/lib/admin/landing-page-store";
import * as googleAdsStore from "@/lib/admin/google-ads-store";
import * as emailSequenceStore from "@/lib/admin/email-sequence-store";
import * as smsStore from "@/lib/admin/sms-store";
import * as whatsappStore from "@/lib/admin/whatsapp-store";
import * as campaignSummaryStore from "@/lib/admin/campaign-summary-store";
import * as executionPlanStore from "@/lib/admin/execution-plan-store";
import { createExecutionStatusDraftRecord } from "@/lib/admin/execution-status-schema";
import { saveExecutionStatusDraft } from "@/lib/admin/execution-status-store";
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
const getStrategy = resolveGetter(strategyStore as Record<string, unknown>, ["getStrategyDraft", "getStrategy", "getStrategyBrief", "getSelectedStrategy"]);
const getLandingPage = resolveGetter(landingPageStore as Record<string, unknown>, ["getLandingPageBrief", "getLandingPageDraft", "getLandingPage"]);
const getGoogleAds = resolveGetter(googleAdsStore as Record<string, unknown>, ["getGoogleAdsDraft", "getGoogleAdsCampaignDraft", "getGoogleAdsCampaign"]);
const getEmailSequence = resolveGetter(emailSequenceStore as Record<string, unknown>, ["getEmailSequenceDraft", "getEmailDraft"]);
const getSms = resolveGetter(smsStore as Record<string, unknown>, ["getSmsDraft", "getSmsMessageDraft"]);
const getWhatsapp = resolveGetter(whatsappStore as Record<string, unknown>, ["getWhatsappDraft", "getWhatsAppDraft"]);
const getCampaignSummary = resolveGetter(campaignSummaryStore as Record<string, unknown>, ["getCampaignSummaryDraft", "getCampaignSummary"]);
const getExecutionPlan = resolveGetter(executionPlanStore as Record<string, unknown>, ["getExecutionPlanDraft", "getExecutionPlan"]);

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

function extractProof(value: unknown): string[] {
  const record = coerceRecord(value);
  return uniqueStrings([
    ...extractStringList(record["messages"]),
    ...extractStringList(record["emails"]),
    ...extractStringList(record["headlines"]),
    ...extractStringList(record["adCopy"]),
    ...extractStringList(record["descriptions"]),
    ...extractStringList(record["milestones"]),
    ...extractStringList(record["owners"]),
    ...extractStringList(record["blockers"]),
    ...extractStringList(record["checklist"]),
    ...extractStringList(record["completedItems"]),
    ...extractStringList(record["inProgressItems"]),
    ...extractStringList(record["blockedItems"]),
    ...extractStringList(record["upcomingItems"]),
    ...extractStringList(record["keyMessages"]),
    ...extractStringList(record["nextSteps"]),
    pickFirst(record["headline"], record["valueProp"], record["callToAction"], record["campaignName"], record["overallStatus"]),
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

function buildNeejeeExecutionStatus(input: {
  pilotId: string;
  pilotRecord: Record<string, unknown>;
  strategyRecord: Record<string, unknown>;
  landingPageRecord: Record<string, unknown>;
  googleAdsRecord: Record<string, unknown>;
  emailSequenceRecord: Record<string, unknown>;
  campaignSummaryRecord: Record<string, unknown>;
  executionPlanRecord: Record<string, unknown>;
}) {
  const workspaceId =
    pickFirst(
      input.pilotRecord["workspaceId"],
      input.strategyRecord["workspaceId"],
      input.campaignSummaryRecord["workspaceId"],
      input.executionPlanRecord["workspaceId"],
    ) || "workspace_neejee_primary";
  const primaryGoal =
    pickFirst(
      input.strategyRecord["primaryGoal"],
      input.strategyRecord["goal"],
      input.campaignSummaryRecord["primaryGoal"],
    ) || neejeeBrandTruth.growth.objectives[2];
  const planBlockers = extractStringList(input.executionPlanRecord["blockers"]);
  const planMilestones = extractStringList(input.executionPlanRecord["milestones"]);
  const landingSignals = extractProof(input.landingPageRecord).slice(0, 2);
  const adsSignals = extractProof(input.googleAdsRecord).slice(0, 2);
  const emailSignals = extractProof(input.emailSequenceRecord).slice(0, 2);
  const stableTimestamp = deriveTimestamp(
    input.executionPlanRecord,
    input.campaignSummaryRecord,
    input.emailSequenceRecord,
    input.googleAdsRecord,
    input.landingPageRecord,
    input.strategyRecord,
    input.pilotRecord,
  );

  return createExecutionStatusDraftRecord({
    id: `execution-status-${input.pilotId}`,
    pilotId: input.pilotId,
    workspaceId,
    generatedAt: stableTimestamp,
    lastUpdatedAt: stableTimestamp,
    status: "draft",
    campaignName: "Neejee controlled commerce proving loop",
    overallStatus: "Draft — external activation gated",
    completedItems: [
      "Canonical Neejee brand truth is defined for the pilot.",
      landingSignals[0]
        ? `Commerce discovery direction is represented in the current landing draft: ${landingSignals[0]}.`
        : "Commerce discovery landing direction is defined.",
      "Irreversible commercial/media mutations are frozen until their production acceptance gates pass.",
    ],
    inProgressItems: [
      planMilestones[0] ? `In progress: ${planMilestones[0]}` : "Validate live product, category and provenance inputs.",
      adsSignals[0]
        ? `Paid-search draft is being reviewed without external execution: ${adsSignals[0]}.`
        : "Paid-search drafts remain under review without external execution.",
      emailSignals[0]
        ? `Consented lifecycle draft is being reviewed without send execution: ${emailSignals[0]}.`
        : "Lifecycle drafts remain under review without send execution.",
    ],
    blockedItems: uniqueStrings([
      ...planBlockers,
      "Production activation remains blocked until ecommerce measurement and provider proof chains are verified.",
    ]).slice(0, 5),
    upcomingItems: [
      planMilestones[1] ? `Next: ${planMilestones[1]}` : "Next: verify ecommerce analytics and attribution freshness.",
      "Next: select a bounded Neejee proving campaign from current approved products/categories and asset rights.",
      `Next: evaluate progress against the commerce goal "${primaryGoal}" only with verified data.`,
    ],
    notes: [
      "Neejee is tracked as a consumer craft discovery and commerce pilot, not a healthcare or B2B pipeline pilot.",
      "Google Ads, Meta, email, SMS and WhatsApp remain at their separately verified readiness levels; draft assets do not imply live connectivity.",
      "SMS/WhatsApp coverage is not a launch-completeness requirement while those channels remain gated.",
      "Stock, price, shipping, returns, promotion and provenance claims require current approved source evidence before publication.",
    ],
  });
}

export function buildExecutionStatusDraftFromPilot(pilotId = "pilot-demo") {
  const pilot = getPilot(pilotId);
  if (!pilot) throw new Error(`Pilot not found: ${pilotId}`);

  const strategy = getStrategy(pilotId);
  const landingPage = getLandingPage(pilotId);
  const googleAds = getGoogleAds(pilotId);
  const emailSequence = getEmailSequence(pilotId);
  const sms = getSms(pilotId);
  const whatsapp = getWhatsapp(pilotId);
  const campaignSummary = getCampaignSummary(pilotId);
  const executionPlan = getExecutionPlan(pilotId);

  const pilotRecord = coerceRecord(pilot);
  const strategyRecord = coerceRecord(strategy);
  const landingPageRecord = coerceRecord(landingPage);
  const googleAdsRecord = coerceRecord(googleAds);
  const emailSequenceRecord = coerceRecord(emailSequence);
  const smsRecord = coerceRecord(sms);
  const whatsappRecord = coerceRecord(whatsapp);
  const campaignSummaryRecord = coerceRecord(campaignSummary);
  const executionPlanRecord = coerceRecord(executionPlan);

  if (isNeejeeContext(pilotRecord)) {
    return buildNeejeeExecutionStatus({
      pilotId,
      pilotRecord,
      strategyRecord,
      landingPageRecord,
      googleAdsRecord,
      emailSequenceRecord,
      campaignSummaryRecord,
      executionPlanRecord,
    });
  }

  const workspaceId =
    pickFirst(
      pilotRecord["workspaceId"],
      strategyRecord["workspaceId"],
      campaignSummaryRecord["workspaceId"],
      executionPlanRecord["workspaceId"],
    ) || "workspace-demo";
  const companyName =
    pickFirst(
      pilotRecord["companyName"],
      pilotRecord["businessName"],
      pilotRecord["brandName"],
      pilotRecord["name"],
    ) || "Pilot Company";
  const contactName =
    pickFirst(pilotRecord["contactName"], pilotRecord["ownerName"], pilotRecord["contact"]) ||
    "Pilot Owner";
  const primaryGoal =
    pickFirst(strategyRecord["primaryGoal"], strategyRecord["goal"], campaignSummaryRecord["primaryGoal"]) ||
    "Launch the campaign";
  const campaignName = uniqueStrings([
    pickFirst(executionPlanRecord["campaignName"], campaignSummaryRecord["campaignName"]),
    `${companyName} ${primaryGoal}`,
  ])[0];
  const overallStatus = pickFirst(
    executionPlanRecord["status"],
    campaignSummaryRecord["overallStatus"],
    campaignSummaryRecord["status"],
    "Draft",
  );
  const landingHero = coerceRecord(landingPageRecord["hero"]);
  const landingHeadline = pickFirst(landingHero["headline"], landingPageRecord["headline"], landingPageRecord["title"]);
  const landingValueProp = pickFirst(
    landingHero["subheadline"],
    landingPageRecord["valueProp"],
    landingPageRecord["subheadline"],
    landingPageRecord["description"],
  );
  const planMilestones = extractProof(executionPlanRecord).slice(0, 6);
  const summarySignals = extractProof(campaignSummaryRecord).slice(0, 5);
  const adsSignals = extractProof(googleAdsRecord).slice(0, 2);
  const emailSignals = extractProof(emailSequenceRecord).slice(0, 2);
  const smsSignals = extractProof(smsRecord).slice(0, 1);
  const whatsappSignals = extractProof(whatsappRecord).slice(0, 1);
  const stableTimestamp = deriveTimestamp(
    executionPlanRecord,
    campaignSummaryRecord,
    whatsappRecord,
    smsRecord,
    emailSequenceRecord,
    googleAdsRecord,
    landingPageRecord,
    strategyRecord,
    pilotRecord,
  );
  const normalizedStatus =
    overallStatus.toLowerCase() === "completed"
      ? "completed"
      : overallStatus.toLowerCase().includes("blocked")
        ? "blocked"
        : overallStatus.toLowerCase().includes("risk")
          ? "at-risk"
          : overallStatus.toLowerCase().includes("track")
            ? "on-track"
            : "draft";

  return createExecutionStatusDraftRecord({
    id: `execution-status-${pilotId}`,
    pilotId,
    workspaceId,
    generatedAt: stableTimestamp,
    lastUpdatedAt: stableTimestamp,
    status: normalizedStatus,
    campaignName,
    overallStatus,
    completedItems: uniqueStrings([
      `Campaign brief aligned for ${campaignName}.`,
      landingHeadline ? `Landing-page direction set with "${landingHeadline}".` : "",
      summarySignals[0] ? `Cross-channel summary captured: ${summarySignals[0]}.` : "",
    ]).slice(0, 3),
    inProgressItems: uniqueStrings([
      planMilestones[0] ? `In progress: ${planMilestones[0]}` : "",
      adsSignals[0] ? `Paid acquisition messaging is being finalized: ${adsSignals[0]}.` : "",
      emailSignals[0] ? `Lifecycle email sequence is being prepared: ${emailSignals[0]}.` : "",
    ]).slice(0, 3),
    blockedItems: uniqueStrings([
      Array.isArray(executionPlanRecord["blockers"])
        ? extractStringList(executionPlanRecord["blockers"])[0]
        : "",
      landingValueProp ? "" : "Landing-page value proposition still needs approval.",
      smsSignals[0] || whatsappSignals[0]
        ? ""
        : "Any direct-message channel intended for launch must meet its own consent/provider requirements.",
    ]).slice(0, 3),
    upcomingItems: uniqueStrings([
      planMilestones[1] ? `Next: ${planMilestones[1]}` : "",
      Array.isArray(executionPlanRecord["checklist"])
        ? extractStringList(executionPlanRecord["checklist"])[0]
        : "",
      `Next review with ${contactName} to confirm progress against ${primaryGoal.toLowerCase()}.`,
    ]).slice(0, 3),
    notes: uniqueStrings([
      `Execution status for ${campaignName}.`,
      `Primary approver: ${contactName}.`,
      `Goal: ${primaryGoal}.`,
      landingValueProp ? `Landing-page value prop: ${landingValueProp}.` : "",
      adsSignals[1] ? `Additional paid signal: ${adsSignals[1]}.` : "",
      emailSignals[1] ? `Additional email signal: ${emailSignals[1]}.` : "",
    ]).slice(0, 8),
  });
}

export function generateExecutionStatusDraft(
  input: string | { pilotId?: string } = "pilot-demo",
) {
  const pilotId = typeof input === "string" ? input : input.pilotId ?? "pilot-demo";
  const draft = buildExecutionStatusDraftFromPilot(pilotId);
  return saveExecutionStatusDraft(draft);
}
