import { resolveProviderSecrets, type ProviderEnvironment } from '@/lib/config-control/provider-vault'

export type RuntimeProviderFieldResolution = {
  providerKey: string
  environment: ProviderEnvironment
  values: Record<string, string>
  sources: Record<string, 'environment' | 'vault'>
  missing: string[]
}

export async function resolveRuntimeProviderFields(input: {
  providerKey: string
  fieldKeys: string[]
  environment?: ProviderEnvironment
}) : Promise<RuntimeProviderFieldResolution> {
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
