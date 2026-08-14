import type { ApiAccessContext } from '@/lib/auth/api-access'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export type PrivacyTarget = {
  tenantId: string
  workspaceId: string | null
  brandId: string | null
}

function metadataString(access: ApiAccessContext, key: string) {
  const value = access.membership.metadata?.[key]
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

export async function resolvePrivacyTarget(access: ApiAccessContext, requestedWorkspaceId?: string | null): Promise<PrivacyTarget> {
  const ownTenantId = metadataString(access, 'operationalTenantId')
  const ownWorkspaceId = metadataString(access, 'operationalWorkspaceId')
  const ownBrandId = metadataString(access, 'operationalBrandId')
  const requested = requestedWorkspaceId?.trim() || null
  const isPlatformOwner = access.membership.role_key === 'platform_owner'

  if (!requested) {
    if (!ownTenantId) throw new Error('privacy_operational_tenant_missing')
    return { tenantId: ownTenantId, workspaceId: ownWorkspaceId, brandId: ownBrandId }
  }
  if (!isPlatformOwner && requested !== ownWorkspaceId) throw new Error('privacy_workspace_denied')

  const admin = createSupabaseAdminClient()
  const { data, error } = await admin.from('workspaces').select('id,tenant_id,brand_id').eq('id', requested).maybeSingle()
  if (error || !data) throw new Error('privacy_workspace_not_found')
  if (!isPlatformOwner && data.tenant_id !== ownTenantId) throw new Error('privacy_tenant_denied')
  return { tenantId: data.tenant_id, workspaceId: data.id, brandId: data.brand_id || null }
}
