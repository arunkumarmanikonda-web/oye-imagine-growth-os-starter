import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  membershipAllowsLane,
  type VerifiedAccessLane,
  type VerifiedMembership,
} from '@/lib/auth/verified-membership'
import { decidePermission, loadPermissionSet, type ResolvedPermissionSet } from '@/lib/auth/access-resolver'

export type ApiVerifiedMembership = VerifiedMembership & {
  metadata?: Record<string, unknown> | null
}

export type ApiAccessContext = {
  subject: string
  email: string | null
  lane: VerifiedAccessLane
  membership: ApiVerifiedMembership
  memberships: ApiVerifiedMembership[]
  assuranceLevel: 'aal1' | 'aal2'
  permissionSet: ResolvedPermissionSet
}

export class ApiAccessError extends Error {
  status: 401 | 403 | 503
  code:
    | 'unauthenticated'
    | 'access_denied'
    | 'mfa_required'
    | 'password_change_required'
    | 'access_control_unavailable'

  constructor(
    status: 401 | 403 | 503,
    code: ApiAccessError['code'],
    message: string,
  ) {
    super(message)
    this.name = 'ApiAccessError'
    this.status = status
    this.code = code
  }
}

function metadataString(
  membership: ApiVerifiedMembership,
  key: 'operationalTenantId' | 'operationalBrandId' | 'operationalWorkspaceId',
) {
  const value = membership.metadata?.[key]
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function mustChangePassword(claims: Record<string, unknown> | undefined) {
  const appMetadata = claims?.app_metadata
  return Boolean(
    appMetadata &&
      typeof appMetadata === 'object' &&
      (appMetadata as Record<string, unknown>).must_change_password === true,
  )
}

export function membershipMatchesTenant(
  membership: ApiVerifiedMembership,
  tenantId: string,
) {
  const requested = tenantId.trim()
  return (
    requested.length > 0 &&
    (membership.role_key === 'platform_owner' ||
      membership.tenant_id === requested ||
      metadataString(membership, 'operationalTenantId') === requested)
  )
}

export function membershipMatchesWorkspace(
  membership: ApiVerifiedMembership,
  workspaceId: string,
) {
  const requested = workspaceId.trim()
  return (
    requested.length > 0 &&
    (membership.role_key === 'platform_owner' ||
      membership.workspace_id === requested ||
      metadataString(membership, 'operationalWorkspaceId') === requested)
  )
}

export function selectApiMembership(input: {
  memberships: ApiVerifiedMembership[]
  lane: VerifiedAccessLane
  tenantId?: string | null
  workspaceId?: string | null
}): ApiVerifiedMembership | null {
  const eligible = input.memberships.filter((membership) =>
    membershipAllowsLane(membership, input.lane),
  )

  return (
    eligible.find((membership) => {
      if (input.tenantId && !membershipMatchesTenant(membership, input.tenantId)) {
        return false
      }
      if (
        input.workspaceId &&
        !membershipMatchesWorkspace(membership, input.workspaceId)
      ) {
        return false
      }
      return true
    }) ?? null
  )
}

export function privilegedAccessRequiresAal2(lane: VerifiedAccessLane) {
  return lane === 'admin'
}

export function assuranceLevelAllowsLane(
  lane: VerifiedAccessLane,
  currentLevel: string | null | undefined,
) {
  return !privilegedAccessRequiresAal2(lane) || currentLevel === 'aal2'
}

export async function requireApiAccess(input: {
  lane: VerifiedAccessLane
  tenantId?: string | null
  workspaceId?: string | null
  permission?: string | null
}): Promise<ApiAccessContext> {
  const supabase = await createSupabaseServerClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
  const claims = claimsData?.claims as Record<string, unknown> | undefined
  const subject = claims?.sub

  if (claimsError || typeof subject !== 'string' || !subject) {
    throw new ApiAccessError(401, 'unauthenticated', 'Verified sign-in is required.')
  }

  if (mustChangePassword(claims)) {
    throw new ApiAccessError(403, 'password_change_required', 'A password change is required before this account can continue.')
  }

  const { data: membershipRows, error: membershipError } = await supabase
    .from('core_tenant_memberships')
    .select(
      'membership_id,tenant_id,user_id,role_key,brand_id,workspace_id,status,metadata',
    )
    .eq('user_id', subject)
    .eq('status', 'active')

  if (membershipError) {
    throw new ApiAccessError(
      503,
      'access_control_unavailable',
      'Authorization control plane is unavailable.',
    )
  }

  const memberships = (membershipRows ?? []) as ApiVerifiedMembership[]
  const membership = selectApiMembership({
    memberships,
    lane: input.lane,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
  })

  if (!membership) {
    throw new ApiAccessError(
      403,
      'access_denied',
      'The signed-in identity is not authorized for this resource.',
    )
  }

  let assuranceLevel: 'aal1' | 'aal2' = 'aal1'
  if (privilegedAccessRequiresAal2(input.lane)) {
    const { data: aalData, error: aalError } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

    if (aalError) {
      throw new ApiAccessError(
        503,
        'access_control_unavailable',
        'MFA assurance could not be verified.',
      )
    }

    assuranceLevel = aalData.currentLevel === 'aal2' ? 'aal2' : 'aal1'
    if (!assuranceLevelAllowsLane(input.lane, assuranceLevel)) {
      throw new ApiAccessError(
        403,
        'mfa_required',
        'Multi-factor authentication is required for privileged access.',
      )
    }
  }

  let permissionSet: ResolvedPermissionSet
  try {
    permissionSet = await loadPermissionSet({ supabase, subject, membership })
  } catch {
    throw new ApiAccessError(
      503,
      'access_control_unavailable',
      'Permission controls are unavailable.',
    )
  }

  if (input.permission) {
    const decision = decidePermission({
      roleKey: membership.role_key,
      membership,
      permissionSet,
      permission: input.permission,
    })
    if (!decision.allowed) {
      throw new ApiAccessError(
        403,
        'access_denied',
        `Permission ${input.permission} is not granted for this identity.`,
      )
    }
  }

  const emailClaim = claims?.email
  return {
    subject,
    email: typeof emailClaim === 'string' ? emailClaim : null,
    lane: input.lane,
    membership,
    memberships,
    assuranceLevel,
    permissionSet,
  }
}
