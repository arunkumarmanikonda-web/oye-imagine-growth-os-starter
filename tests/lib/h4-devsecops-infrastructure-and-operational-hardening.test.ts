import { describe, expect, it } from 'vitest';
import {
  buildCostGovernanceSnapshot,
  buildObservabilityCoverage,
  createOperationalHardeningPlan,
  evaluateReleaseReadiness,
  summarizeDisasterRecoveryReadiness
} from '../../src/lib/platform/h4-devsecops-infrastructure-and-operational-hardening';

describe('evaluateReleaseReadiness', () => {
  it('approves a production release when all gates pass', () => {
    const result = evaluateReleaseReadiness({
      environment: 'production',
      ciPassing: true,
      securityScanPassing: true,
      infrastructureAsCodeValidated: true,
      requiredApprovals: 2,
      approvalsReceived: 2,
      rollbackPlanReady: true,
      backupFreshnessHours: 2,
      backupFreshnessSlaHours: 4,
      disasterRecoveryDrillPassed: true,
      performanceBudgetP95Ms: 500,
      measuredP95Ms: 420,
      errorBudgetRemainingPercent: 99.2,
      minimumErrorBudgetRemainingPercent: 95,
      monthlyCostBudget: 12000,
      projectedMonthlyCost: 11000,
      observabilityCoveragePercent: 96,
      minimumObservabilityCoveragePercent: 90,
      traceCoveragePercent: 92,
      minimumTraceCoveragePercent: 85,
      alertRunbooksReady: true,
      changeWindowApproved: true
    });

    expect(result.approved).toBe(true);
    expect(result.blockers).toHaveLength(0);
    expect(result.score).toBe(100);
  });

  it('blocks a production release when critical gates fail', () => {
    const result = evaluateReleaseReadiness({
      environment: 'production',
      ciPassing: false,
      securityScanPassing: true,
      infrastructureAsCodeValidated: false,
      requiredApprovals: 2,
      approvalsReceived: 1,
      rollbackPlanReady: false,
      backupFreshnessHours: 9,
      backupFreshnessSlaHours: 4,
      disasterRecoveryDrillPassed: false,
      performanceBudgetP95Ms: 500,
      measuredP95Ms: 700,
      errorBudgetRemainingPercent: 92,
      minimumErrorBudgetRemainingPercent: 95,
      monthlyCostBudget: 12000,
      projectedMonthlyCost: 14500,
      observabilityCoveragePercent: 82,
      minimumObservabilityCoveragePercent: 90,
      traceCoveragePercent: 70,
      minimumTraceCoveragePercent: 85,
      alertRunbooksReady: false,
      changeWindowApproved: false
    });

    expect(result.approved).toBe(false);
    expect(result.blockers).toContain('CI checks are failing');
    expect(result.blockers).toContain('Infrastructure as code validation missing');
    expect(result.blockers).toContain('Rollback plan is not ready');
    expect(result.blockers.length).toBeGreaterThanOrEqual(8);
  });
});

describe('buildObservabilityCoverage', () => {
  it('calculates service coverage and missing controls', () => {
    const coverage = buildObservabilityCoverage([
      { service: 'api', logs: true, metrics: true, traces: true, alerts: true, runbook: true },
      { service: 'worker', logs: true, metrics: true, traces: false, alerts: true, runbook: false },
      { service: 'web', logs: true, metrics: false, traces: false, alerts: false, runbook: true }
    ]);

    expect(coverage.serviceCount).toBe(3);
    expect(coverage.logsCoveragePercent).toBe(100);
    expect(coverage.traceCoveragePercent).toBe(33);
    expect(coverage.missingByService.worker).toContain('traces');
    expect(coverage.missingByService.web).toContain('alerts');
    expect(coverage.leastCoveredServices[0]).toBe('web');
  });
});

describe('summarizeDisasterRecoveryReadiness', () => {
  it('reports readiness when objectives are met', () => {
    const readiness = summarizeDisasterRecoveryReadiness({
      lastDrillPassed: true,
      crossRegionReplication: true,
      backupRestoreVerified: true,
      recoveryTimeObjectiveMinutes: 60,
      measuredRecoveryTimeMinutes: 42,
      recoveryPointObjectiveMinutes: 15,
      measuredRecoveryPointMinutes: 8,
      runbookVersion: '2026.08'
    });

    expect(readiness.ready).toBe(true);
    expect(readiness.blockers).toHaveLength(0);
    expect(readiness.score).toBe(100);
  });

  it('fails readiness when recovery objectives are missed', () => {
    const readiness = summarizeDisasterRecoveryReadiness({
      lastDrillPassed: false,
      crossRegionReplication: false,
      backupRestoreVerified: true,
      recoveryTimeObjectiveMinutes: 60,
      measuredRecoveryTimeMinutes: 95,
      recoveryPointObjectiveMinutes: 15,
      measuredRecoveryPointMinutes: 30,
      runbookVersion: ''
    });

    expect(readiness.ready).toBe(false);
    expect(readiness.blockers).toContain('Latest disaster recovery drill did not pass');
    expect(readiness.blockers).toContain('Cross-region replication is not enabled');
    expect(readiness.warnings).toContain('Runbook version is missing');
  });
});

describe('buildCostGovernanceSnapshot', () => {
  it('identifies over-budget and at-risk cost centers', () => {
    const snapshot = buildCostGovernanceSnapshot([
      { costCenter: 'core-platform', owner: 'platform', budget: 5000, actual: 4800, trend: 'flat' },
      { costCenter: 'observability', owner: 'sre', budget: 3000, actual: 3300, trend: 'up' },
      { costCenter: 'load-test', owner: 'qa', budget: 1200, actual: 1100, trend: 'up' }
    ]);

    expect(snapshot.totalBudget).toBe(9200);
    expect(snapshot.totalActual).toBe(9200);
    expect(snapshot.overBudgetCostCenters).toEqual(['observability']);
    expect(snapshot.atRiskCostCenters).toContain('observability');
    expect(snapshot.atRiskCostCenters).toContain('load-test');
    expect(snapshot.healthy).toBe(false);
  });
});

describe('createOperationalHardeningPlan', () => {
  it('groups controls into implemented, priority-now and backlog', () => {
    const plan = createOperationalHardeningPlan([
      { area: 'ci_cd', control: 'Signed builds', status: 'implemented', severity: 'medium', evidence: 'pipeline.yml' },
      { area: 'release_gate', control: 'Production approval gate', status: 'missing', severity: 'high', evidence: 'tracker' },
      { area: 'observability', control: 'Trace coverage threshold', status: 'partial', severity: 'high', evidence: 'dashboards' },
      { area: 'cost_governance', control: 'Budget anomaly review', status: 'partial', severity: 'medium', evidence: 'finops.md' }
    ]);

    expect(plan.implemented).toEqual(['ci_cd: Signed builds']);
    expect(plan.priorityNow).toContain('release_gate: Production approval gate');
    expect(plan.priorityNow).toContain('observability: Trace coverage threshold');
    expect(plan.backlog).toContain('cost_governance: Budget anomaly review');
  });
});