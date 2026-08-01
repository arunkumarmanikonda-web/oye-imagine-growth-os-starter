export type RuntimeSurface = 'public' | 'client' | 'operator'

export type WorkspaceTruthInput = {
  host?: string | null
  pathname?: string | null
  requestedWorkspaceKey?: string | null
  sessionWorkspaceKey?: string | null
  surfaceHint?: RuntimeSurface | null
}

export type WorkspaceTruthResult = {
  canonicalWorkspaceKey: string
  resolvedWorkspaceKey: string
  surface: RuntimeSurface
  source: 'host' | 'request' | 'session' | 'default'
  brandName: string
  primaryDomain: string
  supportEmail: string
  clientBasePath: string
  operatorBasePath: string
  isCanonical: boolean
}

const canonicalWorkspaceKey = 'oye-imagine'

const workspaceAliases: Record<string, string> = {
  'oye-imagine': canonicalWorkspaceKey,
  'oyeimagine': canonicalWorkspaceKey,
  'oye imagine': canonicalWorkspaceKey,
  'oye !magine': canonicalWorkspaceKey
}

const hostWorkspaceMap: Record<string, string> = {
  'oyeimagine.com': canonicalWorkspaceKey,
  'www.oyeimagine.com': canonicalWorkspaceKey
}

function cleanText(value: string | null | undefined) {
  return (value ?? '').trim()
}

export function normalizeWorkspaceKey(value: string | null | undefined) {
  const cleaned = cleanText(value)
  if (!cleaned) return canonicalWorkspaceKey

  const lower = cleaned.toLowerCase()
  if (workspaceAliases[cleaned]) return workspaceAliases[cleaned]
  if (workspaceAliases[lower]) return workspaceAliases[lower]

  return lower.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || canonicalWorkspaceKey
}

export function normalizeHost(value: string | null | undefined) {
  const cleaned = cleanText(value).toLowerCase()
  if (!cleaned) return ''
  return cleaned.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
}

export function detectRuntimeSurface(pathname: string | null | undefined, surfaceHint?: RuntimeSurface | null): RuntimeSurface {
  if (surfaceHint) return surfaceHint

  const path = cleanText(pathname) || '/'
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  if (normalizedPath === '/admin' || normalizedPath.startsWith('/admin/')) return 'operator'
  if (normalizedPath === '/client' || normalizedPath.startsWith('/client/')) return 'client'
  return 'public'
}

export function resolveWorkspaceTruth(input: WorkspaceTruthInput): WorkspaceTruthResult {
  const normalizedHost = normalizeHost(input.host)
  const hostWorkspace = hostWorkspaceMap[normalizedHost]
  const requestedWorkspace = cleanText(input.requestedWorkspaceKey)
  const sessionWorkspace = cleanText(input.sessionWorkspaceKey)

  let resolvedWorkspaceKey = canonicalWorkspaceKey
  let source: WorkspaceTruthResult['source'] = 'default'

  if (hostWorkspace) {
    resolvedWorkspaceKey = normalizeWorkspaceKey(hostWorkspace)
    source = 'host'
  } else if (requestedWorkspace) {
    resolvedWorkspaceKey = normalizeWorkspaceKey(requestedWorkspace)
    source = 'request'
  } else if (sessionWorkspace) {
    resolvedWorkspaceKey = normalizeWorkspaceKey(sessionWorkspace)
    source = 'session'
  }

  return {
    canonicalWorkspaceKey,
    resolvedWorkspaceKey,
    surface: detectRuntimeSurface(input.pathname, input.surfaceHint),
    source,
    brandName: 'Oye !magine',
    primaryDomain: 'oyeimagine.com',
    supportEmail: 'hello@oyeimagine.com',
    clientBasePath: '/client',
    operatorBasePath: '/admin',
    isCanonical: resolvedWorkspaceKey === canonicalWorkspaceKey
  }
}

export function getWorkspaceTruthAudit() {
  return {
    canonicalWorkspaceKey,
    aliases: workspaceAliases,
    hostWorkspaceMap,
    supportedSurfaces: ['public', 'client', 'operator'],
    defaultPaths: {
      public: '/',
      client: '/client',
      operator: '/admin'
    }
  }
}