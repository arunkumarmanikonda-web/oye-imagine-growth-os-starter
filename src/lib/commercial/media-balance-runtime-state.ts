type JsonObject = Record<string, unknown>;

export type MediaBalanceRuntimeState = {
  mediaBalanceAccount: JsonObject;
  ledgerEntries: JsonObject[];
};

type GlobalWithMediaBalanceState = typeof globalThis & {
  __commercialMediaBalanceRuntimeState__?: Map<string, MediaBalanceRuntimeState>;
};

function getStore(): Map<string, MediaBalanceRuntimeState> {
  const globalObject = globalThis as GlobalWithMediaBalanceState;
  if (!globalObject.__commercialMediaBalanceRuntimeState__) {
    globalObject.__commercialMediaBalanceRuntimeState__ = new Map();
  }
  return globalObject.__commercialMediaBalanceRuntimeState__;
}

export function getMediaBalanceRuntimeState(tenantId: string): MediaBalanceRuntimeState | undefined {
  return getStore().get(tenantId);
}

export function setMediaBalanceRuntimeState(
  tenantId: string,
  state: MediaBalanceRuntimeState,
): void {
  getStore().set(tenantId, {
    mediaBalanceAccount: { ...state.mediaBalanceAccount },
    ledgerEntries: [...state.ledgerEntries],
  });
}

export function clearMediaBalanceRuntimeState(tenantId: string): void {
  getStore().delete(tenantId);
}