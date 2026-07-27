import {
  createCampaignSummaryDraftRecord,
  type CampaignSummaryDraftRecord,
} from "@/lib/admin/campaign-summary-schema";
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
  const previousGeneratedAt =
    campaignSummaryDraftState?.generatedAt ??
    input.generatedAt ??
    new Date().toISOString();

  campaignSummaryDraftState = createCampaignSummaryDraftRecord({
    ...input,
    generatedAt: previousGeneratedAt,
    lastUpdatedAt: new Date().toISOString(),
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
    lastUpdatedAt: new Date().toISOString(),
  });

  return campaignSummaryDraftState;
}

export function resetCampaignSummaryDraftStore() {
  campaignSummaryDraftState = createCampaignSummaryDraftRecord(
    campaignSummaryDraftFixture,
  );

  return campaignSummaryDraftState;
}