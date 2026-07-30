import { describe, expect, it } from 'vitest';
import {
  buildHardeningEvidenceSummary,
  hardeningEvidenceComplete,
} from '../../src/lib/ops/hardening-evidence';

describe('hardening-evidence', () => {
  it('marks evidence ready when all required artifacts exist', () => {
    const summary = buildHardeningEvidenceSummary({
      brandName: 'Neejee',
      validationReport: true,
      securityReport: true,
      performanceReport: true,
      launchChecklist: true,
      rollbackPlan: true,
    });

    expect(summary.evidenceStatus).toBe('ready');
    expect(hardeningEvidenceComplete(summary)).toBe(true);
  });

  it('marks evidence incomplete when reports are missing', () => {
    const summary = buildHardeningEvidenceSummary({
      brandName: 'Neejee',
      validationReport: true,
      securityReport: false,
      performanceReport: false,
      launchChecklist: true,
      rollbackPlan: false,
    });

    expect(summary.evidenceStatus).toBe('incomplete');
    expect(summary.missingEvidence).toContain('securityReport');
    expect(summary.missingEvidence).toContain('performanceReport');
    expect(summary.missingEvidence).toContain('rollbackPlan');
  });
});