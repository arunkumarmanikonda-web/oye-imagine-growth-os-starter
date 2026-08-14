import 'server-only'

import crypto from 'node:crypto'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import type { ApiAccessContext } from '@/lib/auth/api-access'

function assertPlatformOwner(access: ApiAccessContext) {
  if (access.membership.role_key !== 'platform_owner' || access.assuranceLevel !== 'aal2') throw new Error('platform_owner_aal2_required')
}
function id(prefix: string) { return `${prefix}_${crypto.randomUUID().replaceAll('-', '')}` }
export function generateTemporaryPassword() { return `Oye!${crypto.randomBytes(9).toString('base64url')}9a` }
function customRoleKey(value: string) {
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
  if (!normalized) throw new Error('valid_role_key_required')
  return normalized.startsWith('custom_') ? normalized : `custom_${normalized}`
}
function roleMembershipMetadata(role: any, extra?: Record<string, unknown>) {
  const metadata = role?.metadata && typeof role.metadata === 'object' ? role.metadata : {}
  return {
    ...extra,
    experienceRoleKey: typeof metadata.experienceRoleKey === 'string' ? metadata.experienceRoleKey : role.role_key,
    accessLane: metadata.accessLane === 'client' ? 'client' : 'admin',
    requiresMfa: typeof metadata.requiresMfa === 'boolean' ? metadata.requiresMfa : metadata.accessLane !== 'client',
  }
}

async function audit(input: { actor: string; target?: string | null; action: string; roleKey?: string | null; permissionKey?: string | null; tenantId?: string | null; brandId?: string | null; workspaceId?: string | null; reason?: string | null; before?: Record<string, unknown>; after?: Record<string, unknown>; metadata?: Record<string, unknown> }) {
  const admin = createSupabaseAdminClient()
  await admin.from('core_access_control_events').insert({ actor_user_id: input.actor, target_user_id: input.target ?? null, action: input.action, role_key: input.roleKey ?? null, permission_key: input.permissionKey ?? null, tenant_id: input.tenantId ?? null, brand_id: input.brandId ?? null, workspace_id: input.workspaceId ?? null, reason: input.reason ?? null, before_state: input.before ?? {}, after_state: input.after ?? {}, metadata: input.metadata ?? {} })
}

export async function getAccessControlSnapshot(access: ApiAccessContext) {
  assertPlatformOwner(access)
  const admin = createSupabaseAdminClient()
  const [userResult, membershipResult, roleResult, overrideResult, permissionResult] = await Promise.all([
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin.from('core_tenant_memberships').select('membership_id,tenant_id,user_id,role_key,brand_id,workspace_id,status,metadata,created_at,updated_at').order('created_at'),
    admin.from('core_role_definitions').select('role_key,role_name,role_scope,permissions,system_role,metadata,created_at,updated_at').order('role_name'),
    admin.from('core_user_permission_overrides').select('*').order('created_at', { ascending: false }).limit(2000),
    admin.from('core_permission_catalog').select('*').order('category').order('label'),
  ])
  if (userResult.error) throw new Error(`access_users_read_failed:${userResult.error.message}`)
  if (membershipResult.error) throw new Error(`access_memberships_read_failed:${membershipResult.error.message}`)
  if (roleResult.error) throw new Error(`access_roles_read_failed:${roleResult.error.message}`)
  if (overrideResult.error) throw new Error(`access_overrides_read_failed:${overrideResult.error.message}`)
  if (permissionResult.error) throw new Error(`permission_catalog_read_failed:${permissionResult.error.message}`)
  return {
    users: (userResult.data.users ?? []).map((user) => ({ id: user.id, email: user.email ?? null, createdAt: user.created_at, lastSignInAt: user.last_sign_in_at ?? null, mustChangePassword: user.app_metadata?.must_change_password === true, demoAccount: user.app_metadata?.demo_account === true, fullName: typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : null })),
    memberships: membershipResult.data ?? [], roles: roleResult.data ?? [], overrides: overrideResult.data ?? [], permissionCatalog: permissionResult.data ?? [],
  }
}

export async function createCustomRole(input: { access: ApiAccessContext; roleKey: string; roleName: string; roleScope: 'platform'|'tenant'|'brand'|'workspace'|'campaign'; baseRoleKey: string; permissions: string[]; reason: string }) {
  assertPlatformOwner(input.access)
  const admin = createSupabaseAdminClient()
  const key = customRoleKey(input.roleKey)
  const { data: baseRole, error: baseError } = await admin.from('core_role_definitions').select('role_key,metadata').eq('role_key', input.baseRoleKey).maybeSingle()
  if (baseError || !baseRole) throw new Error('base_role_not_found')
  const permissions = Array.from(new Set(input.permissions.map((value) => value.trim()).filter(Boolean)))
  const metadata = roleMembershipMetadata(baseRole, { experienceRoleKey: baseRole.role_key, customRole: true })
  const { data, error } = await admin.from('core_role_definitions').insert({ role_key: key, role_name: input.roleName.trim(), role_scope: input.roleScope, permissions, system_role: false, metadata }).select('*').single()
  if (error) throw new Error(`role_create_failed:${error.message}`)
  await audit({ actor: input.access.subject, action: 'role_created', roleKey: key, reason: input.reason, after: data })
  return data
}

export async function updateCustomRole(input: { access: ApiAccessContext; roleKey: string; roleName?: string; baseRoleKey?: string; permissions?: string[]; reason: string }) {
  assertPlatformOwner(input.access)
  const admin = createSupabaseAdminClient()
  const { data: before, error: beforeError } = await admin.from('core_role_definitions').select('*').eq('role_key', input.roleKey).maybeSingle()
  if (beforeError || !before) throw new Error('role_not_found')
  if (before.system_role) throw new Error('system_role_protected')
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (input.roleName?.trim()) patch.role_name = input.roleName.trim()
  if (input.permissions) patch.permissions = Array.from(new Set(input.permissions.map((value) => value.trim()).filter(Boolean)))
  if (input.baseRoleKey) {
    const { data: baseRole, error: baseError } = await admin.from('core_role_definitions').select('role_key,metadata').eq('role_key', input.baseRoleKey).maybeSingle()
    if (baseError || !baseRole) throw new Error('base_role_not_found')
    patch.metadata = roleMembershipMetadata(baseRole, { experienceRoleKey: baseRole.role_key, customRole: true })
  }
  const { data: after, error } = await admin.from('core_role_definitions').update(patch).eq('role_key', input.roleKey).select('*').single()
  if (error) throw new Error(`role_update_failed:${error.message}`)
  await audit({ actor: input.access.subject, action: 'role_updated', roleKey: input.roleKey, reason: input.reason, before, after })
  return after
}

export async function deleteCustomRole(input: { access: ApiAccessContext; roleKey: string; reason: string }) {
  assertPlatformOwner(input.access)
  const admin = createSupabaseAdminClient()
  const { data: role, error: roleError } = await admin.from('core_role_definitions').select('*').eq('role_key', input.roleKey).maybeSingle()
  if (roleError || !role) throw new Error('role_not_found')
  if (role.system_role) throw new Error('system_role_protected')
  const { count } = await admin.from('core_tenant_memberships').select('*', { count: 'exact', head: true }).eq('role_key', input.roleKey).in('status', ['active','invited','suspended'])
  if ((count ?? 0) > 0) throw new Error('role_in_use')
  const { error } = await admin.from('core_role_definitions').delete().eq('role_key', input.roleKey)
  if (error) throw new Error(`role_delete_failed:${error.message}`)
  await audit({ actor: input.access.subject, action: 'role_deleted', roleKey: input.roleKey, reason: input.reason, before: role })
  return { deleted: true, roleKey: input.roleKey }
}

export async function createManagedUser(input: { access: ApiAccessContext; email: string; fullName: string; roleKey: string; tenantId: string; brandId: string; workspaceId: string; temporaryPassword?: string | null; demoAccount?: boolean }) {
  assertPlatformOwner(input.access)
  const email = input.email.trim().toLowerCase(); const password = input.temporaryPassword?.trim() || generateTemporaryPassword()
  if (!email || !email.includes('@')) throw new Error('valid_email_required')
  if (!input.fullName.trim()) throw new Error('full_name_required')
  if (!input.roleKey.trim() || !input.tenantId.trim() || !input.brandId.trim() || !input.workspaceId.trim()) throw new Error('membership_scope_required')
  const admin = createSupabaseAdminClient()
  const { data: role, error: roleError } = await admin.from('core_role_definitions').select('role_key,metadata').eq('role_key', input.roleKey).maybeSingle()
  if (roleError || !role) throw new Error('unknown_role')
  const { data, error: createError } = await admin.auth.admin.createUser({ email, password, email_confirm: true, app_metadata: { must_change_password: true, demo_account: Boolean(input.demoAccount), provisioned_by: 'oye_super_admin' }, user_metadata: { full_name: input.fullName.trim() } })
  if (createError || !data.user) throw new Error(`user_create_failed:${createError?.message ?? 'unknown'}`)
  const membershipId = id('membership')
  const membershipMetadata = roleMembershipMetadata(role, { provisionedBy: input.access.subject, demoAccount: Boolean(input.demoAccount) })
  const { error: membershipError } = await admin.from('core_tenant_memberships').insert({ membership_id: membershipId, tenant_id: input.tenantId.trim(), user_id: data.user.id, role_key: input.roleKey.trim(), brand_id: input.brandId.trim(), workspace_id: input.workspaceId.trim(), status: 'active', metadata: membershipMetadata })
  if (membershipError) { await admin.auth.admin.deleteUser(data.user.id); throw new Error(`membership_create_failed:${membershipError.message}`) }
  await audit({ actor: input.access.subject, target: data.user.id, action: 'user_created', roleKey: input.roleKey, tenantId: input.tenantId, brandId: input.brandId, workspaceId: input.workspaceId, reason: input.demoAccount ? 'Disposable demo identity created.' : 'Managed identity created.', after: { email, membershipId, mustChangePassword: true, demoAccount: Boolean(input.demoAccount) } })
  return { userId: data.user.id, email, membershipId, temporaryPassword: password, mustChangePassword: true }
}

export async function updateManagedMembership(input: { access: ApiAccessContext; userId: string; membershipId: string; roleKey?: string; tenantId?: string; brandId?: string; workspaceId?: string; status?: 'active' | 'suspended' | 'revoked'; reason: string }) {
  assertPlatformOwner(input.access)
  const admin = createSupabaseAdminClient()
  const { data: before, error: beforeError } = await admin.from('core_tenant_memberships').select('*').eq('membership_id', input.membershipId).eq('user_id', input.userId).maybeSingle()
  if (beforeError || !before) throw new Error('membership_not_found')
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (input.roleKey) {
    const { data: role, error: roleError } = await admin.from('core_role_definitions').select('role_key,metadata').eq('role_key', input.roleKey).maybeSingle()
    if (roleError || !role) throw new Error('unknown_role')
    patch.role_key = input.roleKey
    patch.metadata = roleMembershipMetadata(role, { ...(before.metadata ?? {}), roleChangedBy: input.access.subject })
  }
  if (input.tenantId) patch.tenant_id = input.tenantId
  if (input.brandId) patch.brand_id = input.brandId
  if (input.workspaceId) patch.workspace_id = input.workspaceId
  if (input.status) patch.status = input.status
  if (before.role_key === 'platform_owner' && input.status && input.status !== 'active') {
    const { count } = await admin.from('core_tenant_memberships').select('*', { count: 'exact', head: true }).eq('role_key', 'platform_owner').eq('status', 'active')
    if ((count ?? 0) <= 1) throw new Error('last_platform_owner_protected')
  }
  const { data: after, error } = await admin.from('core_tenant_memberships').update(patch).eq('membership_id', input.membershipId).select('*').single()
  if (error) throw new Error(`membership_update_failed:${error.message}`)
  await audit({ actor: input.access.subject, target: input.userId, action: input.status === 'suspended' ? 'account_suspended' : input.status === 'active' && before.status !== 'active' ? 'account_reactivated' : 'membership_updated', roleKey: String(after.role_key), tenantId: String(after.tenant_id), brandId: after.brand_id ? String(after.brand_id) : null, workspaceId: after.workspace_id ? String(after.workspace_id) : null, reason: input.reason, before, after })
  return after
}

export async function requireManagedPasswordReset(input: { access: ApiAccessContext; userId: string; temporaryPassword?: string | null; reason: string }) {
  assertPlatformOwner(input.access)
  const password = input.temporaryPassword?.trim() || generateTemporaryPassword(); const admin = createSupabaseAdminClient()
  const { data: userData, error: getError } = await admin.auth.admin.getUserById(input.userId)
  if (getError || !userData.user) throw new Error('user_not_found')
  const { error } = await admin.auth.admin.updateUserById(input.userId, { password, app_metadata: { ...(userData.user.app_metadata ?? {}), must_change_password: true, password_reset_required_at: new Date().toISOString() } })
  if (error) throw new Error(`password_reset_failed:${error.message}`)
  await audit({ actor: input.access.subject, target: input.userId, action: 'password_reset_required', reason: input.reason, after: { mustChangePassword: true } })
  return { userId: input.userId, temporaryPassword: password, mustChangePassword: true }
}

export async function deleteManagedUser(input: { access: ApiAccessContext; userId: string; reason: string }) {
  assertPlatformOwner(input.access)
  if (input.userId === input.access.subject) throw new Error('cannot_delete_current_super_admin')
  const admin = createSupabaseAdminClient()
  const { data: memberships, error: membershipError } = await admin.from('core_tenant_memberships').select('*').eq('user_id', input.userId)
  if (membershipError) throw new Error(`membership_read_failed:${membershipError.message}`)
  if ((memberships ?? []).some((row: any) => row.role_key === 'platform_owner' && row.status === 'active')) {
    const { count } = await admin.from('core_tenant_memberships').select('*', { count: 'exact', head: true }).eq('role_key', 'platform_owner').eq('status', 'active')
    if ((count ?? 0) <= 1) throw new Error('last_platform_owner_protected')
  }
  await admin.from('core_user_permission_overrides').delete().eq('user_id', input.userId)
  await admin.from('core_workspace_role_assignments').delete().eq('user_id', input.userId)
  const { error: deleteMembershipError } = await admin.from('core_tenant_memberships').delete().eq('user_id', input.userId)
  if (deleteMembershipError) throw new Error(`membership_delete_failed:${deleteMembershipError.message}`)
  const { error: deleteUserError } = await admin.auth.admin.deleteUser(input.userId)
  if (deleteUserError) throw new Error(`user_delete_failed:${deleteUserError.message}`)
  await audit({ actor: input.access.subject, target: input.userId, action: 'user_deleted', reason: input.reason, before: { memberships: memberships ?? [] } })
  return { deleted: true, userId: input.userId }
}

export async function setPermissionOverride(input: { access: ApiAccessContext; userId: string; permissionKey: string; effect: 'allow' | 'deny'; reason: string; tenantId?: string | null; brandId?: string | null; workspaceId?: string | null; validUntil?: string | null }) {
  assertPlatformOwner(input.access)
  const permissionKey = input.permissionKey.trim()
  if (!permissionKey || !input.reason.trim()) throw new Error('permission_and_reason_required')
  if (input.userId === input.access.subject && input.effect === 'deny' && (permissionKey === '*' || permissionKey === 'platform.access' || permissionKey === 'platform.*')) throw new Error('self_lockout_protected')
  const admin = createSupabaseAdminClient(); const overrideId = id('perm')
  const row = { override_id: overrideId, user_id: input.userId, tenant_id: input.tenantId ?? null, brand_id: input.brandId ?? null, workspace_id: input.workspaceId ?? null, permission_key: permissionKey, effect: input.effect, status: 'active', reason: input.reason.trim(), valid_until: input.validUntil ?? null, issued_by: input.access.subject }
  const { error } = await admin.from('core_user_permission_overrides').insert(row)
  if (error) throw new Error(`permission_override_failed:${error.message}`)
  await audit({ actor: input.access.subject, target: input.userId, action: input.effect === 'allow' ? 'permission_allowed' : 'permission_denied', permissionKey, tenantId: input.tenantId, brandId: input.brandId, workspaceId: input.workspaceId, reason: input.reason, after: row })
  return row
}

export async function revokePermissionOverride(input: { access: ApiAccessContext; overrideId: string; reason: string }) {
  assertPlatformOwner(input.access); const admin = createSupabaseAdminClient()
  const { data: before, error: readError } = await admin.from('core_user_permission_overrides').select('*').eq('override_id', input.overrideId).maybeSingle()
  if (readError || !before) throw new Error('permission_override_not_found')
  const revokedAt = new Date().toISOString()
  const { error } = await admin.from('core_user_permission_overrides').update({ status: 'revoked', revoked_by: input.access.subject, revoked_at: revokedAt, updated_at: revokedAt }).eq('override_id', input.overrideId)
  if (error) throw new Error(`permission_revoke_failed:${error.message}`)
  await audit({ actor: input.access.subject, target: before.user_id, action: 'permission_revoked', permissionKey: before.permission_key, tenantId: before.tenant_id, brandId: before.brand_id, workspaceId: before.workspace_id, reason: input.reason, before, after: { ...before, status: 'revoked', revoked_at: revokedAt } })
  return { overrideId: input.overrideId, revoked: true }
}
