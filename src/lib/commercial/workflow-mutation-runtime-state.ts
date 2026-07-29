type WorkflowMutationRuntimeRecord = {
  kind: string
  operationKey: string
  createdAt: string
  result: unknown
}

type WorkflowMutationRuntimeStore = Map<string, WorkflowMutationRuntimeRecord>

declare global {
  // eslint-disable-next-line no-var
  var __commercialWorkflowMutationRuntimeState: WorkflowMutationRuntimeStore | undefined
}

function getStore(): WorkflowMutationRuntimeStore {
  if (!globalThis.__commercialWorkflowMutationRuntimeState) {
    globalThis.__commercialWorkflowMutationRuntimeState = new Map<string, WorkflowMutationRuntimeRecord>()
  }

  return globalThis.__commercialWorkflowMutationRuntimeState
}

function cloneValue<T>(value: T): T {
  if (typeof value === "undefined") {
    return value
  }

  return JSON.parse(JSON.stringify(value)) as T
}

export function getWorkflowMutationRuntimeResult<T = unknown>(
  operationKey: string,
): T | undefined {
  const record = getStore().get(operationKey)
  if (!record) {
    return undefined
  }

  return cloneValue(record.result as T)
}

export function setWorkflowMutationRuntimeResult(
  operationKey: string,
  kind: string,
  result: unknown,
): void {
  getStore().set(operationKey, {
    kind,
    operationKey,
    createdAt: new Date().toISOString(),
    result: cloneValue(result),
  })
}

export function clearWorkflowMutationRuntimeState(): void {
  getStore().clear()
}