import { describe, expect, it } from 'vitest';
import {
  buildLandingPagePublicationSummary,
  landingPageCanPublish,
} from '../../src/lib/execution/landing-page-publication';

describe('landing-page-publication', () => {
  it('marks landing page ready when QA and approval pass', () => {
    const summary = buildLandingPagePublicationSummary({
      brandName: 'Neejee',
      locale: 'en-IN',
      pageSlug: 'neejee-growth-audit',
      qaPassed: true,
      approvalRequired: true,
      approvalGranted: true,
      assetBundle: ['hero.png', 'copy.md'],
    });

    expect(summary.publicationStatus).toBe('ready');
    expect(summary.assetCount).toBe(2);
    expect(landingPageCanPublish(summary)).toBe(true);
  });

  it('blocks publication when approval is missing', () => {
    const summary = buildLandingPagePublicationSummary({
      brandName: 'Neejee',
      locale: 'en-IN',
      pageSlug: 'neejee-growth-audit',
      qaPassed: true,
      approvalRequired: true,
      approvalGranted: false,
      assetBundle: ['hero.png'],
    });

    expect(summary.publicationStatus).toBe('blocked');
    expect(summary.blockers).toContain('approval not granted');
  });
});