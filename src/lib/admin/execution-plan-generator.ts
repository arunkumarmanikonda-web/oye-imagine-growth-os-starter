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

type Getter<TResult = unknown> = (...args: any[]) => TResult;

function resolveGetter<TResult = unknown>(
  moduleRef: Record<string, unknown>,
  names: string[],
): Getter<TResult> {
  for (const name of names) {
    const candidate = moduleRef[name];

    if (typeof candidate === "function") {
      return candidate as Getter<TResult>;
    }
  }

  throw new Error(`Unable to resolve getter. Tried: ${names.join(", ")}`);
}

const getPilot = resolveGetter(pilotStore as Record<string, unknown>, [
  "getPilot",
  "getPilotDraft",
  "getPilotById",
]);

const getStrategy = resolveGetter(strategyStore as Record<string, unknown>, [
  "getStrategy",
  "getStrategyDraft",
]);

const getLandingPage = resolveGetter(
  landingPageStore as Record<string, unknown>,
  ["getLandingPageBrief", "getLandingPageDraft", "getLandingPage"],
);

const getGoogleAds = resolveGetter(
  googleAdsStore as Record<string, unknown>,
  ["getGoogleAdsDraft", "getGoogleAdsCampaignDraft", "getGoogleAdsCampaign"],
);

const getEmailSequence = resolveGetter(
  emailSequenceStore as Record<string, unknown>,
  ["getEmailSequenceDraft", "getEmailDraft"],
);

const getSms = resolveGetter(smsStore as Record<string, unknown>, [
  "getSmsDraft",
  "getSmsMessageDraft",
]);

const getWhatsapp = resolveGetter(
  whatsappStore as Record<string, unknown>,
  ["getWhatsappDraft", "getWhatsAppDraft"],
);

const getCampaignSummary = resolveGetter(
  campaignSummaryStore as Record<string, unknown>,
  ["getCampaignSummaryDraft", "getCampaignSummary"],
);

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function pickFirst(...values: unknown[]): string {
  for (const value of values) {
    const nextValue = asString(value);

    if (nextValue) {
      return nextValue;
    }
  }

  return "";
}

function uniqueStrings(values: Array<string | undefined | null>): string[] {
  const output: string[] = [];
  const seen = new Set<string>();

  for (const value of values) {
    const normalized = asString(value);

    if (!normalized) {
      continue;
    }

    const key = normalized.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    output.push(normalized);
  }

  return output;
}

function coerceRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function extractStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const output: string[] = [];

  for (const item of value) {
    if (typeof item === "string") {
      const nextValue = item.trim();

      if (nextValue) {
        output.push(nextValue);
      }

      continue;
    }

    if (item && typeof item === "object") {
      const record = item as Record<string, unknown>;

      for (const key of [
        "headline",
        "title",
        "subject",
        "body",
        "message",
        "text",
        "description",
        "valueProp",
        "callToAction",
        "label",
      ]) {
        const nextValue = asString(record[key]);

        if (nextValue) {
          output.push(nextValue);
        }
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
    ...extractStringList(record["descriptions"]),
    ...extractStringList(record["keyMessages"]),
    ...extractStringList(record["nextSteps"]),
    pickFirst(
      record["headline"],
      record["valueProp"],
      record["callToAction"],
      record["campaignName"],
      record["notes"],
    ),
  ]);
}

function deriveTimestamp(...records: Array<Record<string, unknown>>): string {
  for (const record of records) {
    const generatedAt = asString(record["generatedAt"]);
    if (generatedAt) {
      return generatedAt;
    }

    const lastUpdatedAt = asString(record["lastUpdatedAt"]);
    if (lastUpdatedAt) {
      return lastUpdatedAt;
    }

    const updatedAt = asString(record["updatedAt"]);
    if (updatedAt) {
      return updatedAt;
    }

    const createdAt = asString(record["createdAt"]);
    if (createdAt) {
      return createdAt;
    }
  }

  return "2026-01-01T00:00:00.000Z";
}

export function buildExecutionPlanDraftFromPilot(pilotId = "pilot-demo") {
  const pilot = getPilot(pilotId);

  if (!pilot) {
    throw new Error(`Pilot not found: ${pilotId}`);
  }

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

  const workspaceId =
    pickFirst(
      pilotRecord["workspaceId"],
      strategyRecord["workspaceId"],
      campaignSummaryRecord["workspaceId"],
    ) || "workspace-demo";

  const companyName =
    pickFirst(
      pilotRecord["companyName"],
      pilotRecord["businessName"],
      pilotRecord["name"],
    ) || "Pilot Company";

  const contactName =
    pickFirst(
      pilotRecord["contactName"],
      pilotRecord["ownerName"],
      pilotRecord["contact"],
    ) || "Pilot Owner";

  const primaryGoal =
    pickFirst(
      strategyRecord["primaryGoal"],
      strategyRecord["goal"],
      campaignSummaryRecord["primaryGoal"],
    ) || "Launch the campaign";

  const coreOffer =
    pickFirst(
      strategyRecord["coreOffer"],
      strategyRecord["offer"],
      campaignSummaryRecord["coreOffer"],
      landingPageRecord["valueProp"],
    ) || "Clear offer";

  const landingHeadline = pickFirst(
    landingPageRecord["headline"],
    landingPageRecord["title"],
  );

  const landingValueProp = pickFirst(
    landingPageRecord["valueProp"],
    landingPageRecord["subheadline"],
    landingPageRecord["description"],
  );

  const landingCta = pickFirst(
    landingPageRecord["callToAction"],
    landingPageRecord["cta"],
  );

  const adsProof = extractMessageProof(googleAdsRecord).slice(0, 3);
  const emailProof = extractMessageProof(emailSequenceRecord).slice(0, 3);
  const smsProof = extractMessageProof(smsRecord).slice(0, 2);
  const whatsappProof = extractMessageProof(whatsappRecord).slice(0, 2);
  const summaryMessages = extractMessageProof(campaignSummaryRecord).slice(0, 4);
  const summaryChannels = extractStringList(campaignSummaryRecord["channels"]).slice(0, 5);
  const summaryNextSteps = extractStringList(campaignSummaryRecord["nextSteps"]).slice(0, 4);

  const campaignName = uniqueStrings([
    pickFirst(campaignSummaryRecord["campaignName"]),
    `${companyName} ${primaryGoal}`,
  ])[0];

  const launchWindow =
    pickFirst(
      strategyRecord["launchWindow"],
      strategyRecord["timeline"],
      campaignSummaryRecord["launchWindow"],
    ) || "Next 14 days";

  const milestones = uniqueStrings([
    `Finalize the ${coreOffer.toLowerCase()} offer and landing page for ${campaignName}.`,
    landingHeadline
      ? `Approve the landing page hook: "${landingHeadline}".`
      : "",
    adsProof[0]
      ? `Launch paid traffic using Google Ads proof point: "${adsProof[0]}".`
      : "Launch paid traffic with approved Google Ads copy.",
    emailProof[0]
      ? `Activate the email sequence starting with "${emailProof[0]}".`
      : "Activate the email sequence and review deliverability.",
    smsProof[0] || whatsappProof[0]
      ? `Turn on follow-up messaging across SMS and WhatsApp with concise reminders.`
      : "Prepare direct follow-up messaging for high-intent leads.",
    `Review first-week performance and optimize toward ${primaryGoal.toLowerCase()}.`,
  ]).slice(0, 6);

  const owners = uniqueStrings([
    `${contactName} (pilot owner)`,
    landingHeadline ? "Landing page owner" : "",
    adsProof.length > 0 ? "Paid media owner" : "",
    emailProof.length > 0 ? "Lifecycle email owner" : "",
    smsProof.length > 0 ? "SMS owner" : "",
    whatsappProof.length > 0 ? "WhatsApp owner" : "",
  ]);

  const blockers = uniqueStrings([
    landingHeadline ? "" : "Finalize landing-page headline before launch.",
    landingCta ? "" : "Confirm the primary CTA for the landing page.",
    adsProof.length > 0 ? "" : "Approve at least one Google Ads headline and description.",
    emailProof.length > 0 ? "" : "Finalize the email-sequence opening subject and body.",
    smsProof.length > 0 ? "" : "Approve the core SMS reminder message.",
    whatsappProof.length > 0 ? "" : "Approve the core WhatsApp follow-up message.",
    summaryChannels.length > 0 ? "" : "Confirm which channels are in the initial rollout.",
  ]);

  const checklist = uniqueStrings([
    ...summaryNextSteps,
    `Confirm campaign goal: ${primaryGoal}.`,
    `Lock the offer: ${coreOffer}.`,
    landingHeadline ? `Publish landing page copy for "${landingHeadline}".` : "",
    landingCta ? `Verify CTA: ${landingCta}.` : "",
    adsProof[0] ? `Approve paid copy anchored on "${adsProof[0]}".` : "",
    emailProof[0] ? `Schedule lifecycle email launch.` : "",
    smsProof[0] ? `Enable SMS reminder follow-up.` : "",
    whatsappProof[0] ? `Enable WhatsApp follow-up for warm leads.` : "",
    "Assign owners and launch-review date.",
  ]).slice(0, 8);

  const notes = uniqueStrings([
    `Campaign context: ${companyName} with ${contactName} as primary approver.`,
    `Primary goal: ${primaryGoal}.`,
    `Offer: ${coreOffer}.`,
    landingValueProp ? `Landing-page value prop: ${landingValueProp}.` : "",
    summaryMessages[0] ? `Campaign summary signal: ${summaryMessages[0]}.` : "",
    adsProof[1] ? `Additional paid proof: ${adsProof[1]}.` : "",
    emailProof[1] ? `Additional email proof: ${emailProof[1]}.` : "",
    smsProof[0] ? `SMS proof: ${smsProof[0]}.` : "",
    whatsappProof[0] ? `WhatsApp proof: ${whatsappProof[0]}.` : "",
    pickFirst(campaignSummaryRecord["notes"]),
  ]);

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
    launchWindow,
    milestones,
    owners,
    blockers,
    checklist,
    notes,
  });
}

export function generateExecutionPlanDraft(
  input: string | { pilotId?: string } = "pilot-demo",
) {
  const pilotId =
    typeof input === "string" ? input : input.pilotId ?? "pilot-demo";

  const draft = buildExecutionPlanDraftFromPilot(pilotId);
  return saveExecutionPlanDraft(draft);
}