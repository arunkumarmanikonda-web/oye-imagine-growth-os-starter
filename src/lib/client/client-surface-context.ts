import 'server-only'

import type { ApiVerifiedMembership } from '@/lib/auth/api-access'
import { requireWorkspaceIdentity } from '@/lib/auth/workspace-access'
import { buildDemoClientConciergeScope } from '@/lib/ai/concierge-retrieval-registry'
import type { ConciergeScope } from '@/lib/ai/concierge-retrieval-types'

function metadataString(membership: Pick<ApiVerifiedMembership, 'metadata'>, key: string) {
  const value = membership.metadata?.[key]
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

export function clientMembershipIsDemo(
  membership: Pick<ApiVerifiedMembership, 'metadata'>,
) {
  return membership.metadata?.demoAccount === true
}

export function clientMembershipDisplayName(
  membership: Pick<ApiVerifiedMembership, 'tenant_id' | 'brand_id' | 'metadata'>,
) {
  return (
    metadataString(membership, 'brandName') ??
    metadataString(membership, 'companyName') ??
    membership.brand_id?.trim() ??
    membership.tenant_id.trim()
  )
}

export function buildVerifiedClientConciergeScope(input: {
  subject: string
  membership: ApiVerifiedMembership
}): ConciergeScope {
  if (clientMembershipIsDemo(input.membership)) {
    return {
      ...buildDemoClientConciergeScope(),
      actorId: input.subject,
    }
  }

  return {
    actorId: input.subject,
    tenantId: input.membership.tenant_id,
    workspaceId: input.membership.workspace_id ?? undefined,
    brandId: input.membership.brand_id ?? undefined,
    audience: 'client',
    permissions: [],
  }
}

export async function requireClientSurfaceContext(redirectTo = '/client') {
  const identity = await requireWorkspaceIdentity({ lane: 'client', redirectTo })
  const membership = identity.membership as ApiVerifiedMembership

  return {
    identity,
    membership,
    displayName: clientMembershipDisplayName(membership),
    isDemo: clientMembershipIsDemo(membership),
    conciergeScope: buildVerifiedClientConciergeScope({
      subject: identity.subject,
      membership,
    }),
  }
}
