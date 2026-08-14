import { describe, expect, it } from 'vitest';
import { actionMayAutoExecute, type ActionApprovalResolution } from '../../src/lib/approvals/action-approval-routing';
import { reportGenerationAllowed } from '../../src/lib/reporting/report-access-policy';

const campaignResolution: ActionApprovalResolution = {
  actionKey: 'campaign.launch',
  actionFamily: 'campaign',
  makerRoleKeys: ['digital_marketer'],
  approverRoleKeys: ['digital_marketer'],
  clientApprovalRequired: false,
  assignedPartnerRequired: true,
  minApprovers: 1,
  autoExecuteAfterApproval: true,
  autonomyEnvelopeRequired: true,
  assignedApprovers: [
    { userId: 'user-dm-1', roleKey: 'digital_marketer', responsibilityKey: 'campaign_signoff', isPrimary: true },
  ],
  readyForApproval: true,
  blockingReasons: [],
};

describe('approval and reporting policy', () => {
  it('executes a campaign only after the assigned role approval and autonomy envelope', () => {
    expect(actionMayAutoExecute({
      resolution: campaignResolution,
      approvalCount: 1,
      autonomyEnvelopeSatisfied: true,
    })).toBe(true);

    expect(actionMayAutoExecute({
      resolution: campaignResolution,
      approvalCount: 0,
      autonomyEnvelopeSatisfied: true,
    })).toBe(false);

    expect(actionMayAutoExecute({
      resolution: campaignResolution,
      approvalCount: 1,
      autonomyEnvelopeSatisfied: false,
    })).toBe(false);
  });

  it('allows client on-demand reporting only while commercially active and subscribed', () => {
    expect(reportGenerationAllowed({
      actorClass: 'client',
      activationState: 'active',
      subscriptionValid: true,
      entitled: true,
    })).toBe(true);

    expect(reportGenerationAllowed({
      actorClass: 'client',
      activationState: 'suspended',
      subscriptionValid: false,
      entitled: true,
    })).toBe(false);
  });

  it('keeps Super Admin operational reporting authority for the full lifecycle', () => {
    expect(reportGenerationAllowed({
      actorClass: 'platform_admin',
      activationState: 'cancelled',
      subscriptionValid: false,
      entitled: false,
    })).toBe(true);
  });
});
