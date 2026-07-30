import { describe, expect, it } from 'vitest';
import {
  buildLaunchReadinessDashboardSummary,
  launchReadinessDashboardReady,
} from '../../src/lib/reporting/launch-readiness-dashboard';

describe('launch-readiness-dashboard', () => {
  it('marks dashboard ready when all gates pass', () => {
    const summary = buildLaunchReadinessDashboardSummary({
      brandName: 'Neejee',
      validationPassed: true,
      securityReviewPassed: true,
      performanceReviewPassed: true,
      monitoringReady: true,
      supportReady: true,
      openCriticalDependencies: [],
    });

    expect(summary.overallStatus).toBe('ready');
    expect(summary.riskLevel).toBe('low');
    expect(launchReadinessDashboardReady(summary)).toBe(true);
  });

  it('marks dashboard blocked when critical dependencies remain', () => {
    const summary = buildLaunchReadinessDashboardSummary({
      brandName: 'Neejee',
      validationPassed: true,
      securityReviewPassed: true,
      performanceReviewPassed: true,
      monitoringReady: true,
      supportReady: false,
      openCriticalDependencies: ['payment gateway approval'],
    });

    expect(summary.overallStatus).toBe('blocked');
    expect(summary.riskLevel).toBe('high');
    expect(summary.blockerCount).toBeGreaterThan(0);
  });
});