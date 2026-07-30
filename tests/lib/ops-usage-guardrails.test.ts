import { describe, expect, it } from 'vitest';
import { assessUsageSnapshot, usageNeedsAttention } from '../../src/lib/ops/usage-guardrails';

describe('ops usage guardrails', () => {
  it('flags hard cap when ai cost exceeds quota', () => {
    const assessment = assessUsageSnapshot({
      tenantId: 'tenant_neejee',
      snapshotPeriod: '2026-07',
      aiTokensUsed: 250000,
      aiCostAmount: 1250,
      contentItemsGenerated: 90,
      campaignsExported: 8,
      reportsGenerated: 6,
      quotaLimit: {
        aiCostAmount: 1000,
        contentItemsGenerated: 100,
        campaignsExported: 10,
        reportsGenerated: 10,
      },
    });

    expect(assessment.overageFlags).toContain('ai_cost_limit_exceeded');
    expect(assessment.enforcementAction).toBe('hard_cap');
    expect(usageNeedsAttention(assessment)).toBe(true);
  });

  it('flags notify near quota without overage', () => {
    const assessment = assessUsageSnapshot({
      tenantId: 'tenant_neejee',
      snapshotPeriod: '2026-07',
      aiTokensUsed: 180000,
      aiCostAmount: 850,
      contentItemsGenerated: 70,
      campaignsExported: 8,
      reportsGenerated: 6,
      quotaLimit: {
        aiCostAmount: 1000,
        contentItemsGenerated: 100,
        campaignsExported: 10,
        reportsGenerated: 10,
      },
    });

    expect(assessment.overageFlags).toHaveLength(0);
    expect(assessment.enforcementAction).toBe('notify');
  });
});