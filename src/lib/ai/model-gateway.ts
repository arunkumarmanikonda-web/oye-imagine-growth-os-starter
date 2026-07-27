export type ModelGatewayProvider = "rule-based" | "openai" | "anthropic" | "fallback";

export type ModelGatewayRequest = {
  tenantId?: string;
  pilotId?: string;
  taskType: string;
  prompt: string;
  cacheKey?: string;
  maxCostUsd?: number;
};

export type ModelGatewayResponse = {
  ok: boolean;
  provider: ModelGatewayProvider;
  content: string;
  promptTokens: number;
  completionTokens: number;
  estimatedCostUsd: number;
  cacheHit: boolean;
  fallbackUsed: boolean;
};

export type ModelGatewayProviderHandler = (
  request: ModelGatewayRequest,
) => Promise<ModelGatewayResponse>;

type CostLedgerEntry = {
  tenantId: string;
  spentUsd: number;
};

const responseCache = new Map<string, ModelGatewayResponse>();
const costLedger = new Map<string, CostLedgerEntry>();

function normalizeTenantId(value?: string): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : "default-tenant";
}

function estimateTokens(value: string): number {
  const normalized = value.trim();
  if (!normalized) {
    return 0;
  }

  return Math.max(1, Math.ceil(normalized.length / 4));
}

function estimateCostUsd(promptTokens: number, completionTokens: number): number {
  const totalTokens = promptTokens + completionTokens;
  return Number((totalTokens * 0.00001).toFixed(6));
}

function buildCacheKey(request: ModelGatewayRequest): string {
  if (request.cacheKey && request.cacheKey.trim().length > 0) {
    return request.cacheKey.trim();
  }

  return [
    normalizeTenantId(request.tenantId),
    request.pilotId?.trim() || "no-pilot",
    request.taskType.trim(),
    request.prompt.trim(),
  ].join("::");
}

function readLedger(tenantId: string): CostLedgerEntry {
  return costLedger.get(tenantId) ?? {
    tenantId,
    spentUsd: 0,
  };
}

function writeLedger(entry: CostLedgerEntry) {
  costLedger.set(entry.tenantId, entry);
}

async function defaultRuleBasedProvider(
  request: ModelGatewayRequest,
): Promise<ModelGatewayResponse> {
  const promptTokens = estimateTokens(request.prompt);
  const completionTokens = Math.max(24, Math.ceil(promptTokens * 0.35));
  const estimatedCostUsd = estimateCostUsd(promptTokens, completionTokens);

  return {
    ok: true,
    provider: "rule-based",
    content: `RULE-BASED RESPONSE :: ${request.taskType} :: ${request.prompt}`,
    promptTokens,
    completionTokens,
    estimatedCostUsd,
    cacheHit: false,
    fallbackUsed: false,
  };
}

export async function executeModelGateway(
  request: ModelGatewayRequest,
  providerHandler: ModelGatewayProviderHandler = defaultRuleBasedProvider,
): Promise<ModelGatewayResponse> {
  const tenantId = normalizeTenantId(request.tenantId);
  const cacheKey = buildCacheKey(request);

  const cached = responseCache.get(cacheKey);
  if (cached) {
    return {
      ...cached,
      cacheHit: true,
    };
  }

  const result = await providerHandler(request);
  const estimatedCostUsd = result.estimatedCostUsd;
  const maxCostUsd = request.maxCostUsd ?? 1;

  if (estimatedCostUsd > maxCostUsd) {
    throw new Error(
      `Model gateway cost cap exceeded for tenant '${tenantId}'. Estimated ${estimatedCostUsd} > ${maxCostUsd}.`,
    );
  }

  const currentLedger = readLedger(tenantId);
  const nextLedger: CostLedgerEntry = {
    tenantId,
    spentUsd: Number((currentLedger.spentUsd + estimatedCostUsd).toFixed(6)),
  };
  writeLedger(nextLedger);

  const persisted: ModelGatewayResponse = {
    ...result,
    cacheHit: false,
  };

  responseCache.set(cacheKey, persisted);

  return persisted;
}

export function getTenantCostLedger(tenantId?: string): CostLedgerEntry {
  return readLedger(normalizeTenantId(tenantId));
}

export function resetModelGatewayState() {
  responseCache.clear();
  costLedger.clear();
}