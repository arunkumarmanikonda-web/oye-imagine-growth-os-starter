import { describe, expect, it } from 'vitest';
import {
  buildExperimentSummary,
  experimentSummaryReady,
  experimentSummarySupportsLearningLoop,
} from '../../src/lib/reporting/experimentation-engine';

describe('reporting experimentation engine', () => {
  it('builds an A/B experiment summary with learning-loop support', () => {
    const summary = buildExperimentSummary({
      experimentId: 'exp-001',
      tenantId: 'tenant_neejee',
      workspaceId: 'workspace_neejee_growth',
      experimentType: 'ab',
      surface: 'landing_page',
      hypothesis: 'Shorter CTA copy improves conversion rate',
      variants: ['control', 'variant_a'],
      primaryMetric: 'conversion_rate',
      outcome: 'win',
      confidence: 'high',
    });

    expect(summary.variantCount).toBe(2);
    expect(experimentSummaryReady(summary)).toBe(true);
    expect(experimentSummarySupportsLearningLoop(summary)).toBe(true);
  });
});