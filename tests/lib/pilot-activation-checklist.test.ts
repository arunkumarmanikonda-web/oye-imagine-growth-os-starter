import { describe, expect, it } from 'vitest';
import { buildActivationChecklist } from '../../src/lib/pilot/activation-checklist';
import type {
  BrandProfile,
  OnboardingIntakeDraft,
  StrategyArtifact,
} from '../../src/lib/pilot/onboarding-types';

describe('pilot activation checklist', () => {
  const intake: OnboardingIntakeDraft = {
    intakeId: 'intake_1',
    tenantId: 'tenant_1',
    companyName: 'Neejee',
    legalName: 'Neejee Private Limited',
    websiteUrl: 'https://neejee.com',
    industry: 'Jewellery',
    countriesServed: ['IN'],
    servicesRequested: ['brand_strategy', 'seo'],
    autonomyLevel: 1,
    billingCurrency: 'INR',
    status: 'draft',
    intakePayload: {},
    completionPercent: 100,
  };

  const brandProfile: BrandProfile = {
    profileId: 'profile_1',
    tenantId: 'tenant_1',
    brandId: 'brand_1',
    brandPurpose: 'Celebrate personal craft stories.',
    brandStory: 'Founder-led Indian craft brand.',
    valueProposition: 'Quiet luxury with provenance.',
    toneOfVoice: 'Warm and premium.',
    approvedTerms: ['craft', 'personal', 'found'],
    prohibitedTerms: [],
    audiencePersonas: ['premium shoppers'],
    productCategories: ['jewellery'],
    geographyNotes: [],
    complianceNotes: [],
    visualGuidelines: {},
    profileStatus: 'approved',
    readinessScore: 85,
    sourcePayload: {},
  };

  it('returns blocked when strategy is missing', () => {
    const summary = buildActivationChecklist({
      intake,
      brandProfile,
      strategyArtifact: null,
    });

    expect(summary.status).toBe('blocked');
    expect(summary.blockers).toContain('strategy_artifact_present');
  });

  it('returns ready when all required items are complete', () => {
    const strategyArtifact: StrategyArtifact = {
      artifactId: 'artifact_1',
      tenantId: 'tenant_1',
      brandId: 'brand_1',
      artifactType: 'strategy_deck',
      title: 'Neejee Strategy',
      status: 'approved',
      version: 1,
      summary: { thesis: 'premium founder-led growth' },
      sections: [{ title: 'Executive Summary' }],
      generatedBy: 'strategy-agent',
      approvedBy: 'user_approver',
    };

    const summary = buildActivationChecklist({
      intake,
      brandProfile,
      strategyArtifact,
    });

    expect(summary.status).toBe('ready');
    expect(summary.readinessPercent).toBe(100);
  });
});