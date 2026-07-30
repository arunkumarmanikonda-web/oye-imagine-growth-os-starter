import { describe, expect, it } from 'vitest';
import {
  buildDependencySignoffSummary,
  dependencySignoffClear,
} from '../../src/lib/ops/dependency-signoff';

describe('dependency-signoff', () => {
  it('clears signoff when all required dependencies are ready', () => {
    const summary = buildDependencySignoffSummary({
      brandName: 'Neejee',
      dependencies: [
        { name: 'payment gateway', required: true, status: 'ready' },
        { name: 'esign provider', required: true, status: 'ready' },
      ],
    });

    expect(summary.clearToLaunch).toBe(true);
    expect(dependencySignoffClear(summary)).toBe(true);
  });

  it('tracks unresolved and blocking dependencies', () => {
    const summary = buildDependencySignoffSummary({
      brandName: 'Neejee',
      dependencies: [
        { name: 'payment gateway', required: true, status: 'pending' },
        { name: 'esign provider', required: true, status: 'blocked' },
        { name: 'optional analytics', required: false, status: 'pending' },
      ],
    });

    expect(summary.clearToLaunch).toBe(false);
    expect(summary.unresolvedDependencies).toContain('payment gateway');
    expect(summary.blockingDependencies).toContain('esign provider');
  });
});