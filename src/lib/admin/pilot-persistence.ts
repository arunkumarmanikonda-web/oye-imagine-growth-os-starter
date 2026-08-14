import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import type { ApiVerifiedMembership } from '@/lib/auth/api-access'
import { createDefaultPilotFixture } from '@/lib/admin/pilot-fixtures'
import { createPilotRecord, type NeejeePilotInput, type NeejeePilotRecord } from '@/lib/admin/pilot-schema'
import { getWorkspaceDisplayName } from '@/lib/admin/workspace-branding'

const PILOT_SETTING_KEY = 'pilot.profile.v1'

function operationalId(
  membership: ApiVerifiedMembership,
  metadataKey: 'operationalTenantId' | 'operationalBrandId' | 'operationalWorkspaceId',
  fallback: string | null | undefined,
) {
  const value = membership.metadata?.[metadataKey]
  if (typeof value === 'string' && value.trim()) return value.trim()
  return typeof fallback === 'string' && fallback.trim() ? fallback.trim() : null
}

function contextFromMembership(membership: ApiVerifiedMembership) {
  const tenantId = operationalId(membership, 'operationalTenantId', membership.tenant_id)
  const brandId = operationalId(membership, 'operationalBrandId', membership.brand_id)
  const workspaceId = operationalId(membership, 'operationalWorkspaceId', membership.workspace_id)

  if (!tenantId || !workspaceId) {
    throw new Error('pilot_operational_context_missing')
  }

  return { tenantId, brandId, workspaceId }
}

export async function loadPilotProfile(
  membership: ApiVerifiedMembership,
): Promise<NeejeePilotRecord> {
  const { workspaceId } = contextFromMembership(membership)
  const admin = createSupabaseAdminClient()
  const { data, error } = await admin
    .from('workspace_settings')
    .select('value,updated_at')
    .eq('workspace_id', workspaceId)
    .eq('key', PILOT_SETTING_KEY)
    .maybeSingle()

  if (error) throw new Error(`pilot_profile_read_failed:${error.message}`)

  if (!data?.value || typeof data.value !== 'object' || Array.isArray(data.value)) {
    return createDefaultPilotFixture({ workspaceDisplayName: getWorkspaceDisplayName() })
  }

  return createPilotRecord({
    ...(data.value as NeejeePilotInput),
    workspaceDisplayName:
      (data.value as NeejeePilotInput).workspaceDisplayName ?? getWorkspaceDisplayName(),
    lastUpdatedAt:
      (data.value as NeejeePilotInput).lastUpdatedAt ?? data.updated_at ?? new Date().toISOString(),
  })
}

export async function savePilotProfile(input: {
  membership: ApiVerifiedMembership
  actorUserId: string
  actorEmail?: string | null
  patch: NeejeePilotInput
}): Promise<NeejeePilotRecord> {
  const { tenantId, brandId, workspaceId } = contextFromMembership(input.membership)
  const current = await loadPilotProfile(input.membership)
  const pilot = createPilotRecord({
    ...current,
    ...input.patch,
    id: input.patch.id ?? current.id ?? 'neejee-pilot',
    workspaceDisplayName:
      input.patch.workspaceDisplayName ?? current.workspaceDisplayName ?? getWorkspaceDisplayName(),
    lastUpdatedAt: new Date().toISOString(),
  })

  const admin = createSupabaseAdminClient()
  const payload = {
    tenant_id: tenantId,
    brand_id: brandId,
    workspace_id: workspaceId,
    key: PILOT_SETTING_KEY,
    value: pilot,
    updated_by_user_id: input.actorUserId,
    updated_by_email: input.actorEmail ?? null,
    created_by_user_id: input.actorUserId,
    created_by_email: input.actorEmail ?? null,
  }

  const { error } = await admin
    .from('workspace_settings')
    .upsert(payload, { onConflict: 'workspace_id,key', ignoreDuplicates: false })

  if (error) throw new Error(`pilot_profile_write_failed:${error.message}`)
  return pilot
}
