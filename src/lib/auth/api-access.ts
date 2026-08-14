import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  membershipAllowsLane,
  type VerifiedAccessLane,
  type VerifiedMembership,
} from '@/lib/auth/verified-membership'

export type ApiVerifiedMembership = VerifiedMembership & {
  metadata?: Record<string, unknown> | null
}

export type ApiAccessContext = {
  subject: string
  email: string | null
  lane: VerifiedAccessLane
  membership: ApiVerifiedMembership
  memberships: ApiVerifiedMembership[]
}

export class ApiAccessError extends Error {
  status: 401 | 403 | 503
  code: 'unauthenticated' | 'access_denied' | 'access_control_unavailable'

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

export async function requireApiAccess(input: {
  lane: VerifiedAccessLane
  tenantId?: string | null
  workspaceId?: string | null
}): Promise<ApiAccessContext> {
  const supabase = await createSupabaseServerClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
  const subject = claimsData?.claims?.sub

  if (claimsError || typeof subject !== 'string' || !subject) {
    throw new ApiAccessError(401, 'unauthenticated', 'Verified sign-in is required.')
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

  const emailClaim = claimsData?.claims?.email
  return {
    subject,
    email: typeof emailClaim === 'string' ? emailClaim : null,
    lane: input.lane,
    membership,
    memberships,
  }
}
