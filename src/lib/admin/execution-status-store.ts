import {
  createExecutionStatusDraftRecord,
  type ExecutionStatusDraftRecord,
} from "@/lib/admin/execution-status-schema";

let executionStatusDraftState: ExecutionStatusDraftRecord | null = null;

function getNextTimestamp(previous?: string): string {
  const now = Date.now();
  const previousTime = previous ? Date.parse(previous) : Number.NaN;
  const nextTime =
    Number.isFinite(previousTime) && previousTime >= now
      ? previousTime + 1
      : now;

  return new Date(nextTime).toISOString();
}

export function getExecutionStatusDraft() {
  return executionStatusDraftState;
}

export function createExecutionStatusDraft(
  input: Partial<ExecutionStatusDraftRecord> = {},
) {
  return createExecutionStatusDraftRecord(input);
}

export function saveExecutionStatusDraft(
  input: Partial<ExecutionStatusDraftRecord> = {},
) {
  const generatedAt =
    input.generatedAt ??
    executionStatusDraftState?.generatedAt ??
    getNextTimestamp();

  const draft = createExecutionStatusDraftRecord({
    ...executionStatusDraftState,
    ...input,
    generatedAt,
    lastUpdatedAt: getNextTimestamp(executionStatusDraftState?.lastUpdatedAt),
  });

  executionStatusDraftState = draft;
  return draft;
}

export function updateExecutionStatusDraft(
  updates: Partial<ExecutionStatusDraftRecord> = {},
) {
  const baseDraft = executionStatusDraftState ?? createExecutionStatusDraft();

  const draft = createExecutionStatusDraftRecord({
    ...baseDraft,
    ...updates,
    generatedAt: baseDraft.generatedAt,
    lastUpdatedAt: getNextTimestamp(baseDraft.lastUpdatedAt),
  });

  executionStatusDraftState = draft;
  return draft;
}

export function resetExecutionStatusDraftStore() {
  executionStatusDraftState = null;
}