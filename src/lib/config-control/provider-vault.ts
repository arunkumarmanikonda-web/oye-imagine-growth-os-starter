import crypto from 'node:crypto';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { ApiAccessContext } from '@/lib/auth/api-access';
import { decryptSecret, encryptSecret, maskSecretValue } from './crypto';

export type ProviderEnvironment = 'development' | 'preview' | 'staging' | 'production';

function configKey() {
  const key = process.env.CONFIG_VAULT_ENCRYPTION_KEY;
  if (!key || key.length < 32) throw new Error('config_vault_encryption_key_unavailable');
  return key;
}

function assertPlatformOwner(access: ApiAccessContext) {
  if (access.membership.role_key !== 'platform_owner') {
    throw new Error('platform_owner_required');
  }
}

function fingerprint(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function credentialId(providerKey: string, environment: string, fieldKey: string) {
  return `cred_${fingerprint(`${providerKey}|${environment}|${fieldKey}`).slice(0, 24)}`;
}

export async function listProviderConfiguration(access: ApiAccessContext) {
  assertPlatformOwner(access);
  const admin = createSupabaseAdminClient();
  const [{ data: providers, error: providerError }, { data: fields, error: fieldError }, { data: credentials, error: credentialError }, { data: routes, error: routeError }, { data: requests, error: requestError }] = await Promise.all([
    admin.from('config_provider_definitions').select('*').order('provider_category').order('display_name'),
    admin.from('config_provider_secret_fields').select('*').order('provider_key').order('sort_order'),
    admin.from('config_provider_credentials').select('credential_id,provider_key,environment,field_key,status,value_fingerprint,last_verified_at,verification_message,rotated_at,expires_at,updated_at').order('provider_key'),
    admin.from('config_capability_routes').select('*').order('capability_key').order('purpose'),
    admin.from('config_integration_requests').select('*').order('updated_at', { ascending: false }).limit(100),
  ]);
  if (providerError) throw new Error(`provider_catalog_read_failed:${providerError.message}`);
  if (fieldError) throw new Error(`provider_fields_read_failed:${fieldError.message}`);
  if (credentialError) throw new Error(`provider_credentials_read_failed:${credentialError.message}`);
  if (routeError) throw new Error(`capability_routes_read_failed:${routeError.message}`);
  if (requestError) throw new Error(`integration_requests_read_failed:${requestError.message}`);

  const configured = new Map((credentials ?? []).map((row: any) => [`${row.provider_key}|${row.environment}|${row.field_key}`, row]));
  return {
    providers: (providers ?? []).map((provider: any) => ({
      ...provider,
      fields: (fields ?? []).filter((field: any) => field.provider_key === provider.provider_key).map((field: any) => ({
        ...field,
        configured: configured.has(`${provider.provider_key}|production|${field.field_key}`),
        credential: configured.get(`${provider.provider_key}|production|${field.field_key}`) ?? null,
      })),
    })),
    routes: routes ?? [],
    integrationRequests: requests ?? [],
    clientDisclosurePolicy: 'provider_hidden',
  };
}

export async function saveProviderCredential(input: {
  access: ApiAccessContext;
  providerKey: string;
  fieldKey: string;
  value: string;
  environment?: ProviderEnvironment;
}) {
  assertPlatformOwner(input.access);
  const providerKey = input.providerKey.trim();
  const fieldKey = input.fieldKey.trim();
  const value = input.value.trim();
  const environment = input.environment ?? 'production';
  if (!providerKey || !fieldKey || !value) throw new Error('provider_credential_value_required');

  const admin = createSupabaseAdminClient();
  const { data: field, error: fieldError } = await admin
    .from('config_provider_secret_fields')
    .select('provider_key,field_key,sensitive')
    .eq('provider_key', providerKey)
    .eq('field_key', fieldKey)
    .maybeSingle();
  if (fieldError || !field) throw new Error('provider_secret_field_unknown');

  const encryptedValue = encryptSecret(configKey(), value);
  const id = credentialId(providerKey, environment, fieldKey);
  const now = new Date().toISOString();
  const { error } = await admin.from('config_provider_credentials').upsert({
    credential_id: id,
    provider_key: providerKey,
    environment,
    field_key: fieldKey,
    encrypted_value: encryptedValue,
    value_fingerprint: fingerprint(value),
    status: 'configured',
    rotated_at: now,
    updated_by: input.access.subject,
    created_by: input.access.subject,
  }, { onConflict: 'provider_key,environment,field_key' });
  if (error) throw new Error(`provider_credential_write_failed:${error.message}`);

  return {
    providerKey,
    fieldKey,
    environment,
    configured: true,
    maskedValue: maskSecretValue(value),
    sensitive: Boolean(field.sensitive),
  };
}

export async function resolveProviderSecrets(input: {
  providerKey: string;
  environment?: ProviderEnvironment;
}) {
  const admin = createSupabaseAdminClient();
  const environment = input.environment ?? 'production';
  const [{ data: fields, error: fieldError }, { data: credentials, error: credentialError }] = await Promise.all([
    admin.from('config_provider_secret_fields').select('*').eq('provider_key', input.providerKey).order('sort_order'),
    admin.from('config_provider_credentials').select('*').eq('provider_key', input.providerKey).eq('environment', environment).in('status', ['configured','verified']),
  ]);
  if (fieldError) throw new Error(`provider_fields_read_failed:${fieldError.message}`);
  if (credentialError) throw new Error(`provider_credentials_read_failed:${credentialError.message}`);

  const byField = new Map((credentials ?? []).map((row: any) => [row.field_key, row]));
  const missingRequired: string[] = [];
  const values: Record<string, string> = {};
  for (const field of fields ?? []) {
    const row: any = byField.get(field.field_key);
    if (!row) {
      if (field.required) missingRequired.push(field.field_key);
      continue;
    }
    values[field.field_key] = decryptSecret(configKey(), row.encrypted_value);
  }

  return {
    providerKey: input.providerKey,
    environment,
    ready: missingRequired.length === 0,
    missingRequired,
    values,
  };
}

export async function resolveCapabilityProvider(input: {
  capabilityKey: string;
  purpose: string;
  environment?: ProviderEnvironment;
}) {
  const admin = createSupabaseAdminClient();
  const { data: route, error } = await admin
    .from('config_capability_routes')
    .select('*')
    .eq('capability_key', input.capabilityKey)
    .eq('purpose', input.purpose)
    .eq('enabled', true)
    .maybeSingle();
  if (error || !route) throw new Error('capability_route_not_configured');

  const candidates = [route.primary_provider_key, ...(Array.isArray(route.fallback_provider_keys) ? route.fallback_provider_keys : [])];
  const failures: Array<{ providerKey: string; missingRequired: string[] }> = [];
  for (const providerKey of candidates) {
    const resolution = await resolveProviderSecrets({ providerKey, environment: input.environment });
    if (resolution.ready) {
      return {
        capabilityKey: input.capabilityKey,
        purpose: input.purpose,
        providerKey,
        clientLabel: 'Oye !magine',
        discloseProviderToClient: false,
        secrets: resolution.values,
      };
    }
    failures.push({ providerKey, missingRequired: resolution.missingRequired });
  }
  throw new Error(`capability_provider_unavailable:${JSON.stringify(failures)}`);
}

export async function registerIntegrationNeed(input: {
  access: ApiAccessContext;
  requestedCapability: string;
  providerName?: string | null;
  providerCategory?: string | null;
  reason: string;
  expectedValue?: string | null;
  accountSteps?: string[];
  requiredSecretFields?: Array<{ key: string; label: string; sensitive?: boolean }>;
  officialDocsUrl?: string | null;
  officialAccountUrl?: string | null;
}) {
  assertPlatformOwner(input.access);
  const createdAt = new Date().toISOString();
  const requestId = `integration_${fingerprint(`${input.requestedCapability}|${input.providerName ?? ''}|${createdAt}`).slice(0, 24)}`;
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from('config_integration_requests').insert({
    request_id: requestId,
    requested_capability: input.requestedCapability.trim(),
    proposed_provider_name: input.providerName?.trim() || null,
    proposed_provider_category: input.providerCategory?.trim() || null,
    reason: input.reason.trim(),
    expected_value: input.expectedValue?.trim() || null,
    required_account_steps: input.accountSteps ?? [],
    required_secret_fields: input.requiredSecretFields ?? [],
    official_docs_url: input.officialDocsUrl?.trim() || null,
    official_account_url: input.officialAccountUrl?.trim() || null,
    status: 'admin_action_required',
    discovered_by: 'ai_evolution_engine',
  });
  if (error) throw new Error(`integration_request_write_failed:${error.message}`);
  return { requestId, status: 'admin_action_required' as const };
}
