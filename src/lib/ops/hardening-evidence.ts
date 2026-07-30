import type {
  HardeningEvidenceInput,
  HardeningEvidenceSummary,
} from './final-ops-types';

export function buildHardeningEvidenceSummary(
  input: HardeningEvidenceInput,
): HardeningEvidenceSummary {
  const missingEvidence: string[] = [];

  if (!input.validationReport) missingEvidence.push('validationReport');
  if (!input.securityReport) missingEvidence.push('securityReport');
  if (!input.performanceReport) missingEvidence.push('performanceReport');
  if (!input.launchChecklist) missingEvidence.push('launchChecklist');
  if (!input.rollbackPlan) missingEvidence.push('rollbackPlan');

  return {
    evidenceStatus: missingEvidence.length === 0 ? 'ready' : 'incomplete',
    missingEvidence,
  };
}

export function hardeningEvidenceComplete(
  summary: HardeningEvidenceSummary,
): boolean {
  return summary.evidenceStatus === 'ready' && summary.missingEvidence.length === 0;
}