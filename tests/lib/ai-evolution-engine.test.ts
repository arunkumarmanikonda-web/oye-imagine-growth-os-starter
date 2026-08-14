import { describe, expect, it } from 'vitest';
import {
  autonomyPolicyFor,
  decideLearningPromotion,
  eventCanContributeToPlatformLearning,
  normalizeEvolutionEvent,
  scoreEvolutionOutcome,
} from '../../src/lib/ai/evolution-engine';

describe('Oye AI Evolution Engine', () => {
  it('forces personal or secret-bearing activity to remain tenant private', () => {
    const event = normalizeEvolutionEvent(
      {
        tenantId: 'tenant-a',
        workspaceId: 'workspace-a',
        activityType: 'prompt_executed',
        sourceEntityType: 'creative',
        sourceEntityId: 'creative-1',
        reuseScope: 'platform_anonymized',
        containsPersonalData: true,
        sensitivity: 'personal',
      },
      new Date('2026-08-14T12:00:00.000Z'),
    );

    expect(event.reuseScope).toBe('tenant_private');
    expect(eventCanContributeToPlatformLearning(event)).toBe(false);
  });

  it('allows privacy-safe anonymized evidence to contribute to platform learning', () => {
    const event = normalizeEvolutionEvent(
      {
        tenantId: 'tenant-a',
        workspaceId: 'workspace-a',
        activityType: 'creative_generated',
        sourceEntityType: 'creative',
        sourceEntityId: 'creative-2',
        reuseScope: 'platform_anonymized',
        sensitivity: 'internal',
      },
      new Date('2026-08-14T12:00:00.000Z'),
    );

    expect(eventCanContributeToPlatformLearning(event)).toBe(true);
  });

  it('promotes only well-evidenced cross-client patterns', () => {
    const decision = decideLearningPromotion({
      patternKey: 'short-video-hook-product-proof',
      title: 'Short hook plus product proof',
      summary: 'A reusable structural creative pattern.',
      evidenceEventIds: Array.from({ length: 12 }, (_, index) => `event-${index}`),
      distinctTenantCount: 4,
      sampleCount: 12,
      confidence: 0.92,
      outcomeLift: 0.18,
      reuseScope: 'platform_anonymized',
      sensitivity: 'internal',
      riskClass: 'low',
    });

    expect(decision.decision).toBe('promote');
    expect(decision.destination).toBe('platform_pattern_library');
    expect(decision.autonomous).toBe(true);
  });

  it('does not promote a one-client pattern into platform intelligence', () => {
    const decision = decideLearningPromotion({
      patternKey: 'one-client-result',
      title: 'One client result',
      summary: 'Insufficient cross-client evidence.',
      evidenceEventIds: ['event-1', 'event-2'],
      distinctTenantCount: 1,
      sampleCount: 2,
      confidence: 0.95,
      outcomeLift: 0.4,
      reuseScope: 'platform_anonymized',
      sensitivity: 'internal',
      riskClass: 'low',
    });

    expect(decision.decision).toBe('observe');
    expect(decision.destination).toBe('none');
  });

  it('keeps budget ceilings, legal, security, code and schema outside zero-human promotion', () => {
    expect(autonomyPolicyFor('change_budget_cap').allowedWithoutHuman).toBe(false);
    expect(autonomyPolicyFor('change_legal_template').allowedWithoutHuman).toBe(false);
    expect(autonomyPolicyFor('change_security_guardrail').allowedWithoutHuman).toBe(false);
    expect(autonomyPolicyFor('deploy_code').allowedWithoutHuman).toBe(false);
    expect(autonomyPolicyFor('run_schema_migration').allowedWithoutHuman).toBe(false);
  });

  it('allows reversible growth optimization inside preapproved envelopes', () => {
    expect(autonomyPolicyFor('regenerate_creative').allowedWithoutHuman).toBe(true);
    expect(autonomyPolicyFor('adjust_keyword_bid_within_cap').allowedWithoutHuman).toBe(true);
    expect(autonomyPolicyFor('pause_underperforming_asset').allowedWithoutHuman).toBe(true);
  });

  it('scores outcome evidence instead of treating generation volume as learning', () => {
    const score = scoreEvolutionOutcome([
      { key: 'ctr', value: 0.08 },
      { key: 'cvr', value: 0.06 },
      { key: 'roas', value: 5 },
    ]);
    expect(score).not.toBeNull();
    expect(score!).toBeGreaterThan(0.5);
  });
});
