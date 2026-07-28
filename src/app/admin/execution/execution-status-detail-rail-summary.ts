import type { ExecutionStatusDetailRailSummary } from "./execution-status-detail-rail";

type ExecutionStatusSummaryCarrier = {
  executionStatusSummary?: ExecutionStatusDetailRailSummary | null;
};

export function getExecutionStatusDetailRailSummary(
  data: ExecutionStatusSummaryCarrier | null | undefined,
): ExecutionStatusDetailRailSummary | null {
  return data?.executionStatusSummary ?? null;
}