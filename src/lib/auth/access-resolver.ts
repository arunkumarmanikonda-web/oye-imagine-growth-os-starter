import type { SupabaseClient } from '@supabase/supabase-js'
import type { VerifiedMembership } from './verified-membership'
import {
  resolvePermissionDecision,
  type EffectivePermissionDecision,
  type PermissionOverride,
} from './permissions'

export type ResolvedPermissionSet = {
  rolePermissions: string[]
  overrides: PermissionOverride[]
}

export async function loadPermissionSet(input: {
  supabase: SupabaseClient<any, any, any>
  subject: string
  membership: VerifiedMembership
}): Promise<ResolvedPermissionSet> {
  const [{ data: roleRow, error: roleError }, { data: overrideRows, error: overrideError }] = await Promise.all([
    input.supabase
      .from('core_role_definitions')
      .select('permissions')
      .eq('role_key', input.membership.role_key)
      .maybeSingle(),
    input.supabase
      .from('core_user_permission_overrides')
      .select('override_id,user_id,tenant_id,brand_id,workspace_id,permission_key,effect,status,valid_from,valid_until')
      .eq('user_id', input.subject)
      .eq('status', 'active'),
  ])

  if (roleError) throw new Error(`role_permissions_unavailable:${roleError.message}`)
  if (overrideError) throw new Error(`permission_overrides_unavailable:${overrideError.message}`)

  return {
    rolePermissions: Array.isArray(roleRow?.permissions)
      ? roleRow.permissions.filter((value: unknown): value is string => typeof value === 'string')
      : [],
    overrides: (overrideRows ?? []) as PermissionOverride[],
  }
}

export function decidePermission(input: {
  roleKey: string
  membership: VerifiedMembership
  permissionSet: ResolvedPermissionSet
  permission: string
}): EffectivePermissionDecision {
  return resolvePermissionDecision({
    roleKey: input.roleKey,
    rolePermissions: input.permissionSet.rolePermissions,
    overrides: input.permissionSet.overrides,
    membership: input.membership,
    permission: input.permission,
  })
}
