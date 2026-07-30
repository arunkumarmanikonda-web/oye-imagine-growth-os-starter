import { describe, expect, it } from 'vitest';
import {
  approvalSatisfied,
  evaluateApprovalRequirement,
  resolveApprovalPolicy,
} from '../../src/lib/platform/approval-policy';
import type { ApprovalPolicy } from '../../src/lib/platform/control-plane-types';

describe('platform approval policies', () => {
  const policies: ApprovalPolicy[] = [
    {
      policyId: 'tenant_default_campaign_launch',
      tenantId: 'tenant_1',
      scopeType: 'brand',
      scopeRef: null,
      actionKey: 'campaign.launch',
      makerCheckerRequired: true,
      minApprovers: 1,
      approvalMode: 'any',
      maxAmount: 10000,
      maxDeltaPercent: 10,
      isActive: true,
    },
    {
      policyId: 'brand_specific_campaign_launch',
      tenantId: 'tenant_1',
      scopeType: 'brand',
      scopeRef: 'brand_1',
      actionKey: 'campaign.launch',
      makerCheckerRequired: true,
      minApprovers: 2,
      approvalMode: 'all',
      maxAmount: 5000,
      maxDeltaPercent: 5,
      isActive: true,
    },
  ];

  it('selects the most specific matching policy', () => {
    const policy = resolveApprovalPolicy(policies, {
      tenantId: 'tenant_1',
      actionKey: 'campaign.launch',
      scopeType: 'brand',
      scopeRef: 'brand_1',
      actorUserId: 'user_maker',
    });

    expect(policy?.policyId).toBe('brand_specific_campaign_launch');
  });

  it('requires approval when thresholds are exceeded', () => {
    const evaluation = evaluateApprovalRequirement(policies, {
      tenantId: 'tenant_1',
      actionKey: 'campaign.launch',
      scopeType: 'brand',
      scopeRef: 'brand_1',
      actorUserId: 'user_maker',
      amount: 7500,
      deltaPercent: 7,
    });

    expect(evaluation.approvalRequired).toBe(true);
    expect(evaluation.reasons).toContain('maker_checker');
    expect(evaluation.reasons).toContain('amount_threshold_exceeded');
    expect(evaluation.reasons).toContain('delta_threshold_exceeded');
  });

  it('blocks self-approval and requires enough approvers', () => {
    const policy = policies[1];

    expect(approvalSatisfied(policy, 'user_maker', ['user_maker'])).toBe(false);
    expect(approvalSatisfied(policy, 'user_maker', ['user_reviewer_1'])).toBe(false);
    expect(
      approvalSatisfied(policy, 'user_maker', ['user_reviewer_1', 'user_reviewer_2']),
    ).toBe(true);
  });
});