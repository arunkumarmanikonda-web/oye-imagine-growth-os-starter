export type DeploymentEnvironment = 'staging' | 'production';

export interface ReleaseGateInput {
  environment: DeploymentEnvironment;
  ciPassing: boolean;
  securityScanPassing: boolean;
  infrastructureAsCodeValidated: boolean;
  requiredApprovals: number;
  approvalsReceived: number;
  rollbackPlanReady: boolean;
  backupFreshnessHours: number;
  backupFreshnessSlaHours: number;
  disasterRecoveryDrillPassed: boolean;
  performanceBudgetP95Ms: number;
  measuredP95Ms: number;
  errorBudgetRemainingPercent: number;
  minimumErrorBudgetRemainingPercent: number;
  monthlyCostBudget: number;
  projectedMonthlyCost: number;
  observabilityCoveragePercent: number;
  minimumObservabilityCoveragePercent: number;
  traceCoveragePercent: number;
  minimumTraceCoveragePercent: number;
  alertRunbooksReady: boolean;
  changeWindowApproved: boolean;
}

export interface ReleaseDecision {
  approved: boolean;
  blockers: string[];
  warnings: string[];
  score: number;
  summary: string;
}

export interface TelemetryProfile {
  service: string;
  logs: boolean;
  metrics: boolean;
  traces: boolean;
  alerts: boolean;
  runbook: boolean;
}

export interface ObservabilityCoverage {
  serviceCount: number;
  logsCoveragePercent: number;
  metricsCoveragePercent: number;
  traceCoveragePercent: number;
  alertCoveragePercent: number;
  runbookCoveragePercent: number;
  overallCoveragePercent: number;
  missingByService: Record<string, string[]>;
  leastCoveredServices: string[];
}

export interface DisasterRecoveryReadinessInput {
  lastDrillPassed: boolean;
  crossRegionReplication: boolean;
  backupRestoreVerified: boolean;
  recoveryTimeObjectiveMinutes: number;
  measuredRecoveryTimeMinutes: number;
  recoveryPointObjectiveMinutes: number;
  measuredRecoveryPointMinutes: number;
  runbookVersion: string;
}

export interface DisasterRecoveryReadiness {
  ready: boolean;
  blockers: string[];
  warnings: string[];
  score: number;
  summary: string;
}

export type SpendTrend = 'up' | 'flat' | 'down';

export interface CostCenterSpend {
  costCenter: string;
  owner: string;
  budget: number;
  actual: number;
  trend: SpendTrend;
}

export interface CostGovernanceSnapshot {
  totalBudget: number;
  totalActual: number;
  variance: number;
  overBudgetCostCenters: string[];
  atRiskCostCenters: string[];
  healthy: boolean;
}

export type HardeningArea =
  | 'ci_cd'
  | 'release_gate'
  | 'iac'
  | 'observability'
  | 'backup_restore'
  | 'dr'
  | 'performance'
  | 'cost_governance';

export type HardeningStatus = 'implemented' | 'partial' | 'missing';
export type HardeningSeverity = 'low' | 'medium' | 'high';

export interface HardeningSignal {
  control: string;
  area: HardeningArea;
  status: HardeningStatus;
  severity: HardeningSeverity;
  evidence: string;
}

export interface OperationalHardeningPlan {
  implemented: string[];
  priorityNow: string[];
  backlog: string[];
  summary: string;
}

function percent(part: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.round((part / total) * 100);
}

export function evaluateReleaseReadiness(input: ReleaseGateInput): ReleaseDecision {
  const blockers: string[] = [];
  const warnings: string[] = [];
  let passedControls = 0;

  const registerControl = (ok: boolean, blockerMessage: string, warningMessage?: string) => {
    if (ok) {
      passedControls += 1;
      return;
    }

    if (input.environment === 'production' || !warningMessage) {
      blockers.push(blockerMessage);
      return;
    }

    warnings.push(warningMessage);
  };

  registerControl(input.ciPassing, 'CI checks are failing', 'CI checks are failing');
  registerControl(input.securityScanPassing, 'Security scan gate failed', 'Security scan gate failed');
  registerControl(input.infrastructureAsCodeValidated, 'Infrastructure as code validation missing', 'Infrastructure as code validation missing');
  registerControl(
    input.approvalsReceived >= input.requiredApprovals,
    `Required approvals missing (${input.approvalsReceived}/${input.requiredApprovals})`,
    `Approvals below target (${input.approvalsReceived}/${input.requiredApprovals})`
  );
  registerControl(input.rollbackPlanReady, 'Rollback plan is not ready', 'Rollback plan is not ready');
  registerControl(
    input.backupFreshnessHours <= input.backupFreshnessSlaHours,
    `Backups are stale (${input.backupFreshnessHours}h > ${input.backupFreshnessSlaHours}h SLA)`,
    `Backups are stale (${input.backupFreshnessHours}h > ${input.backupFreshnessSlaHours}h SLA)`
  );
  registerControl(input.disasterRecoveryDrillPassed, 'Disaster recovery drill has not passed', 'Disaster recovery drill has not passed');
  registerControl(
    input.measuredP95Ms <= input.performanceBudgetP95Ms,
    `Performance budget exceeded (${input.measuredP95Ms}ms > ${input.performanceBudgetP95Ms}ms)`,
    `Performance budget exceeded (${input.measuredP95Ms}ms > ${input.performanceBudgetP95Ms}ms)`
  );
  registerControl(
    input.errorBudgetRemainingPercent >= input.minimumErrorBudgetRemainingPercent,
    `Error budget below threshold (${input.errorBudgetRemainingPercent}% < ${input.minimumErrorBudgetRemainingPercent}%)`,
    `Error budget below threshold (${input.errorBudgetRemainingPercent}% < ${input.minimumErrorBudgetRemainingPercent}%)`
  );
  registerControl(
    input.projectedMonthlyCost <= input.monthlyCostBudget,
    `Projected monthly cost exceeds budget (${input.projectedMonthlyCost} > ${input.monthlyCostBudget})`,
    `Projected monthly cost exceeds budget (${input.projectedMonthlyCost} > ${input.monthlyCostBudget})`
  );
  registerControl(
    input.observabilityCoveragePercent >= input.minimumObservabilityCoveragePercent,
    `Observability coverage below threshold (${input.observabilityCoveragePercent}% < ${input.minimumObservabilityCoveragePercent}%)`,
    `Observability coverage below threshold (${input.observabilityCoveragePercent}% < ${input.minimumObservabilityCoveragePercent}%)`
  );
  registerControl(
    input.traceCoveragePercent >= input.minimumTraceCoveragePercent,
    `Trace coverage below threshold (${input.traceCoveragePercent}% < ${input.minimumTraceCoveragePercent}%)`,
    `Trace coverage below threshold (${input.traceCoveragePercent}% < ${input.minimumTraceCoveragePercent}%)`
  );
  registerControl(input.alertRunbooksReady, 'Alert runbooks are not ready', 'Alert runbooks are not ready');
  registerControl(input.changeWindowApproved, 'Change window is not approved', 'Change window is not approved');

  const totalControls = 14;
  const score = percent(passedControls, totalControls);
  const approved = blockers.length === 0;
  const summary = approved
    ? `Release approved for ${input.environment}; ${score}% of controls passed with ${warnings.length} warning(s).`
    : `Release blocked for ${input.environment}; ${blockers.length} blocker(s) and ${warnings.length} warning(s).`;

  return {
    approved,
    blockers,
    warnings,
    score,
    summary
  };
}

export function buildObservabilityCoverage(profiles: TelemetryProfile[]): ObservabilityCoverage {
  const serviceCount = profiles.length;
  const missingByService: Record<string, string[]> = {};

  let logs = 0;
  let metrics = 0;
  let traces = 0;
  let alerts = 0;
  let runbooks = 0;

  for (const profile of profiles) {
    const missing: string[] = [];

    if (profile.logs) logs += 1; else missing.push('logs');
    if (profile.metrics) metrics += 1; else missing.push('metrics');
    if (profile.traces) traces += 1; else missing.push('traces');
    if (profile.alerts) alerts += 1; else missing.push('alerts');
    if (profile.runbook) runbooks += 1; else missing.push('runbook');

    if (missing.length > 0) {
      missingByService[profile.service] = missing;
    }
  }

  const logsCoveragePercent = percent(logs, serviceCount);
  const metricsCoveragePercent = percent(metrics, serviceCount);
  const traceCoveragePercent = percent(traces, serviceCount);
  const alertCoveragePercent = percent(alerts, serviceCount);
  const runbookCoveragePercent = percent(runbooks, serviceCount);
  const overallCoveragePercent = Math.round(
    (logsCoveragePercent + metricsCoveragePercent + traceCoveragePercent + alertCoveragePercent + runbookCoveragePercent) / 5
  );

  const leastCoveredServices = Object.keys(missingByService).sort(
    (a, b) => missingByService[b].length - missingByService[a].length
  );

  return {
    serviceCount,
    logsCoveragePercent,
    metricsCoveragePercent,
    traceCoveragePercent,
    alertCoveragePercent,
    runbookCoveragePercent,
    overallCoveragePercent,
    missingByService,
    leastCoveredServices
  };
}

export function summarizeDisasterRecoveryReadiness(
  input: DisasterRecoveryReadinessInput
): DisasterRecoveryReadiness {
  const blockers: string[] = [];
  const warnings: string[] = [];
  let passedControls = 0;

  const register = (ok: boolean, message: string) => {
    if (ok) {
      passedControls += 1;
    } else {
      blockers.push(message);
    }
  };

  register(input.lastDrillPassed, 'Latest disaster recovery drill did not pass');
  register(input.crossRegionReplication, 'Cross-region replication is not enabled');
  register(input.backupRestoreVerified, 'Backup restore has not been verified');
  register(
    input.measuredRecoveryTimeMinutes <= input.recoveryTimeObjectiveMinutes,
    `Recovery time objective missed (${input.measuredRecoveryTimeMinutes}m > ${input.recoveryTimeObjectiveMinutes}m)`
  );
  register(
    input.measuredRecoveryPointMinutes <= input.recoveryPointObjectiveMinutes,
    `Recovery point objective missed (${input.measuredRecoveryPointMinutes}m > ${input.recoveryPointObjectiveMinutes}m)`
  );

  if (!input.runbookVersion || input.runbookVersion.trim().length === 0) {
    warnings.push('Runbook version is missing');
  }

  const score = percent(passedControls, 5);
  const ready = blockers.length === 0;
  const summary = ready
    ? `DR readiness acceptable with score ${score}%.`
    : `DR readiness blocked with ${blockers.length} blocker(s).`;

  return {
    ready,
    blockers,
    warnings,
    score,
    summary
  };
}

export function buildCostGovernanceSnapshot(spend: CostCenterSpend[]): CostGovernanceSnapshot {
  const totalBudget = spend.reduce((sum, item) => sum + item.budget, 0);
  const totalActual = spend.reduce((sum, item) => sum + item.actual, 0);
  const variance = totalActual - totalBudget;

  const overBudgetCostCenters = spend
    .filter((item) => item.actual > item.budget)
    .map((item) => item.costCenter);

  const atRiskCostCenters = spend
    .filter((item) => item.actual >= item.budget * 0.9 || item.trend === 'up')
    .map((item) => item.costCenter);

  return {
    totalBudget,
    totalActual,
    variance,
    overBudgetCostCenters,
    atRiskCostCenters,
    healthy: overBudgetCostCenters.length === 0
  };
}

export function createOperationalHardeningPlan(signals: HardeningSignal[]): OperationalHardeningPlan {
  const implemented = signals
    .filter((signal) => signal.status === 'implemented')
    .map((signal) => `${signal.area}: ${signal.control}`);

  const priorityNow = signals
    .filter((signal) => signal.status !== 'implemented' && signal.severity === 'high')
    .map((signal) => `${signal.area}: ${signal.control}`);

  const backlog = signals
    .filter((signal) => signal.status !== 'implemented' && signal.severity !== 'high')
    .map((signal) => `${signal.area}: ${signal.control}`);

  const summary = `Implemented ${implemented.length} controls, prioritize ${priorityNow.length}, backlog ${backlog.length}.`;

  return {
    implemented,
    priorityNow,
    backlog,
    summary
  };
}