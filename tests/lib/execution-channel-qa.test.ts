import { describe, expect, it } from 'vitest';
import { evaluateChannelQa } from '../../src/lib/execution/channel-qa';

describe('execution channel qa', () => {
  it('passes when asset is approved, brand-locked, and has destination URL', () => {
    const result = evaluateChannelQa({
      brandName: 'Neejee',
      channel: 'meta_ads',
      assetType: 'campaign_draft',
      destinationUrl: 'https://www.neejee.com/bridal-consultation',
      approvalStatus: 'approved',
      brandLocked: true,
      claims: [],
      primaryCta: 'Book a consultation',
    });

    expect(result.passed).toBe(true);
    expect(result.blockers).toHaveLength(0);
  });

  it('blocks when approval and URL are missing', () => {
    const result = evaluateChannelQa({
      brandName: 'Neejee',
      channel: 'google_ads',
      assetType: 'campaign_draft',
      approvalStatus: 'draft',
      brandLocked: false,
      claims: ['100% confidence'],
    });

    expect(result.passed).toBe(false);
    expect(result.blockers.length).toBeGreaterThan(0);
    expect(result.warnings).toContain('claims require legal or substantiation review');
  });
});