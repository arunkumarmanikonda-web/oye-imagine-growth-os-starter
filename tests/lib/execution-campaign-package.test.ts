import { describe, expect, it } from 'vitest';
import {
  buildCampaignPackageSummary,
  campaignPackageReady,
} from '../../src/lib/execution/campaign-package';

describe('campaign-package', () => {
  it('marks package ready when assets, copy, and targeting exist', () => {
    const summary = buildCampaignPackageSummary({
      brandName: 'Neejee',
      channel: 'google',
      objective: 'Lead generation',
      assets: ['headline.txt', 'image-1.png'],
      copyVariants: ['Variant A', 'Variant B'],
      targetingSummary: {
        audienceDefined: true,
        geoDefined: true,
        budgetDefined: true,
      },
    });

    expect(summary.packageStatus).toBe('ready');
    expect(campaignPackageReady(summary)).toBe(true);
  });

  it('marks package incomplete when targeting is missing', () => {
    const summary = buildCampaignPackageSummary({
      brandName: 'Neejee',
      channel: 'meta',
      objective: 'Leads',
      assets: ['creative.png'],
      copyVariants: ['Copy A'],
      targetingSummary: {
        audienceDefined: false,
        geoDefined: true,
        budgetDefined: false,
      },
    });

    expect(summary.packageStatus).toBe('incomplete');
    expect(summary.missingElements).toContain('audience');
    expect(summary.missingElements).toContain('budget');
  });
});