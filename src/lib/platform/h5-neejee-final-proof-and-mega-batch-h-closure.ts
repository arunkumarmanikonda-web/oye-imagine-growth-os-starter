export const REQUIRED_NEEJEE_DIMENSIONS = [
  'onboarding',
  'audit',
  'strategy',
  'content',
  'campaigns',
  'dashboards',
  'agreements',
  'billing',
  'reporting',
  'governance',
  'launch_readiness'
] as const;

export type NeejeeProofDimension = (typeof REQUIRED_NEEJEE_DIMENSIONS)[number];

export interface NeejeeProofItem {
  dimension: NeejeeProofDimension;
  complete: boolean;
  evidence: string[];
  note?: string;
}

export interface NeejeeProofRunSummary {
  complete: boolean;
  coveredDimensions: NeejeeProofDimension[];
  missingDimensions: NeejeeProofDimension[];
  incompleteDimensions: NeejeeProofDimension[];
  evidenceCount: number;
  score: number;
  summary: string;
}

export const REQUIRED_ACCEPTANCE_PROOFS = [
  'functional',
  'visible',
  'data',
  'governance'
] as const;

export type AcceptanceProofType = (typeof REQUIRED_ACCEPTANCE_PROOFS)[number];

export interface AcceptanceProofSignal {
  proofType: AcceptanceProofType;
  passed: boolean;
  evidence: string[];
  narrative: string;
}

export interface AcceptanceProofPack {
  ready: boolean;
  passedProofTypes: AcceptanceProofType[];
  missingProofTypes: AcceptanceProofType[];
  evidenceCount: number;
  score: number;
  summary: string;
}

export interface BatchEvidenceEntry {
  batchId: string;
  artifactCount: number;
  validated: boolean;
  coverage: string[];
}

export interface CrossBatchEvidenceRegister {
  ready: boolean;
  requiredBatches: string[];
  coveredBatches: string[];
  missingBatches: string[];
  invalidBatches: string[];
  totalArtifacts: number;
  summary: string;
}

export interface LaunchClosureInput {
  neejeeProofComplete: boolean;
  acceptanceProofReady: boolean;
  criticalClosureGates: string[];
  satisfiedClosureGates: string[];
  launchReadinessEvidence: boolean;
}

export interface LaunchClosureAssessment {
  ready: boolean;
  missingGates: string[];
  score: number;
  summary: string;
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function percent(part: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.round((part / total) * 100);
}

export function evaluateNeejeeProofRun(items: NeejeeProofItem[]): NeejeeProofRunSummary {
  const byDimension = new Map<NeejeeProofDimension, NeejeeProofItem>();

  for (const item of items) {
    byDimension.set(item.dimension, item);
  }

  const coveredDimensions = REQUIRED_NEEJEE_DIMENSIONS.filter((dimension) => byDimension.has(dimension));
  const missingDimensions = REQUIRED_NEEJEE_DIMENSIONS.filter((dimension) => !byDimension.has(dimension));

  const incompleteDimensions = REQUIRED_NEEJEE_DIMENSIONS.filter((dimension) => {
    const item = byDimension.get(dimension);
    return !!item && (!item.complete || item.evidence.length === 0);
  });

  const evidenceCount = items.reduce((sum, item) => sum + item.evidence.length, 0);
  const passedCount = REQUIRED_NEEJEE_DIMENSIONS.filter((dimension) => {
    const item = byDimension.get(dimension);
    return !!item && item.complete && item.evidence.length > 0;
  }).length;

  const score = percent(passedCount, REQUIRED_NEEJEE_DIMENSIONS.length);
  const complete = missingDimensions.length === 0 && incompleteDimensions.length === 0;

  const summary = complete
    ? `Neejee proof run complete across ${coveredDimensions.length} dimensions with ${evidenceCount} evidence item(s).`
    : `Neejee proof run incomplete: ${missingDimensions.length} missing and ${incompleteDimensions.length} incomplete dimension(s).`;

  return {
    complete,
    coveredDimensions,
    missingDimensions,
    incompleteDimensions,
    evidenceCount,
    score,
    summary
  };
}

export function buildMegaBatchHAcceptancePack(
  signals: AcceptanceProofSignal[]
): AcceptanceProofPack {
  const passedProofTypes = REQUIRED_ACCEPTANCE_PROOFS.filter((proofType) => {
    const signal = signals.find((item) => item.proofType === proofType);
    return !!signal && signal.passed && signal.evidence.length > 0;
  });

  const missingProofTypes = REQUIRED_ACCEPTANCE_PROOFS.filter((proofType) => {
    const signal = signals.find((item) => item.proofType === proofType);
    return !signal || !signal.passed || signal.evidence.length === 0;
  });

  const evidenceCount = signals.reduce((sum, item) => sum + item.evidence.length, 0);
  const score = percent(passedProofTypes.length, REQUIRED_ACCEPTANCE_PROOFS.length);
  const ready = missingProofTypes.length === 0;

  const summary = ready
    ? `Mega Batch H acceptance proof ready with all ${passedProofTypes.length} proof types satisfied.`
    : `Mega Batch H acceptance proof incomplete; missing ${missingProofTypes.join(', ')}.`;

  return {
    ready,
    passedProofTypes,
    missingProofTypes,
    evidenceCount,
    score,
    summary
  };
}

export function buildCrossBatchEvidenceRegister(
  entries: BatchEvidenceEntry[],
  requiredBatches: string[] = ['H1', 'H2', 'H3', 'H4', 'H5']
): CrossBatchEvidenceRegister {
  const coveredBatches = unique(entries.map((entry) => entry.batchId)).sort();
  const missingBatches = requiredBatches.filter((batchId) => !coveredBatches.includes(batchId));
  const invalidBatches = entries
    .filter((entry) => !entry.validated || entry.artifactCount <= 0 || entry.coverage.length === 0)
    .map((entry) => entry.batchId);

  const totalArtifacts = entries.reduce((sum, entry) => sum + entry.artifactCount, 0);
  const ready = missingBatches.length === 0 && invalidBatches.length === 0;

  const summary = ready
    ? `Cross-batch evidence register ready for ${coveredBatches.length} required batch(es).`
    : `Cross-batch evidence register incomplete: ${missingBatches.length} missing batch(es), ${invalidBatches.length} invalid batch record(s).`;

  return {
    ready,
    requiredBatches,
    coveredBatches,
    missingBatches,
    invalidBatches,
    totalArtifacts,
    summary
  };
}

export function assessLaunchClosure(
  input: LaunchClosureInput
): LaunchClosureAssessment {
  const missingGates: string[] = [];

  if (!input.neejeeProofComplete) {
    missingGates.push('neejee_end_to_end_proof');
  }

  if (!input.acceptanceProofReady) {
    missingGates.push('mega_batch_h_acceptance_proof');
  }

  if (!input.launchReadinessEvidence) {
    missingGates.push('launch_readiness_evidence');
  }

  const unsatisfiedCritical = input.criticalClosureGates.filter(
    (gate) => !input.satisfiedClosureGates.includes(gate)
  );

  missingGates.push(...unsatisfiedCritical);

  const totalChecks = 3 + input.criticalClosureGates.length;
  const passedChecks = totalChecks - missingGates.length;
  const score = percent(passedChecks, totalChecks);
  const ready = missingGates.length === 0;

  const summary = ready
    ? `Launch closure is ready with score ${score}%.`
    : `Launch closure is not ready; missing ${missingGates.length} gate(s).`;

  return {
    ready,
    missingGates: unique(missingGates),
    score,
    summary
  };
}