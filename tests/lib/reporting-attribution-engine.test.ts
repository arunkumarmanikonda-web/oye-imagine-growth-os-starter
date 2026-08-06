import { describe, expect, it } from 'vitest';
import {
  attributionSummaryHasDisclosure,
  attributionSummaryReady,
  buildAttributionSummary,
} from '../../src/lib/reporting/attribution-engine';

describe('reporting attribution engine', () => {
  it('builds first-touch attribution with disclosure', () => {
    const summary = buildAttributionSummary({
      model: 'first_touch',
      periodLabel: '2026-08',
      touchpoints: 120,
      conversions: 40,
      revenue: 80000,
      confidence: 'medium',
      freshnessHours: 4,
      limitations: ['cross-device journeys may be under-attributed'],
    });

    expect(summary.model).toBe('first_touch');
    expect(summary.attributedRevenue).toBeGreaterThan(0);
    expect(attributionSummaryReady(summary)).toBe(true);
    expect(attributionSummaryHasDisclosure(summary)).toBe(true);
  });

  it('marks custom attribution not ready without touchpoints or disclosures', () => {
    const summary = buildAttributionSummary({
      model: 'custom',
      periodLabel: '2026-08',
      touchpoints: 0,
      conversions: 0,
      revenue: 0,
      confidence: 'low',
      freshnessHours: 72,
      limitations: [],
    });

    expect(attributionSummaryReady(summary)).toBe(false);
    expect(attributionSummaryHasDisclosure(summary)).toBe(false);
  });
});