import { describe, expect, it } from 'vitest';
import {
  buildDeploymentReadinessSummary,
  deploymentReadinessPassed,
} from '../../src/lib/activation/deployment-readiness';

describe('deployment-readiness', () => {
  it('passes when deployment and providers are ready', () => {
    const summary = buildDeploymentReadinessSummary({
      vercelDeploymentPassed: true,
      workspaceBrandingSmokePassed: true,
      validationPassed: true,
      requiredProviders: [
        {
          provider: 'google_ads',
          status: 'ready',
          blockers: [],
          readyChecks: ['credentials present'],
        },
      ],
    });

    expect(summary.overallStatus).toBe('ready');
    expect(deploymentReadinessPassed(summary)).toBe(true);
  });

  it('blocks when vercel fails and provider is not ready', () => {
    const summary = buildDeploymentReadinessSummary({
      vercelDeploymentPassed: false,
      workspaceBrandingSmokePassed: true,
      validationPassed: true,
      requiredProviders: [
        {
          provider: 'meta_marketing',
          status: 'partial',
          blockers: ['app review not approved'],
          readyChecks: ['credentials present'],
        },
      ],
    });

    expect(summary.overallStatus).toBe('blocked');
    expect(summary.blockers).toContain('vercel deployment failed');
    expect(summary.blockers).toContain('meta_marketing not ready');
  });
});