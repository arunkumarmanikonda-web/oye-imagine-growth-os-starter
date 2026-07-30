import type {
  StrategyArtifact,
  StrategyArtifactStatus,
  StrategyArtifactType,
} from './onboarding-types';

export function createStrategyArtifactDraft(input: {
  artifactId: string;
  tenantId: string;
  brandId: string;
  workspaceId?: string | null;
  intakeId?: string | null;
  artifactType: StrategyArtifactType;
  title: string;
  sections?: Array<Record<string, unknown>>;
  summary?: Record<string, unknown>;
  generatedBy?: string | null;
}): StrategyArtifact {
  return {
    artifactId: input.artifactId,
    tenantId: input.tenantId,
    brandId: input.brandId,
    workspaceId: input.workspaceId ?? null,
    intakeId: input.intakeId ?? null,
    artifactType: input.artifactType,
    title: input.title.trim(),
    status: 'draft',
    version: 1,
    sections: input.sections ?? [],
    summary: input.summary ?? {},
    generatedBy: input.generatedBy ?? null,
    approvedBy: null,
  };
}

export function canTransitionStrategyArtifact(
  from: StrategyArtifactStatus,
  to: StrategyArtifactStatus,
): boolean {
  const allowed: Record<StrategyArtifactStatus, StrategyArtifactStatus[]> = {
    draft: ['review', 'archived'],
    review: ['approved', 'draft', 'archived'],
    approved: ['published', 'archived'],
    published: ['archived'],
    archived: [],
  };

  return allowed[from].includes(to);
}

export function canPublishStrategyArtifact(
  artifact: StrategyArtifact,
): boolean {
  return (
    artifact.status === 'approved' &&
    artifact.sections.length > 0 &&
    Object.keys(artifact.summary).length > 0
  );
}