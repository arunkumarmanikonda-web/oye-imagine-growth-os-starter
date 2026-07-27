import { createDefaultGoogleAdsCampaignDraftFixture } from "@/lib/admin/google-ads-fixtures";
import {
  createGoogleAdsCampaignDraftRecord,
  type GoogleAdsCampaignDraftInput,
  type GoogleAdsCampaignDraftRecord,
} from "@/lib/admin/google-ads-schema";

let currentGoogleAdsDraft: GoogleAdsCampaignDraftRecord | null = null;

export function getGoogleAdsDraft(): GoogleAdsCampaignDraftRecord | null {
  return currentGoogleAdsDraft;
}

export function createDefaultGoogleAdsDraft(): GoogleAdsCampaignDraftRecord {
  const draft = createDefaultGoogleAdsCampaignDraftFixture();
  currentGoogleAdsDraft = draft;
  return draft;
}

export function saveGoogleAdsDraft(
  draft: GoogleAdsCampaignDraftRecord,
): GoogleAdsCampaignDraftRecord {
  currentGoogleAdsDraft = {
    ...draft,
    lastUpdatedAt: new Date().toISOString(),
  };

  return currentGoogleAdsDraft;
}

export function updateGoogleAdsDraft(
  patch: GoogleAdsCampaignDraftInput,
): GoogleAdsCampaignDraftRecord {
  const base = currentGoogleAdsDraft ?? createDefaultGoogleAdsDraft();

  const next = createGoogleAdsCampaignDraftRecord({
    ...base,
    ...patch,
  });

  currentGoogleAdsDraft = {
    ...next,
    generatedAt: base.generatedAt,
    lastUpdatedAt: new Date().toISOString(),
  };

  return currentGoogleAdsDraft;
}

export function resetGoogleAdsDraftStore(): void {
  currentGoogleAdsDraft = null;
}