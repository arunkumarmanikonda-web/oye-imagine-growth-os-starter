export type CampaignSummaryStatus = "draft" | "approved";

export type CampaignSummaryDraftRecord = {
  id: string;
  pilotId: string;
  workspaceId: string;
  generatedAt: string;
  lastUpdatedAt: string;
  status: CampaignSummaryStatus;
  campaignName: string;
  primaryGoal: string;
  coreOffer: string;
  channels: string[];
  keyMessages: string[];
  nextSteps: string[];
  notes: string[];
};

function asStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) {
    return [...fallback];
  }

  const items = value
    .map((entry) => `${entry}`.trim())
    .filter((entry) => entry.length > 0);

  return items.length > 0 ? items : [...fallback];
}

export function createCampaignSummaryDraftRecord(
  input: Partial<CampaignSummaryDraftRecord> = {},
): CampaignSummaryDraftRecord {
  const now = new Date().toISOString();

  return {
    id: input.id ?? "campaign-summary-pilot-demo",
    pilotId: input.pilotId ?? "pilot-demo",
    workspaceId: input.workspaceId ?? "workspace-demo",
    generatedAt: input.generatedAt ?? now,
    lastUpdatedAt: input.lastUpdatedAt ?? input.generatedAt ?? now,
    status: input.status ?? "draft",
    campaignName: input.campaignName ?? "Growth Campaign Summary",
    primaryGoal: input.primaryGoal ?? "Increase qualified pipeline",
    coreOffer: input.coreOffer ?? "A clearer conversion path for high-intent prospects",
    channels: asStringArray(input.channels, [
      "Landing Page",
      "Google Ads",
      "Email Sequence",
      "SMS",
      "WhatsApp",
    ]),
    keyMessages: asStringArray(input.keyMessages, [
      "Keep every channel aligned around one clear promise.",
      "Reinforce proof and value across the full journey.",
      "Guide high-intent prospects toward a reply or booking action.",
    ]),
    nextSteps: asStringArray(input.nextSteps, [
      "Review the campaign summary with stakeholders.",
      "Validate channel alignment before launch.",
      "Approve launch-ready assets and execution timing.",
    ]),
    notes: asStringArray(input.notes, [
      "Use this summary as the reference layer across campaign assets.",
    ]),
  };
}