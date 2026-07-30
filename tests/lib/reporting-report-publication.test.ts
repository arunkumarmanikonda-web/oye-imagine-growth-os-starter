import { describe, expect, it } from 'vitest';
import {
  buildReportPublicationPlan,
  reportPublicationReady,
} from '../../src/lib/reporting/report-publication';

describe('reporting report publication', () => {
  it('creates ready publication jobs when approved', () => {
    const plan = buildReportPublicationPlan({
      reportName: 'Neejee July 2026 Performance',
      audience: 'client',
      formats: ['web', 'pdf', 'pptx'],
      approvalStatus: 'approved',
      includesFinancialData: true,
    });

    expect(plan.ready).toBe(true);
    expect(plan.jobs).toHaveLength(3);
    expect(reportPublicationReady(plan)).toBe(true);
  });

  it('requires approval when the report is not approved', () => {
    const plan = buildReportPublicationPlan({
      reportName: 'Neejee July 2026 Performance',
      audience: 'client',
      formats: ['pdf'],
      approvalStatus: 'draft',
      includesFinancialData: true,
    });

    expect(plan.ready).toBe(false);
    expect(plan.blockedReasons.length).toBeGreaterThan(0);
  });
});