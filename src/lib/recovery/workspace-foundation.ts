export type WorkspaceRole = 'client' | 'operator'
export type WorkspaceSelectionSource = 'query' | 'cookie' | 'default'

export type CanonicalWorkspace = {
  workspaceId: string
  tenantId: string
  brandId: string
  tenantName: string
  brandName: string
  domain: string
  roleScopes: WorkspaceRole[]
}

export const ACTIVE_WORKSPACE_COOKIE_KEY = 'oye_active_workspace'

export const canonicalWorkspaces: CanonicalWorkspace[] = [
  {
    workspaceId: 'workspace_neejee_primary',
    tenantId: 'tenant_neejee',
    brandId: 'brand_neejee',
    tenantName: 'Neejee',
    brandName: 'Neejee',
    domain: 'neejee.com',
    roleScopes: ['client', 'operator'],
  },
  {
    workspaceId: 'workspace_oye_internal',
    tenantId: 'tenant_oye_internal',
    brandId: 'brand_oye_imagine',
    tenantName: 'Oye !magine',
    brandName: 'Oye !magine',
    domain: 'oyeimagine.com',
    roleScopes: ['operator'],
  },
]

export function listCanonicalWorkspaces() {
  return [...canonicalWorkspaces]
}

export function findWorkspaceById(workspaceId: string) {
  return canonicalWorkspaces.find((workspace) => workspace.workspaceId === workspaceId)
}

export function listWorkspacesForRole(role: WorkspaceRole) {
  return canonicalWorkspaces.filter((workspace) => workspace.roleScopes.includes(role))
}

export function resolveWorkspaceSelection(params: {
  role: WorkspaceRole
  requestedWorkspaceId?: string
  cookieWorkspaceId?: string
  allowedWorkspaceIds?: string[]
}) {
  const availableForRole = listWorkspacesForRole(params.role)
  const allowedSet =
    params.allowedWorkspaceIds && params.allowedWorkspaceIds.length > 0
      ? new Set(params.allowedWorkspaceIds)
      : null

  const available = availableForRole.filter((workspace) =>
    allowedSet ? allowedSet.has(workspace.workspaceId) : true,
  )

  const pickIfAllowed = (workspaceId?: string) => {
    if (!workspaceId) return undefined
    const workspace = canonicalWorkspaces.find((item) => item.workspaceId === workspaceId)
    if (!workspace) return undefined
    if (!workspace.roleScopes.includes(params.role)) return undefined
    if (allowedSet && !allowedSet.has(workspace.workspaceId)) return undefined
    return workspace
  }

  const requestedWorkspace = pickIfAllowed(params.requestedWorkspaceId)
  if (requestedWorkspace) {
    return {
      workspace: requestedWorkspace,
      source: 'query' as const,
      isStable: true,
      available,
    }
  }

  const cookieWorkspace = pickIfAllowed(params.cookieWorkspaceId)
  if (cookieWorkspace) {
    return {
      workspace: cookieWorkspace,
      source: 'cookie' as const,
      isStable: true,
      available,
    }
  }

  const defaultWorkspace = available[0] ?? availableForRole[0]
  if (!defaultWorkspace) {
    throw new Error(`No canonical workspace available for role: ${params.role}`)
  }

  return {
    workspace: defaultWorkspace,
    source: 'default' as const,
    isStable: false,
    available,
  }
}

export function buildWorkspaceContext(params: {
  role: WorkspaceRole
  requestedWorkspaceId?: string
  cookieWorkspaceId?: string
  allowedWorkspaceIds?: string[]
}) {
  const selection = resolveWorkspaceSelection(params)

  return {
    role: params.role,
    activeWorkspaceId: selection.workspace.workspaceId,
    activeTenantId: selection.workspace.tenantId,
    activeBrandId: selection.workspace.brandId,
    activeBrandName: selection.workspace.brandName,
    source: selection.source,
    isStable: selection.isStable,
    availableWorkspaces: selection.available.map((workspace) => ({
      workspaceId: workspace.workspaceId,
      brandName: workspace.brandName,
      tenantName: workspace.tenantName,
      domain: workspace.domain,
    })),
  }
}