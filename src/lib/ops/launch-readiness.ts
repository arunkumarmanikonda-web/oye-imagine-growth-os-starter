import type {
  LaunchReadinessCheck,
  LaunchReadinessSummary,
  ReadinessStatus,
} from './ops-types';

const BLOCKING_STATUSES: ReadinessStatus[] = ['fail', 'pending'];

export function summarizeLaunchReadiness(
  checks: LaunchReadinessCheck[],
): LaunchReadinessSummary {
  const passCount = checks.filter((item) => item.status === 'pass').length;
  const failCount = checks.filter((item) => item.status === 'fail').length;
  const pendingCount = checks.filter((item) => item.status === 'pending').length;
  const waivedCount = checks.filter((item) => item.status === 'waived').length;

  const blockingChecks = Array.from(
    new Set(
      checks
        .filter((item) => BLOCKING_STATUSES.includes(item.status))
        .map((item) => `${item.category}: ${item.checkName}`),
    ),
  );

  return {
    ready: failCount === 0 && pendingCount === 0,
    passCount,
    failCount,
    pendingCount,
    waivedCount,
    blockingChecks,
  };
}

export function launchReadyForProduction(summary: LaunchReadinessSummary): boolean {
  return summary.ready && summary.blockingChecks.length === 0;
}
