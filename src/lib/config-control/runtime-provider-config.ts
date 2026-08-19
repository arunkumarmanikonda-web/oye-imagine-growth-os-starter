import 'server-only'

import { resolveProviderSecrets, type ProviderEnvironment } from '@/lib/config-control/provider-vault'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export type RuntimeProviderFieldResolution = {
  providerKey: string
  environment: ProviderEnvironment
  values: Record<string, string>
  sources: Record<string, 'environment' | 'vault'>
  missing: string[]
}

export type RuntimeProviderConfiguration = RuntimeProviderFieldResolution & {
  fieldKeys: string[]
  requiredFieldKeys: string[]
  missingRequired: string[]
  ready: boolean
}

export async function resolveRuntimeProviderFields(input: {
  providerKey: string
  fieldKeys: string[]
  environment?: ProviderEnvironment
}): Promise<RuntimeProviderFieldResolution> {
  const environment = input.environment || 'production'
  let vaultValues: Record<string, string> = {}
  try {
    const vault = await resolveProviderSecrets({ providerKey: input.providerKey, environment })
    vaultValues = vault.values || {}
  } catch {
    vaultValues = {}
  }

  const values: Record<string, string> = {}
  const sources: Record<string, 'environment' | 'vault'> = {}
  const missing: string[] = []
  for (const fieldKey of input.fieldKeys) {
    const environmentValue = process.env[fieldKey]?.trim()
    const vaultValue = vaultValues[fieldKey]?.trim()
    if (environmentValue) {
      values[fieldKey] = environmentValue
      sources[fieldKey] = 'environment'
    } else if (vaultValue) {
      values[fieldKey] = vaultValue
      sources[fieldKey] = 'vault'
    } else {
      missing.push(fieldKey)
    }
  }
  return { providerKey: input.providerKey, environment, values, sources, missing }
}

export async function requiredRuntimeProviderFields(input: {
  providerKey: string
  fieldKeys: string[]
  environment?: ProviderEnvironment
}) {
  const resolution = await resolveRuntimeProviderFields(input)
  if (resolution.missing.length) {
    throw new Error(`provider_runtime_fields_missing:${input.providerKey}:${resolution.missing.join(',')}`)
  }
  return resolution
}

export async function resolveRuntimeProviderConfiguration(input: {
  providerKey: string
  environment?: ProviderEnvironment
}): Promise<RuntimeProviderConfiguration> {
  const admin = createSupabaseAdminClient()
  const { data: fields, error } = await admin
    .from('config_provider_secret_fields')
    .select('field_key,required,sort_order')
    .eq('provider_key', input.providerKey)
    .order('sort_order')
  if (error) throw new Error(`provider_runtime_fields_read_failed:${input.providerKey}:${error.message}`)

  const fieldKeys = (fields ?? []).map((field: any) => String(field.field_key))
  const requiredFieldKeys = (fields ?? [])
    .filter((field: any) => Boolean(field.required))
    .map((field: any) => String(field.field_key))
  const resolution = await resolveRuntimeProviderFields({
    providerKey: input.providerKey,
    fieldKeys,
    environment: input.environment,
  })
  const missingRequired = requiredFieldKeys.filter((fieldKey) => !resolution.values[fieldKey])

  return {
    ...resolution,
    fieldKeys,
    requiredFieldKeys,
    missingRequired,
    ready: requiredFieldKeys.length > 0 && missingRequired.length === 0,
  }
}

export async function resolveRuntimeCapabilityProvider(input: {
  capabilityKey: string
  purpose: string
  environment?: ProviderEnvironment
  preferredProviderKey?: string | null
}) {
  const admin = createSupabaseAdminClient()
  const { data: route, error } = await admin
    .from('config_capability_routes')
    .select('route_id,capability_key,purpose,primary_provider_key,fallback_provider_keys,enabled')
    .eq('capability_key', input.capabilityKey)
    .eq('purpose', input.purpose)
    .eq('enabled', true)
    .maybeSingle()
  if (error || !route) throw new Error('capability_route_not_configured')

  const normalCandidates = [
    String(route.primary_provider_key),
    ...(Array.isArray(route.fallback_provider_keys) ? route.fallback_provider_keys.map(String) : []),
  ]
  const preferred = input.preferredProviderKey?.trim() || ''
  if (preferred && !normalCandidates.includes(preferred)) {
    throw new Error(`capability_provider_not_allowed:${input.capabilityKey}:${input.purpose}:${preferred}`)
  }
  const candidates = preferred
    ? [preferred, ...normalCandidates.filter((providerKey) => providerKey !== preferred)]
    : normalCandidates

  const failures: Array<{ providerKey: string; missingRequired: string[]; requiredFieldKeys: string[] }> = []
  for (const providerKey of candidates) {
    const resolution = await resolveRuntimeProviderConfiguration({ providerKey, environment: input.environment })
    if (resolution.ready) {
      return {
        routeId: String(route.route_id),
        capabilityKey: input.capabilityKey,
        purpose: input.purpose,
        providerKey,
        environment: resolution.environment,
        values: resolution.values,
        sources: resolution.sources,
      }
    }
    failures.push({
      providerKey,
      missingRequired: resolution.missingRequired,
      requiredFieldKeys: resolution.requiredFieldKeys,
    })
  }

  throw new Error(`capability_provider_unavailable:${JSON.stringify(failures)}`)
}
