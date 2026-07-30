import type { HealthCheck, HealthSeverity, HealthStatus, HealthSummary } from './ops-types';

const STATUS_SCORE: Record<HealthStatus, number> = {
  healthy: 0,
  degraded: 1,
  down: 2,
};

const SEVERITY_SCORE: Record<HealthSeverity, number> = {
  info: 0,
  warning: 1,
  critical: 2,
};

export function summarizeHealthChecks(checks: HealthCheck[]): HealthSummary {
  const affectedComponents = [...new Set(checks.map((item) => item.component))];
  const criticalCount = checks.filter((item) => item.severity === 'critical').length;
  const warningCount = checks.filter((item) => item.severity === 'warning').length;

  const overallStatus = checks.reduce<HealthStatus>((current, item) => {
    return STATUS_SCORE[item.status] > STATUS_SCORE[current] ? item.status : current;
  }, 'healthy');

  return {
    overallStatus,
    incidentCount: checks.length,
    criticalCount,
    warningCount,
    affectedComponents,
  };
}

export function sortHealthChecks(checks: HealthCheck[]): HealthCheck[] {
  return [...checks].sort((left, right) => {
    const severityDelta = SEVERITY_SCORE[right.severity] - SEVERITY_SCORE[left.severity];
    if (severityDelta !== 0) {
      return severityDelta;
    }

    return right.detectedAt.localeCompare(left.detectedAt);
  });
}