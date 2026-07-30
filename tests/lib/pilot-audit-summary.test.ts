import { describe, expect, it } from 'vitest';
import { summarizeWebsiteAudit } from '../../src/lib/pilot/audit-summary';

describe('pilot audit summary', () => {
  it('returns low severity for strong audit inputs', () => {
    const summary = summarizeWebsiteAudit({
      pagesCrawled: 40,
      brokenLinks: 0,
      duplicatePages: 0,
      missingMetaPages: 0,
      cwvStatus: 'good',
      trackingCoveragePercent: 100,
      conversionPathCount: 2,
    });

    expect(summary.severity).toBe('low');
    expect(summary.readinessScore).toBe(100);
  });

  it('returns high severity for weak audit inputs', () => {
    const summary = summarizeWebsiteAudit({
      pagesCrawled: 40,
      brokenLinks: 8,
      duplicatePages: 4,
      missingMetaPages: 12,
      cwvStatus: 'poor',
      trackingCoveragePercent: 45,
      conversionPathCount: 0,
    });

    expect(summary.severity).toBe('high');
    expect(summary.readinessScore).toBeLessThan(50);
    expect(summary.recommendations.length).toBeGreaterThan(0);
  });
});