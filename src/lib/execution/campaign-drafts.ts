import type { CampaignDraft, CampaignDraftInput } from './execution-types';

export function buildCampaignDraft(input: CampaignDraftInput): CampaignDraft {
  const complianceFlags: string[] = [];

  if (input.budgetAmount > 50000) {
    complianceFlags.push('budget_review_required');
  }

  if (input.platform === 'meta_ads' && input.objective === 'sales') {
    complianceFlags.push('pixel_validation_required');
  }

  if (input.geoTargets.length === 0) {
    complianceFlags.push('geo_target_missing');
  }

  const adSets = input.hooks.map((hook, index) => ({
    name: `${input.platform}_set_${index + 1}`,
    audience: input.audienceSummary,
    hook,
    cta:
      input.objective === 'lead_generation'
        ? 'Submit lead form'
        : input.objective === 'sales'
          ? 'Shop now'
          : 'Learn more',
  }));

  return {
    platform: input.platform,
    objective: input.objective,
    budgetAmount: input.budgetAmount,
    budgetCurrency: input.budgetCurrency,
    geoTargets: input.geoTargets,
    complianceFlags,
    adSets,
  };
}

export function campaignNeedsApproval(draft: CampaignDraft): boolean {
  return draft.complianceFlags.length > 0 || draft.budgetAmount > 10000;
}

export function campaignDraftHasBudgetGuardrails(draft: CampaignDraft): boolean {
  return Boolean(
    draft.budgetAmount > 0 &&
    draft.budgetCurrency &&
    draft.geoTargets.length > 0 &&
    draft.adSets.length > 0
  );
}
