import { describe, expect, it } from 'vitest';
import {
  createOnboardingIntakeDraft,
  deriveBrandSlug,
  normalizeWebsiteUrl,
  summarizeOnboardingProgress,
} from '../../src/lib/pilot/onboarding-service';

describe('pilot onboarding service', () => {
  it('normalizes website urls', () => {
    expect(normalizeWebsiteUrl('neejee.com')).toBe('https://neejee.com');
    expect(normalizeWebsiteUrl('https://neejee.com')).toBe('https://neejee.com');
    expect(normalizeWebsiteUrl('')).toBeNull();
  });

  it('derives brand slugs', () => {
    expect(deriveBrandSlug('Neejee Craft Collective')).toBe('neejee-craft-collective');
  });

  it('creates onboarding drafts with computed completion', () => {
    const intake = createOnboardingIntakeDraft({
      intakeId: 'intake_1',
      tenantId: 'tenant_1',
      companyName: 'Neejee',
      legalName: 'Neejee Private Limited',
      websiteUrl: 'neejee.com',
      industry: 'Jewellery',
      countriesServed: ['IN'],
      servicesRequested: ['brand_strategy', 'seo', 'google_ads'],
    });

    expect(intake.websiteUrl).toBe('https://neejee.com');
    expect(intake.completionPercent).toBe(100);
    expect(intake.status).toBe('draft');
  });

  it('reports missing onboarding fields', () => {
    const progress = summarizeOnboardingProgress({
      companyName: 'Neejee',
      legalName: null,
      websiteUrl: null,
      industry: null,
      countriesServed: [],
      servicesRequested: [],
    });

    expect(progress.readyForReview).toBe(false);
    expect(progress.missingFields).toContain('legalName');
    expect(progress.missingFields).toContain('servicesRequested');
  });
});