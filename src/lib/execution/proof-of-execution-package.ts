import type {
  ProofExecutionPackageInput,
  ProofExecutionPackageSummary,
} from './execution-integration-types';

export function buildProofExecutionPackageSummary(
  input: ProofExecutionPackageInput,
): ProofExecutionPackageSummary {
  const missingElements: string[] = [];

  if (input.includedAssets.length === 0) missingElements.push('assets');
  if (input.includedChecks.length === 0) missingElements.push('checks');
  if (input.destinationUrls.length === 0) missingElements.push('destinationUrls');

  return {
    packageStatus: missingElements.length === 0 ? 'ready' : 'incomplete',
    missingElements,
    includedAssetCount: input.includedAssets.length,
  };
}

export function proofPackageComplete(
  summary: ProofExecutionPackageSummary,
): boolean {
  return summary.packageStatus === 'ready' && summary.missingElements.length === 0;
}