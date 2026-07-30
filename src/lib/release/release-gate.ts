import type { ReleaseGateInput, ReleaseGateSummary } from './release-types';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function buildReleaseGateSummary(input: ReleaseGateInput): ReleaseGateSummary {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (input.validationSuitesPassed <= 0) {
    blockers.push('no validation suites executed');
  }

  if (input.validationSuitesFailed > 0) {
    blockers.push(`validation failures detected: ${input.validationSuitesFailed}`);
  }

  if (input.health.overallStatus === 'down') {
    blockers.push('critical platform component is down');
  } else if (input.health.overallStatus === 'degraded') {
    warnings.push('one or more platform components are degraded');
  }

  if (input.health.criticalCount > 0) {
    blockers.push(`critical health incidents open: ${input.health.criticalCount}`);
  }

  if (!input.launch.ready) {
    blockers.push('launch readiness checks are not complete');
  }

  if (input.launch.blockingChecks.length > 0) {
    blockers.push(...input.launch.blockingChecks.map((item) => `blocking check: ${item}`));
  }

  const hardCaps = input.usage.filter((item) => item.enforcementAction === 'hard_cap').length;
  const softCaps = input.usage.filter((item) => item.enforcementAction === 'soft_cap').length;
  const notifyCaps = input.usage.filter((item) => item.enforcementAction === 'notify').length;

  if (hardCaps > 0) {
    blockers.push(`hard usage caps active: ${hardCaps}`);
  }

  if (softCaps > 0) {
    warnings.push(`soft usage caps active: ${softCaps}`);
  }

  if (notifyCaps > 0) {
    warnings.push(`usage nearing quota for ${notifyCaps} scope(s)`);
  }

  const score = clamp(100 - (blockers.length * 20) - (warnings.length * 5), 0, 100);
  const ready = blockers.length === 0
  return {
    decision: ready ? 'go' : 'hold',
    ready,
    blockers,
    warnings,
    score,
  };
}

export function releaseGateReady(summary: ReleaseGateSummary): boolean {
  return summary.ready && summary.decision === 'go' && summary.blockers.length === 0;
}