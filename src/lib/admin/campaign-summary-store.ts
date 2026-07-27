import {
  createCampaignSummaryDraftRecord,
  type CampaignSummaryDraftRecord,
} from "@/lib/admin/campaign-summary-schema";
function getNextTimestamp(previous?: string) {
  const now = new Date();
  const previousTime = previous ? new Date(previous).getTime() : Number.NaN;
  const nextTime =
    Number.isFinite(previousTime) && now.getTime() <= previousTime
      ? previousTime + 1
      : now.getTime();

  return new Date(nextTime).toISOString();
}
import { campaignSummaryDraftFixture } from "@/lib/admin/campaign-summary-fixtures";

let campaignSummaryDraftState: CampaignSummaryDraftRecord =
  createCampaignSummaryDraftRecord(campaignSummaryDraftFixture);

export function getCampaignSummaryDraft() {
  return campaignSummaryDraftState;
}

export function createCampaignSummaryDraft(
  overrides: Partial<CampaignSummaryDraftRecord> = {},
) {
  return createCampaignSummaryDraftRecord(overrides);
}

export function saveCampaignSummaryDraft(
  input: Partial<CampaignSummaryDraftRecord>,
) {
  const generatedAt =
    input.generatedAt ??
    campaignSummaryDraftState?.generatedAt ??
    getNextTimestamp();

  campaignSummaryDraftState = createCampaignSummaryDraftRecord({
    ...input,
    generatedAt,
    lastUpdatedAt: getNextTimestamp(campaignSummaryDraftState?.lastUpdatedAt),
  });

  return campaignSummaryDraftState;
}

export function updateCampaignSummaryDraft(
  updates: Partial<CampaignSummaryDraftRecord>,
) {
  campaignSummaryDraftState = createCampaignSummaryDraftRecord({
    ...campaignSummaryDraftState,
    ...updates,
    generatedAt: campaignSummaryDraftState.generatedAt,
    lastUpdatedAt: getNextTimestamp(campaignSummaryDraftState.lastUpdatedAt),
  });

  return campaignSummaryDraftState;
}

export function resetCampaignSummaryDraftStore() {
  campaignSummaryDraftState = createCampaignSummaryDraftRecord(
    campaignSummaryDraftFixture,
  );

  return campaignSummaryDraftState;
}