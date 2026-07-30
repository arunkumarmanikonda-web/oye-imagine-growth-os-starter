import { describe, expect, it } from 'vitest';
import {
  buildProofExecutionPackageSummary,
  proofPackageComplete,
} from '../../src/lib/execution/proof-of-execution-package';

describe('proof-of-execution-package', () => {
  it('marks proof package ready when all evidence exists', () => {
    const summary = buildProofExecutionPackageSummary({
      brandName: 'Neejee',
      channel: 'landing_page',
      includedAssets: ['hero.png', 'copy.md'],
      includedChecks: ['qa-pass', 'approval-pass'],
      destinationUrls: ['https://example.com/neejee-growth-audit'],
    });

    expect(summary.packageStatus).toBe('ready');
    expect(proofPackageComplete(summary)).toBe(true);
  });

  it('marks proof package incomplete when destinations are missing', () => {
    const summary = buildProofExecutionPackageSummary({
      brandName: 'Neejee',
      channel: 'google',
      includedAssets: ['creative.png'],
      includedChecks: ['qa-pass'],
      destinationUrls: [],
    });

    expect(summary.packageStatus).toBe('incomplete');
    expect(summary.missingElements).toContain('destinationUrls');
  });
});