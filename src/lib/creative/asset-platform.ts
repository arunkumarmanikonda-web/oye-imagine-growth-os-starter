export const CREATIVE_ASSET_BUCKET = 'creative-assets' as const

export const creativeAssetKinds = [
  'image',
  'video',
  'audio',
  'document',
  'carousel',
  'other',
] as const
export type CreativeAssetKind = (typeof creativeAssetKinds)[number]

export const creativeAssetStatuses = [
  'draft',
  'generated',
  'review',
  'approved',
  'rejected',
  'publishing_ready',
  'archived',
] as const
export type CreativeAssetStatus = (typeof creativeAssetStatuses)[number]

export const creativeGenerationTaskKeys = [
  'creative.brief.generate',
  'creative.copy.generate',
  'creative.image.generate',
  'creative.video.generate',
  'creative.asset.qa',
  'creative.derive',
] as const
export type CreativeGenerationTaskKey = (typeof creativeGenerationTaskKeys)[number]

export const creativeGenerationStatuses = [
  'queued',
  'running',
  'succeeded',
  'failed',
  'cancelled',
] as const
export type CreativeGenerationStatus = (typeof creativeGenerationStatuses)[number]

export const creativeProviderKeys = [
  'anthropic',
  'openai',
  'openai_image',
  'openai_video',
  'fal',
  'fal_video',
] as const
export type CreativeProviderKey = (typeof creativeProviderKeys)[number]

export type CreativeProviderCapability = 'reasoning' | 'copy' | 'image' | 'video' | 'qa'

export interface CreativeProviderDefinition {
  key: CreativeProviderKey
  displayName: string
  credentialEnv: 'ANTHROPIC_API_KEY' | 'OPENAI_API_KEY' | 'FAL_KEY'
  capabilities: CreativeProviderCapability[]
  asynchronous: boolean
}

export const creativeProviderDefinitions: Record<CreativeProviderKey, CreativeProviderDefinition> = {
  anthropic: {
    key: 'anthropic',
    displayName: 'Anthropic',
    credentialEnv: 'ANTHROPIC_API_KEY',
    capabilities: ['reasoning', 'copy', 'qa'],
    asynchronous: false,
  },
  openai: {
    key: 'openai',
    displayName: 'OpenAI',
    credentialEnv: 'OPENAI_API_KEY',
    capabilities: ['reasoning', 'copy', 'qa'],
    asynchronous: false,
  },
  openai_image: {
    key: 'openai_image',
    displayName: 'OpenAI Image',
    credentialEnv: 'OPENAI_API_KEY',
    capabilities: ['image'],
    asynchronous: false,
  },
  openai_video: {
    key: 'openai_video',
    displayName: 'OpenAI Video',
    credentialEnv: 'OPENAI_API_KEY',
    capabilities: ['video'],
    asynchronous: true,
  },
  fal: {
    key: 'fal',
    displayName: 'fal.ai Image',
    credentialEnv: 'FAL_KEY',
    capabilities: ['image'],
    asynchronous: true,
  },
  fal_video: {
    key: 'fal_video',
    displayName: 'fal.ai Video',
    credentialEnv: 'FAL_KEY',
    capabilities: ['video'],
    asynchronous: true,
  },
}

export interface CreativeAssetRecord {
  assetId: string
  tenantId: string
  brandId?: string | null
  workspaceId?: string | null
  campaignId?: string | null
  parentAssetId?: string | null
  sourceGenerationJobId?: string | null
  storageBucket: typeof CREATIVE_ASSET_BUCKET
  storagePath: string
  assetKind: CreativeAssetKind
  purpose: string
  channel?: string | null
  mimeType: string
  sha256?: string | null
  byteSize?: number | null
  width?: number | null
  height?: number | null
  durationMs?: number | null
  title?: string | null
  altText?: string | null
  caption?: string | null
  status: CreativeAssetStatus
  approvedBy?: string | null
  approvedAt?: string | null
  metadata?: Record<string, unknown>
}

export interface CreativeGenerationRequest {
  tenantId: string
  brandId?: string | null
  workspaceId?: string | null
  campaignId?: string | null
  taskKey: CreativeGenerationTaskKey
  idempotencyKey: string
  prompt: string
  promptTemplateKey?: string | null
  promptTemplateVersion?: string | null
  inputAssetIds?: string[]
  settings?: Record<string, unknown>
}

export interface CreativeProviderSubmission {
  providerKey: CreativeProviderKey
  modelKey: string
  externalJobId?: string | null
  status: CreativeGenerationStatus
  estimatedCostUsd?: number | null
  rawSafeMetadata?: Record<string, unknown>
}

export interface CreativeGenerationResult {
  providerKey: CreativeProviderKey
  modelKey: string
  externalJobId?: string | null
  status: Extract<CreativeGenerationStatus, 'succeeded' | 'failed'>
  outputUrls?: string[]
  actualCostUsd?: number | null
  latencyMs?: number | null
  safeErrorCode?: string | null
  safeErrorMessage?: string | null
  provenance?: Record<string, unknown>
}

function safePathSegment(value: string, label: string): string {
  const trimmed = value.trim()
  if (!trimmed) throw new Error(`${label} is required`)
  if (trimmed === '.' || trimmed === '..' || trimmed.includes('/') || trimmed.includes('\\')) {
    throw new Error(`${label} contains an invalid path segment`)
  }

  const normalized = trimmed.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-')
  if (!normalized || normalized === '.' || normalized === '..') {
    throw new Error(`${label} cannot be normalized to a safe path segment`)
  }
  return normalized
}

export function buildCreativeAssetPath(input: {
  tenantId: string
  workspaceId: string
  assetId: string
  fileName: string
}): string {
  return [
    safePathSegment(input.tenantId, 'tenantId'),
    safePathSegment(input.workspaceId, 'workspaceId'),
    safePathSegment(input.assetId, 'assetId'),
    safePathSegment(input.fileName, 'fileName'),
  ].join('/')
}

export function getCreativeAssetTenantFromPath(storagePath: string): string | null {
  const [tenantId] = storagePath.split('/')
  return tenantId?.trim() || null
}

export function isPublishingEligible(asset: Pick<CreativeAssetRecord, 'status' | 'approvedBy' | 'approvedAt'>): boolean {
  return asset.status === 'publishing_ready' && Boolean(asset.approvedBy && asset.approvedAt)
}

export function getCreativeProviderReadiness(env: NodeJS.ProcessEnv = process.env) {
  return creativeProviderKeys.map((key) => {
    const definition = creativeProviderDefinitions[key]
    return {
      key,
      displayName: definition.displayName,
      capabilities: definition.capabilities,
      asynchronous: definition.asynchronous,
      configured: Boolean(env[definition.credentialEnv]?.trim()),
      credentialEnv: definition.credentialEnv,
    }
  })
}
