import type {
  DeploymentReadinessInput,
  DeploymentReadinessSummary,
} from './activation-types';

export function buildDeploymentReadinessSummary(
  input: DeploymentReadinessInput,
): DeploymentReadinessSummary {
  const blockers: string[] = [];
  const failedSystems: string[] = [];

  if (!input.vercelDeploymentPassed) {
    failedSystems.push('vercel');
    blockers.push('vercel deployment failed');
  }

  if (!input.workspaceBrandingSmokePassed) {
    failedSystems.push('workspace-branding-smoke');
    blockers.push('workspace branding smoke failed');
  }

  if (!input.validationPassed) {
    failedSystems.push('validation');
    blockers.push('validation suite failed');
  }

  for (const provider of input.requiredProviders) {
    if (provider.status !== 'ready') {
      blockers.push(`${provider.provider} not ready`);
    }
  }

  return {
    overallStatus: blockers.length === 0 ? 'ready' : 'blocked',
    blockerCount: blockers.length,
    blockers,
    failedSystems,
  };
}

export function deploymentReadinessPassed(
  summary: DeploymentReadinessSummary,
): boolean {
  return summary.overallStatus === 'ready' && summary.blockerCount === 0;
}