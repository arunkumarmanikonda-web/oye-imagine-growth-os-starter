const HIDDEN_KEYS = new Set([
  'provider',
  'providerKey',
  'provider_key',
  'providerName',
  'provider_name',
  'model',
  'modelName',
  'model_name',
  'endpoint',
  'baseUrl',
  'base_url',
  'apiKey',
  'api_key',
  'secret',
  'token',
  'accessToken',
  'access_token',
  'refreshToken',
  'refresh_token',
  'adapterKey',
  'adapter_key',
]);

export const CLIENT_CAPABILITY_BRAND = 'Oye !magine';

function conceal(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(conceal);
  if (!value || typeof value !== 'object') return value;

  const output: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (HIDDEN_KEYS.has(key)) continue;
    output[key] = conceal(nested);
  }
  return output;
}

export function concealInternalProviderMetadata<T>(payload: T): T {
  return conceal(payload) as T;
}

export function clientCapabilityEnvelope<T>(input: {
  capability: string;
  status: 'researching' | 'generating' | 'awaiting_approval' | 'approved' | 'scheduled' | 'live' | 'measured' | 'unavailable';
  result?: T;
  message?: string;
}) {
  return {
    brand: CLIENT_CAPABILITY_BRAND,
    capability: input.capability,
    status: input.status,
    message: input.message ?? null,
    result: input.result === undefined ? null : concealInternalProviderMetadata(input.result),
  };
}
