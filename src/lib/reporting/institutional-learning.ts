import type { InstitutionalLearningEntry } from './reporting-types';

export function createInstitutionalLearningEntry(
  input: InstitutionalLearningEntry,
): InstitutionalLearningEntry {
  return {
    ...input,
    reusableTags: [...input.reusableTags],
    evidenceRefs: [...input.evidenceRefs],
  };
}

export function institutionalLearningEntryReady(
  entry: InstitutionalLearningEntry,
): boolean {
  return Boolean(
    entry.learningId &&
    entry.tenantId &&
    entry.workspaceId &&
    entry.title &&
    entry.summary &&
    entry.evidenceRefs.length > 0,
  );
}

export function institutionalLearningEntryTenantSafe(
  entry: InstitutionalLearningEntry,
  tenantId: string,
): boolean {
  return institutionalLearningEntryReady(entry) &&
    entry.tenantId === tenantId;
}