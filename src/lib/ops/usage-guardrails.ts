import type { EnforcementAction, UsageAssessment, UsageSnapshotInput } from './ops-types';

function ratio(used: number, limit: number): number {
  if (limit <= 0) {
    return 0;
  }

  return Math.round((used / limit) * 10000) / 10000;
}

export function assessUsageSnapshot(input: UsageSnapshotInput): UsageAssessment {
  const utilization = {
    aiCostRatio: ratio(input.aiCostAmount, input.quotaLimit.aiCostAmount),
    contentRatio: ratio(input.contentItemsGenerated, input.quotaLimit.contentItemsGenerated),
    campaignRatio: ratio(input.campaignsExported, input.quotaLimit.campaignsExported),
    reportRatio: ratio(input.reportsGenerated, input.quotaLimit.reportsGenerated),
  };

  const overageFlags: string[] = [];

  if (utilization.aiCostRatio > 1) {
    overageFlags.push('ai_cost_limit_exceeded');
  }

  if (utilization.contentRatio > 1) {
    overageFlags.push('content_generation_limit_exceeded');
  }

  if (utilization.campaignRatio > 1) {
    overageFlags.push('campaign_export_limit_exceeded');
  }

  if (utilization.reportRatio > 1) {
    overageFlags.push('report_generation_limit_exceeded');
  }

  let enforcementAction: EnforcementAction = 'none';

  if (overageFlags.length > 0) {
    enforcementAction = overageFlags.includes('ai_cost_limit_exceeded') ? 'hard_cap' : 'soft_cap';
  } else if (
    utilization.aiCostRatio >= 0.85 ||
    utilization.contentRatio >= 0.85 ||
    utilization.campaignRatio >= 0.85 ||
    utilization.reportRatio >= 0.85
  ) {
    enforcementAction = 'notify';
  }

  return {
    overageFlags,
    enforcementAction,
    utilization,
  };
}

export function usageNeedsAttention(assessment: UsageAssessment): boolean {
  return assessment.enforcementAction !== 'none';
}