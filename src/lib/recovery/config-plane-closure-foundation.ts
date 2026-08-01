export type ConfigScope = 'branding' | 'workspace' | 'support' | 'governance'
export type ConfigAudience = 'public' | 'client' | 'operator'
export type ConfigSource = 'canonical' | 'override'
export type OperatorRole = 'super_admin' | 'content_manager' | 'support_operator'

export type ConfigEntry = {
  key: string
  scope: ConfigScope
  audience: ConfigAudience
  value: string
  source: ConfigSource
  mutableBy: OperatorRole[]
  requiresReview: boolean
}

export type ConfigPlaneState = {
  role: OperatorRole
  accessibleEntries: ConfigEntry[]
  summary: {
    entryCount: number
    reviewRequiredCount: number
    overrideCount: number
  }
}

const canonicalConfigRegistry: ConfigEntry[] = [
  {
    key: 'brand.display_name',
    scope: 'branding',
    audience: 'public',
    value: 'Oye !magine',
    source: 'canonical',
    mutableBy: ['super_admin', 'content_manager'],
    requiresReview: true
  },
  {
    key: 'workspace.default_key',
    scope: 'workspace',
    audience: 'client',
    value: 'oye-imagine',
    source: 'canonical',
    mutableBy: ['super_admin'],
    requiresReview: true
  },
  {
    key: 'support.primary_email',
    scope: 'support',
    audience: 'client',
    value: 'hello@oyeimagine.com',
    source: 'override',
    mutableBy: ['super_admin', 'support_operator'],
    requiresReview: false
  },
  {
    key: 'governance.approval_mode',
    scope: 'governance',
    audience: 'operator',
    value: 'review-required',
    source: 'canonical',
    mutableBy: ['super_admin'],
    requiresReview: true
  }
]

function cloneEntry(entry: ConfigEntry): ConfigEntry {
  return {
    ...entry,
    mutableBy: [...entry.mutableBy]
  }
}

export function getConfigPlaneRegistry() {
  return canonicalConfigRegistry.map(cloneEntry)
}

export function canMutateConfigEntry(role: OperatorRole, entry: ConfigEntry) {
  return entry.mutableBy.includes(role)
}

export function getConfigEntriesForAudience(audience: ConfigAudience) {
  return canonicalConfigRegistry
    .filter((entry) => entry.audience === audience)
    .map(cloneEntry)
}

export function buildConfigPlaneState(role: OperatorRole): ConfigPlaneState {
  const accessibleEntries = canonicalConfigRegistry
    .filter((entry) => canMutateConfigEntry(role, entry))
    .map(cloneEntry)

  return {
    role,
    accessibleEntries,
    summary: {
      entryCount: accessibleEntries.length,
      reviewRequiredCount: accessibleEntries.filter((entry) => entry.requiresReview).length,
      overrideCount: accessibleEntries.filter((entry) => entry.source === 'override').length
    }
  }
}

export function getConfigPlaneAudit() {
  return {
    registry: getConfigPlaneRegistry(),
    audienceViews: {
      public: getConfigEntriesForAudience('public'),
      client: getConfigEntriesForAudience('client'),
      operator: getConfigEntriesForAudience('operator')
    },
    states: {
      super_admin: buildConfigPlaneState('super_admin'),
      content_manager: buildConfigPlaneState('content_manager'),
      support_operator: buildConfigPlaneState('support_operator')
    },
    proofScope: {
      functional: 'scope-aware config plane contract available',
      visible: 'pending actual config ui adoption',
      data: 'canonical config entries and override sources fixed',
      governance: 'mutation and review rules available'
    }
  }
}