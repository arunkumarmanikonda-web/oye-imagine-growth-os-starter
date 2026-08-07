import { describe, expect, it } from 'vitest';
import {
  buildSpecialistReadinessSummary,
  marketplaceEntryAllowed,
  specialistReady,
} from '../../src/lib/marketplace/specialist-readiness';

describe('specialist-readiness', () => {
  it('marks a specialist ready when onboarding, verification and readiness checks all pass', () => {
    const summary = buildSpecialistReadinessSummary({
      profileComplete: true,
      skillsProvided: true,
      portfolioVerified: true,
      pricingConfigured: true,
      serviceCategoriesSelected: true,
      availabilitySet: true,
      identityVerified: true,
      complianceCleared: true,
    });

    expect(summary.status).toBe('ready');
    expect(specialistReady(summary)).toBe(true);
    expect(marketplaceEntryAllowed(summary)).toBe(true);
  });

  it('marks a specialist partial when some marketplace readiness checks are missing', () => {
    const summary = buildSpecialistReadinessSummary({
      profileComplete: true,
      skillsProvided: true,
      portfolioVerified: false,
      pricingConfigured: false,
      serviceCategoriesSelected: true,
      availabilitySet: true,
      identityVerified: true,
      complianceCleared: true,
    });

    expect(summary.status).toBe('partial');
    expect(summary.blockers).toContain('portfolio not verified');
    expect(summary.blockers).toContain('pricing not configured');
    expect(marketplaceEntryAllowed(summary)).toBe(false);
  });

  it('marks a specialist blocked when verification and compliance are not complete', () => {
    const summary = buildSpecialistReadinessSummary({
      profileComplete: false,
      skillsProvided: false,
      portfolioVerified: false,
      pricingConfigured: false,
      serviceCategoriesSelected: false,
      availabilitySet: false,
      identityVerified: false,
      complianceCleared: false,
    });

    expect(summary.status).toBe('blocked');
    expect(summary.blockers).toContain('identity not verified');
    expect(summary.blockers).toContain('compliance not cleared');
    expect(specialistReady(summary)).toBe(false);
  });
});