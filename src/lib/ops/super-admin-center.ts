import type {
  SuperAdminSnapshot,
  SuperAdminSnapshotInput,
} from './ops-closeout-types';

export function buildSuperAdminOperationalSnapshot(
  input: SuperAdminSnapshotInput,
): SuperAdminSnapshot {
  const alerts: string[] = [];
  const actionItems: string[] = [];

  if (input.openIncidents > 0) {
    alerts.push(`${input.openIncidents} active incident(s)`);
    actionItems.push('Review incident queue and assign remediation owner');
  }

  if (input.degradedComponents > 0) {
    alerts.push(`${input.degradedComponents} degraded component(s)`);
    actionItems.push('Stabilize degraded platform components');
  }

  if (input.pendingLaunchChecks > 0) {
    alerts.push(`${input.pendingLaunchChecks} pending launch check(s)`);
    actionItems.push('Resolve launch blockers before release');
  }

  if (input.tenantsNearQuota > 0) {
    alerts.push(`${input.tenantsNearQuota} tenant(s) near quota`);
    actionItems.push('Review quota and usage guardrail posture');
  }

  if (input.failedPublicationJobs > 0) {
    alerts.push(`${input.failedPublicationJobs} failed publication job(s)`);
    actionItems.push('Retry or remediate failed publication jobs');
  }

  const overallHealth =
    input.openIncidents > 0 || input.failedPublicationJobs > 0
      ? 'critical'
      : input.degradedComponents > 0 || input.pendingLaunchChecks > 0 || input.tenantsNearQuota > 0
        ? 'degraded'
        : 'healthy';

  return {
    overallHealth,
    alerts,
    actionItems,
  };
}

export function superAdminNeedsAttention(
  snapshot: SuperAdminSnapshot,
): boolean {
  return snapshot.overallHealth !== 'healthy';
}