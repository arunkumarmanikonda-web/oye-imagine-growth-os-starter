import { describe, expect, it } from 'vitest';
import { buildPersonaDashboardSnapshot, personaDashboardSupportsDecisionTruth } from '../../src/lib/reporting/dashboard-personas';
import { buildAnalyticsKpiSummary } from '../../src/lib/reporting/kpi-engine';
import {
  buildLaunchReadinessDashboardSummary,
  launchReadinessDashboardSupportsDecisionTruth,
} from '../../src/lib/reporting/launch-readiness-dashboard';

describe('reporting dashboard truth', () => {
  it('supports decision truth for persona dashboards', () => {
    const summary = buildAnalyticsKpiSummary({
      periodLabel: '2026-08',
      spend: 20000,
      revenue: 90000,
      leads: 300,
      visitors: 7000,
      conversions: 240,
      orders: 120,
    });

    const snapshot = buildPersonaDashboardSnapshot({
      brandName: 'Neejee',
      persona: 'exec',
      summary,
      recommendationCount: 3,
      blockerCount: 1,
      openApprovalCount: 1,
      activeIncidentCount: 0,
    });

    expect(personaDashboardSupportsDecisionTruth(snapshot)).toBe(true);
  });

  it('supports executive decision truth for launch readiness', () => {
    const summary = buildLaunchReadinessDashboardSummary({
      brandName: 'Neejee',
      validationPassed: true,
      securityReviewPassed: true,
      performanceReviewPassed: true,
      monitoringReady: true,
      supportReady: true,
      openCriticalDependencies: [],
    });

    expect(launchReadinessDashboardSupportsDecisionTruth(summary)).toBe(true);
  });
});