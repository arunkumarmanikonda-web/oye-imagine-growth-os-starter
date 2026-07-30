import type {
  LaunchReadinessDashboardInput,
  LaunchReadinessDashboardSummary,
} from './final-closeout-types';

export function buildLaunchReadinessDashboardSummary(
  input: LaunchReadinessDashboardInput,
): LaunchReadinessDashboardSummary {
  const blockers: string[] = [];

  if (!input.validationPassed) blockers.push('validation not passed');
  if (!input.securityReviewPassed) blockers.push('security review not passed');
  if (!input.performanceReviewPassed) blockers.push('performance review not passed');
  if (!input.monitoringReady) blockers.push('monitoring not ready');
  if (!input.supportReady) blockers.push('support not ready');

  blockers.push(...input.openCriticalDependencies.map((dep) => `critical dependency: ${dep}`));

  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (
    input.openCriticalDependencies.length > 0 ||
    !input.validationPassed ||
    !input.securityReviewPassed
  ) {
    riskLevel = 'high';
  } else if (
    !input.performanceReviewPassed ||
    !input.monitoringReady ||
    !input.supportReady
  ) {
    riskLevel = 'medium';
  }

  return {
    overallStatus: blockers.length === 0 ? 'ready' : 'blocked',
    blockerCount: blockers.length,
    riskLevel,
    nextAction:
      blockers.length === 0
        ? `${input.brandName}: ready for launch closeout`
        : `${input.brandName}: resolve launch readiness blockers`,
  };
}

export function launchReadinessDashboardReady(
  summary: LaunchReadinessDashboardSummary,
): boolean {
  return summary.overallStatus === 'ready' && summary.blockerCount === 0;
}