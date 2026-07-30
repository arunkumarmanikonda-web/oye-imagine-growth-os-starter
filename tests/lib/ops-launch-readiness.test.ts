import { describe, expect, it } from 'vitest';
import {
  launchReadyForProduction,
  summarizeLaunchReadiness,
} from '../../src/lib/ops/launch-readiness';

describe('ops launch readiness', () => {
  it('detects blocking checks when fail or pending exist', () => {
    const summary = summarizeLaunchReadiness([
      { category: 'security', checkName: 'rbac review', status: 'pass' },
      { category: 'compliance', checkName: 'dpdp controls', status: 'pending' },
      { category: 'operations', checkName: 'backup restore test', status: 'fail' },
    ]);

    expect(summary.ready).toBe(false);
    expect(summary.failCount).toBe(1);
    expect(summary.pendingCount).toBe(1);
    expect(summary.blockingChecks).toContain('operations: backup restore test');
  });

  it('marks production ready when all blocking checks pass', () => {
    const summary = summarizeLaunchReadiness([
      { category: 'security', checkName: 'rbac review', status: 'pass' },
      { category: 'compliance', checkName: 'dpdp controls', status: 'pass' },
      { category: 'operations', checkName: 'backup restore test', status: 'waived' },
    ]);

    expect(launchReadyForProduction(summary)).toBe(true);
  });
});