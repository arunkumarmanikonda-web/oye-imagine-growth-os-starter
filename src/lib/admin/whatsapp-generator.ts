import * as pilotStore from "@/lib/admin/pilot-store";
import * as strategyStore from "@/lib/admin/strategy-store";
import * as landingPageStore from "@/lib/admin/landing-page-store";
import * as googleAdsStore from "@/lib/admin/google-ads-store";
import * as emailSequenceStore from "@/lib/admin/email-sequence-store";
import * as smsStore from "@/lib/admin/sms-store";
import { createWhatsappDraftRecord } from "@/lib/admin/whatsapp-schema";
import { saveWhatsappDraft } from "@/lib/admin/whatsapp-store";
import {
  isNeejeeContext,
  neejeeBrandTruth,
} from "@/lib/admin/neejee-brand-truth";

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

function truncate(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

const getPilot = resolveGetter(pilotStore, ["getPilot", "getPilotRecord", "getPilotDraft"]);
const getStrategy = resolveGetter(strategyStore, ["getStrategy", "getStrategyRecord", "getStrategyBrief", "getStrategyDraft"]);
const getLandingPage = resolveGetter(landingPageStore, ["getLandingPageBrief", "getLandingPageDraft", "getLandingPage"]);
const getGoogleAds = resolveGetter(googleAdsStore, ["getGoogleAdsDraft", "getGoogleAds"]);
const getEmailSequence = resolveGetter(emailSequenceStore, ["getEmailSequenceDraft", "getEmailSequence"]);
const getSms = resolveGetter(smsStore, ["getSmsDraft", "getSms"]);

function buildNeejeeWhatsappDraft(pilotId: string, pilot: LooseRecord) {
  const workspaceId = pickString(pilot, ["workspaceId"], "workspace_neejee_primary");
  const destination = neejeeBrandTruth.identity.website;

  return createWhatsappDraftRecord({
    id: `whatsapp-${pilotId}`,
    pilotId,
    workspaceId,
    status: "draft",
    senderName: "Neejee",
    goal: "Support consented shopper discovery, cart/order service or relevant product guidance without cold B2B outreach.",
    messages: [
      {
        id: `${pilotId}-whatsapp-1`,
        body: truncate(
          `Hello from Neejee. If you opted in to continue your discovery, you can return to the piece, collection or craft story that interested you here: ${destination}`,
          340,
        ),
      },
      {
        id: `${pilotId}-whatsapp-2`,
        body: truncate(
          "A useful Neejee follow-up should add context, not pressure: maker, region, technique, material, availability or order information must come from current approved product data.",
          340,
        ),
      },
      {
        id: `${pilotId}-whatsapp-3`,
        body: truncate(
          "If you want help finding the right piece or gift, continue with Neejee's relevant discovery journey. Mirror, Space or Concierge should be offered only where that experience is actually available.",
          340,
        ),
      },
    ],
    notes: [
      "Draft only. Production WhatsApp requires opt-in, approved templates where applicable, opt-out handling and verified provider/account configuration.",
      "Replace generic links with consented shopper-specific product/cart/order links before execution.",
      "Do not invent stock, price, shipping, returns, discount or provenance claims.",
    ],
  });
}

export function buildWhatsappDraftFromPilot(pilotId: string) {
  const pilotValue = getPilot(pilotId);
  if (!pilotValue) throw new Error(`Pilot not found for ID "${pilotId}"`);

  const pilot = asRecord(pilotValue);
  if (isNeejeeContext(pilot)) return buildNeejeeWhatsappDraft(pilotId, pilot);

  const strategy = asRecord(getStrategy(pilotId));
  const landingPage = asRecord(getLandingPage(pilotId));
  const googleAds = asRecord(getGoogleAds(pilotId));
  const emailSequence = asRecord(getEmailSequence(pilotId));
  const smsDraft = asRecord(getSms(pilotId));

  const workspaceId = pickString(pilot, ["workspaceId"], "") || pickString(strategy, ["workspaceId"], "") || "workspace-demo";
  const companyName = pickString(
    pilot,
    ["companyName", "company.name", "businessName", "brandName", "workspaceName"],
    "Client",
  );
  const contactName = pickString(pilot, ["contactName", "contact.name", "ownerName", "founderName"], "");
  const senderName = contactName ? `${contactName} at ${companyName}` : companyName;
  const audience = pickString(
    strategy,
    ["audience", "primaryAudience", "customerSegment"],
    pickString(pilot, ["audience", "targetAudience"], "qualified audience"),
  );
  const goal = pickString(
    strategy,
    ["goal", "primaryGoal", "objective"],
    pickString(pilot, ["goal", "primaryGoal"], "support a relevant next action"),
  );
  const headline = pickString(
    landingPage,
    ["hero.headline", "headline", "heroHeadline", "title"],
    "A clearer next step",
  );
  const valueProp = pickString(
    landingPage,
    ["hero.subheadline", "subheadline", "valueProposition", "description", "heroSubheadline"],
    "A focused message and next action",
  );
  const adProof = pickString(
    googleAds,
    ["headlines.0", "messages.0.body", "ads.0.headline", "ads.0.copy"],
    "Use only approved campaign proof",
  );
  const emailProof = pickString(
    emailSequence,
    ["emails.0.subject", "messages.0.subject", "messages.0.body"],
    "Keep lifecycle messages aligned",
  );
  const smsProof = pickString(
    smsDraft,
    ["messages.0.body", "messages.1.body"],
    "Keep short-message claims consistent",
  );
  const callToAction = pickString(strategy, ["callToAction", "cta"], "Continue if this remains relevant.");

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
        body: truncate(`Hello. ${headline}. ${valueProp}. This is intended for ${audience}. - ${senderName}`, 340),
      },
      {
        id: `${pilotId}-whatsapp-2`,
        body: truncate(`Relevant proof: ${adProof}. Email: ${emailProof}. SMS: ${smsProof}.`, 340),
      },
      {
        id: `${pilotId}-whatsapp-3`,
        body: truncate(`If the goal is to ${goal.toLowerCase()}, keep the next action consistent. ${callToAction}`, 340),
      },
    ],
    notes: ["Draft only; production WhatsApp requires consent and provider/compliance verification."],
  });
}

export function generateWhatsappDraft(pilotId = "pilot-demo") {
  const draft = buildWhatsappDraftFromPilot(pilotId);
  saveWhatsappDraft(draft);
  return draft;
}
