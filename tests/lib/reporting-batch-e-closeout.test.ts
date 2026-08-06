import { describe, expect, it } from 'vitest';
import {
  buildReportDeliveryCenterSummary,
  reportDeliveryCenterSupportsBatchEClosure,
} from '../../src/lib/reporting/report-delivery-center';
import {
  buildReportPublicationPlan,
  reportPublicationSupportsBatchEClosure,
} from '../../src/lib/reporting/report-publication';
import {
  attributionSummarySupportsBatchEClosure,
  buildAttributionSummary,
} from '../../src/lib/reporting/attribution-engine';
import {
  buildPersonaDashboardSnapshot,
  personaDashboardSupportsBatchEClosure,
} from '../../src/lib/reporting/dashboard-personas';
import {
  buildAnalyticsKpiSummary,
} from '../../src/lib/reporting/kpi-engine';
import {
  buildExperimentSummary,
  experimentSummarySupportsBatchEClosure,
} from '../../src/lib/reporting/experimentation-engine';
import {
  createInstitutionalLearningEntry,
  institutionalLearningLibrarySupportsBatchEClosure,
} from '../../src/lib/reporting/institutional-learning';

describe('reporting batch e closeout', () => {
  it('supports full batch e closure proof pack', () => {
    const delivery = buildReportDeliveryCenterSummary({
      brandName: 'Neejee',
      recipients: ['ops@neejee.com', 'growth@neejee.com'],
      reportArtifacts: ['weekly.pdf', 'exec.xlsx'],
      approvalsComplete: true,
      scheduleConfigured: true,
    });

    const publication = buildReportPublicationPlan({
      reportName: 'Neejee executive scorecard',
      audience: 'internal',
      formats: ['pdf', 'xlsx'],
      approvalStatus: 'approved',
      includesFinancialData: false,
    });

    const attribution = buildAttributionSummary({
      model: 'position_based',
      periodLabel: '2026-08',
      touchpoints: 140,
      conversions: 48,
      revenue: 92000,
      confidence: 'high',
      freshnessHours: 6,
      limitations: ['offline conversions refresh nightly'],
    });

    const kpi = buildAnalyticsKpiSummary({
      periodLabel: '2026-08',
      spend: 20000,
      revenue: 90000,
      leads: 300,
      visitors: 7000,
      conversions: 240,
      orders: 120,
    });

    const persona = buildPersonaDashboardSnapshot({
      brandName: 'Neejee',
      persona: 'exec',
      summary: kpi,
      recommendationCount: 3,
      blockerCount: 1,
      openApprovalCount: 1,
      activeIncidentCount: 0,
    });

    const experiment = buildExperimentSummary({
      experimentId: 'exp-e8-001',
      tenantId: 'tenant_neejee',
      workspaceId: 'workspace_neejee_growth',
      experimentType: 'ab',
      surface: 'landing_page',
      hypothesis: 'Proof-pack CTA narrative improves report engagement',
      variants: ['control', 'variant_a'],
      primaryMetric: 'engagement_rate',
      outcome: 'win',
      confidence: 'high',
    });

    const learning = createInstitutionalLearningEntry({
      learningId: 'learn-e8-001',
      tenantId: 'tenant_neejee',
      workspaceId: 'workspace_neejee_growth',
      title: 'Executive scorecards need interpretation, not just charts',
      summary: 'Narrative plus action blocks improved stakeholder clarity.',
      evidenceRefs: ['weekly.pdf', 'exp-e8-001'],
      reusableTags: ['reporting', 'exec_dashboard'],
    });

    expect(reportDeliveryCenterSupportsBatchEClosure(delivery)).toBe(true);
    expect(reportPublicationSupportsBatchEClosure(publication)).toBe(true);
    expect(attributionSummarySupportsBatchEClosure(attribution)).toBe(true);
    expect(personaDashboardSupportsBatchEClosure(persona)).toBe(true);
    expect(experimentSummarySupportsBatchEClosure(experiment)).toBe(true);
    expect(institutionalLearningLibrarySupportsBatchEClosure([learning], 'tenant_neejee')).toBe(true);
  });
});