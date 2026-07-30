import { describe, expect, it } from 'vitest';
import {
  buildReportDeliveryCenterSummary,
  reportDeliveryCenterReady,
} from '../../src/lib/reporting/report-delivery-center';

describe('report-delivery-center', () => {
  it('marks delivery ready when recipients, artifacts, approvals, and schedule exist', () => {
    const summary = buildReportDeliveryCenterSummary({
      brandName: 'Neejee',
      recipients: ['ops@neejee.com', 'founder@neejee.com'],
      reportArtifacts: ['weekly.pdf', 'dashboard-link'],
      approvalsComplete: true,
      scheduleConfigured: true,
    });

    expect(summary.deliveryStatus).toBe('ready');
    expect(summary.recipientCount).toBe(2);
    expect(reportDeliveryCenterReady(summary)).toBe(true);
  });

  it('blocks delivery when approvals are incomplete', () => {
    const summary = buildReportDeliveryCenterSummary({
      brandName: 'Neejee',
      recipients: ['ops@neejee.com'],
      reportArtifacts: ['weekly.pdf'],
      approvalsComplete: false,
      scheduleConfigured: true,
    });

    expect(summary.deliveryStatus).toBe('blocked');
    expect(summary.blockers).toContain('approvals incomplete');
  });
});