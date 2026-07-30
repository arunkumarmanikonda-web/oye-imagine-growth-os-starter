import { describe, expect, it } from 'vitest';
import { buildAnalyticsKpiSummary } from '../../src/lib/reporting/kpi-engine';
import {
  buildPersonaDashboardSnapshot,
  personaDashboardReady,
} from '../../src/lib/reporting/dashboard-personas';

describe('reporting dashboard personas', () => {
  it('builds a client dashboard snapshot', () => {
    const summary = buildAnalyticsKpiSummary({
      periodLabel: '2026-07',
      spend: 10000,
      revenue: 45000,
      leads: 200,
      visitors: 5000,
      conversions: 150,
      orders: 90,
    });

    const snapshot = buildPersonaDashboardSnapshot({
      brandName: 'Neejee',
      persona: 'client',
      summary,
      recommendationCount: 2,
      blockerCount: 0,
      openApprovalCount: 1,
      activeIncidentCount: 0,
    });

    expect(snapshot.persona).toBe('client');
    expect(snapshot.cards.length).toBeGreaterThanOrEqual(5);
    expect(personaDashboardReady(snapshot)).toBe(true);
  });
});