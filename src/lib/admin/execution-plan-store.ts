import {
  createExecutionPlanDraftRecord,
  type ExecutionPlanDraftRecord,
} from "@/lib/admin/execution-plan-schema";
import { executionPlanDraftFixture } from "@/lib/admin/execution-plan-fixtures";

let executionPlanDraftState: ExecutionPlanDraftRecord =
  createExecutionPlanDraftRecord(executionPlanDraftFixture);

function getNextTimestamp(previous?: string) {
  const now = new Date();
  const previousTime = previous ? new Date(previous).getTime() : Number.NaN;
  const nextTime =
    Number.isFinite(previousTime) && now.getTime() <= previousTime
      ? previousTime + 1
      : now.getTime();

  return new Date(nextTime).toISOString();
}

export function getExecutionPlanDraft() {
  return executionPlanDraftState;
}

export function createExecutionPlanDraft(
  overrides: Partial<ExecutionPlanDraftRecord> = {},
) {
  return createExecutionPlanDraftRecord(overrides);
}

export function saveExecutionPlanDraft(
  input: Partial<ExecutionPlanDraftRecord>,
) {
  const generatedAt =
    input.generatedAt ??
    executionPlanDraftState?.generatedAt ??
    getNextTimestamp();

  executionPlanDraftState = createExecutionPlanDraftRecord({
    ...input,
    generatedAt,
    lastUpdatedAt: getNextTimestamp(executionPlanDraftState?.lastUpdatedAt),
  });

  return executionPlanDraftState;
}

export function updateExecutionPlanDraft(
  updates: Partial<ExecutionPlanDraftRecord>,
) {
  executionPlanDraftState = createExecutionPlanDraftRecord({
    ...executionPlanDraftState,
    ...updates,
    generatedAt: executionPlanDraftState.generatedAt,
    lastUpdatedAt: getNextTimestamp(executionPlanDraftState.lastUpdatedAt),
  });

  return executionPlanDraftState;
}

export function resetExecutionPlanDraftStore() {
  executionPlanDraftState = createExecutionPlanDraftRecord(
    executionPlanDraftFixture,
  );

  return executionPlanDraftState;
}