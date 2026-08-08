import { describe, expect, it } from 'vitest';
import {
  assessLaunchClosure,
  buildCrossBatchEvidenceRegister,
  buildMegaBatchHAcceptancePack,
  evaluateNeejeeProofRun
} from '../../src/lib/platform/h5-neejee-final-proof-and-mega-batch-h-closure';

describe('evaluateNeejeeProofRun', () => {
  it('marks Neejee proof complete when all required dimensions have evidence', () => {
    const result = evaluateNeejeeProofRun([
      { dimension: 'onboarding', complete: true, evidence: ['onboarding.mp4'] },
      { dimension: 'audit', complete: true, evidence: ['audit.json'] },
      { dimension: 'strategy', complete: true, evidence: ['strategy.md'] },
      { dimension: 'content', complete: true, evidence: ['content.md'] },
      { dimension: 'campaigns', complete: true, evidence: ['campaigns.csv'] },
      { dimension: 'dashboards', complete: true, evidence: ['dashboard.png'] },
      { dimension: 'agreements', complete: true, evidence: ['agreement.pdf'] },
      { dimension: 'billing', complete: true, evidence: ['billing.csv'] },
      { dimension: 'reporting', complete: true, evidence: ['report.pdf'] },
      { dimension: 'governance', complete: true, evidence: ['governance.md'] },
      { dimension: 'launch_readiness', complete: true, evidence: ['launch-checklist.md'] }
    ]);

    expect(result.complete).toBe(true);
    expect(result.missingDimensions).toEqual([]);
    expect(result.incompleteDimensions).toEqual([]);
    expect(result.score).toBe(100);
    expect(result.evidenceCount).toBe(11);
  });

  it('identifies missing and incomplete Neejee proof dimensions', () => {
    const result = evaluateNeejeeProofRun([
      { dimension: 'onboarding', complete: true, evidence: ['onboarding.mp4'] },
      { dimension: 'audit', complete: false, evidence: ['audit.json'] },
      { dimension: 'strategy', complete: true, evidence: [] }
    ]);

    expect(result.complete).toBe(false);
    expect(result.missingDimensions).toContain('content');
    expect(result.incompleteDimensions).toContain('audit');
    expect(result.incompleteDimensions).toContain('strategy');
  });
});

describe('buildMegaBatchHAcceptancePack', () => {
  it('marks acceptance proof ready when all four proof types pass', () => {
    const result = buildMegaBatchHAcceptancePack([
      { proofType: 'functional', passed: true, evidence: ['functional.mp4'], narrative: 'functional proof' },
      { proofType: 'visible', passed: true, evidence: ['visible.png'], narrative: 'visible proof' },
      { proofType: 'data', passed: true, evidence: ['data.json'], narrative: 'data proof' },
      { proofType: 'governance', passed: true, evidence: ['governance.pdf'], narrative: 'governance proof' }
    ]);

    expect(result.ready).toBe(true);
    expect(result.missingProofTypes).toEqual([]);
    expect(result.score).toBe(100);
  });

  it('identifies missing acceptance proof types', () => {
    const result = buildMegaBatchHAcceptancePack([
      { proofType: 'functional', passed: true, evidence: ['functional.mp4'], narrative: 'functional proof' },
      { proofType: 'visible', passed: false, evidence: ['visible.png'], narrative: 'visible proof' }
    ]);

    expect(result.ready).toBe(false);
    expect(result.missingProofTypes).toContain('visible');
    expect(result.missingProofTypes).toContain('data');
    expect(result.missingProofTypes).toContain('governance');
  });
});

describe('buildCrossBatchEvidenceRegister', () => {
  it('validates cross-batch coverage for H1-H5', () => {
    const result = buildCrossBatchEvidenceRegister([
      { batchId: 'H1', artifactCount: 3, validated: true, coverage: ['security baseline'] },
      { batchId: 'H2', artifactCount: 4, validated: true, coverage: ['compliance'] },
      { batchId: 'H3', artifactCount: 3, validated: true, coverage: ['super admin'] },
      { batchId: 'H4', artifactCount: 4, validated: true, coverage: ['devsecops'] },
      { batchId: 'H5', artifactCount: 5, validated: true, coverage: ['neejee proof', 'acceptance proof'] }
    ]);

    expect(result.ready).toBe(true);
    expect(result.missingBatches).toEqual([]);
    expect(result.invalidBatches).toEqual([]);
    expect(result.totalArtifacts).toBe(19);
  });

  it('flags missing or invalid batch evidence', () => {
    const result = buildCrossBatchEvidenceRegister([
      { batchId: 'H1', artifactCount: 3, validated: true, coverage: ['security baseline'] },
      { batchId: 'H2', artifactCount: 0, validated: true, coverage: ['compliance'] },
      { batchId: 'H5', artifactCount: 2, validated: false, coverage: ['acceptance proof'] }
    ]);

    expect(result.ready).toBe(false);
    expect(result.missingBatches).toContain('H3');
    expect(result.missingBatches).toContain('H4');
    expect(result.invalidBatches).toContain('H2');
    expect(result.invalidBatches).toContain('H5');
  });
});

describe('assessLaunchClosure', () => {
  it('marks launch closure ready when proof and critical gates are satisfied', () => {
    const result = assessLaunchClosure({
      neejeeProofComplete: true,
      acceptanceProofReady: true,
      criticalClosureGates: [
        'security_real',
        'super_admin_real',
        'compliance_implemented',
        'launch_readiness_defensible'
      ],
      satisfiedClosureGates: [
        'security_real',
        'super_admin_real',
        'compliance_implemented',
        'launch_readiness_defensible'
      ],
      launchReadinessEvidence: true
    });

    expect(result.ready).toBe(true);
    expect(result.missingGates).toEqual([]);
    expect(result.score).toBe(100);
  });

  it('marks launch closure incomplete when proof or closure gates are missing', () => {
    const result = assessLaunchClosure({
      neejeeProofComplete: false,
      acceptanceProofReady: true,
      criticalClosureGates: [
        'security_real',
        'super_admin_real',
        'compliance_implemented',
        'launch_readiness_defensible'
      ],
      satisfiedClosureGates: ['security_real'],
      launchReadinessEvidence: false
    });

    expect(result.ready).toBe(false);
    expect(result.missingGates).toContain('neejee_end_to_end_proof');
    expect(result.missingGates).toContain('super_admin_real');
    expect(result.missingGates).toContain('launch_readiness_evidence');
  });
});