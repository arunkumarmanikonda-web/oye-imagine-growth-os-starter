import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BOOTSTRAP_TOKEN_SHA256 = 'fe7974b6ddce3830be3fc3be9845560b2813fb0a0e8df67073e767a017cd5a1d'
const SUPER_ADMIN_EMAIL = 'admin@oyeimagine.com'
const INTERNAL_SCOPE = {
  tenant_id: 'tenant_oye_internal',
  brand_id: 'brand_oye_imagine',
  workspace_id: 'workspace_oye_internal',
}

function digest(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && crypto.timingSafeEqual(left, right)
}

function strongTemporaryPassword(value: string) {
  return value.length >= 12 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value)
}

function reply(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store, private' } })
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') ?? ''
  const temporaryPassword = request.nextUrl.searchParams.get('password') ?? ''

  if (!token || !safeEqual(digest(token), BOOTSTRAP_TOKEN_SHA256)) return reply(403, { ok: false, code: 'invalid_bootstrap_token' })
  if (!strongTemporaryPassword(temporaryPassword)) return reply(400, { ok: false, code: 'temporary_password_policy_failed' })

  const admin = createSupabaseAdminClient()
  const { data: listed, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (listError) return reply(500, { ok: false, code: 'list_users_failed' })

  const users = [...(listed.users ?? [])]
  let superAdmin = users.find((user) => user.email?.toLowerCase() === SUPER_ADMIN_EMAIL)

  if (superAdmin?.app_metadata?.access_bootstrap_completed_at) {
    return reply(409, { ok: false, code: 'bootstrap_already_completed', completedAt: superAdmin.app_metadata.access_bootstrap_completed_at })
  }

  if (!superAdmin) {
    const { data, error } = await admin.auth.admin.createUser({
      email: SUPER_ADMIN_EMAIL,
      password: temporaryPassword,
      email_confirm: true,
      app_metadata: {
        must_change_password: true,
        demo_account: false,
        provisioned_by: 'oye_super_admin_bootstrap',
      },
      user_metadata: { full_name: 'Arun Manikonda', role: 'platform_admin' },
    })
    if (error || !data.user) return reply(500, { ok: false, code: 'super_admin_create_failed' })
    superAdmin = data.user
    users.push(data.user)
  } else {
    const { data, error } = await admin.auth.admin.updateUserById(superAdmin.id, {
      password: temporaryPassword,
      app_metadata: {
        ...(superAdmin.app_metadata ?? {}),
        must_change_password: true,
        demo_account: false,
        provisioned_by: 'oye_super_admin_bootstrap',
        password_reset_required_at: new Date().toISOString(),
      },
      user_metadata: { ...(superAdmin.user_metadata ?? {}), full_name: 'Arun Manikonda', role: 'platform_admin' },
    })
    if (error || !data.user) return reply(500, { ok: false, code: 'super_admin_update_failed' })
    superAdmin = data.user
  }

  const { error: superMembershipError } = await admin.from('core_tenant_memberships').upsert({
    membership_id: 'membership_platform_owner_primary',
    ...INTERNAL_SCOPE,
    user_id: superAdmin.id,
    role_key: 'platform_owner',
    status: 'active',
    authority_limits: {},
    metadata: {
      accessLane: 'admin',
      requiresMfa: true,
      experienceRoleKey: 'platform_owner',
      provisionedBy: 'oye_super_admin_bootstrap',
    },
  }, { onConflict: 'membership_id' })
  if (superMembershipError) return reply(500, { ok: false, code: 'super_admin_membership_failed' })

  const { data: roles, error: rolesError } = await admin
    .from('core_role_definitions')
    .select('role_key,role_name,metadata,system_role')
    .eq('system_role', true)
    .neq('role_key', 'platform_owner')
    .order('role_key')
  if (rolesError) return reply(500, { ok: false, code: 'role_read_failed' })

  const issued: Array<{ email: string; role: string }> = []

  for (const role of roles ?? []) {
    const roleKey = String(role.role_key)
    const email = `demo.${roleKey.replaceAll('_', '-')}@oyeimagine.com`
    const fullName = `Demo ${String(role.role_name)}`
    let user = users.find((item) => item.email?.toLowerCase() === email.toLowerCase())

    if (!user) {
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password: temporaryPassword,
        email_confirm: true,
        app_metadata: {
          must_change_password: true,
          demo_account: true,
          provisioned_by: 'oye_super_admin_bootstrap',
        },
        user_metadata: { full_name: fullName, demo_role_key: roleKey },
      })
      if (error || !data.user) return reply(500, { ok: false, code: 'demo_user_create_failed', role: roleKey })
      user = data.user
      users.push(data.user)
    } else {
      const { data, error } = await admin.auth.admin.updateUserById(user.id, {
        password: temporaryPassword,
        app_metadata: {
          ...(user.app_metadata ?? {}),
          must_change_password: true,
          demo_account: true,
          provisioned_by: 'oye_super_admin_bootstrap',
          password_reset_required_at: new Date().toISOString(),
        },
        user_metadata: { ...(user.user_metadata ?? {}), full_name: fullName, demo_role_key: roleKey },
      })
      if (error || !data.user) return reply(500, { ok: false, code: 'demo_user_update_failed', role: roleKey })
      user = data.user
    }

    const roleMetadata = role.metadata && typeof role.metadata === 'object' && !Array.isArray(role.metadata) ? role.metadata : {}
    const { error: membershipError } = await admin.from('core_tenant_memberships').upsert({
      membership_id: `membership_demo_${roleKey}`,
      ...INTERNAL_SCOPE,
      user_id: user.id,
      role_key: roleKey,
      status: 'active',
      authority_limits: {},
      metadata: { ...roleMetadata, demoAccount: true, provisionedBy: 'oye_super_admin_bootstrap' },
    }, { onConflict: 'membership_id' })
    if (membershipError) return reply(500, { ok: false, code: 'demo_membership_failed', role: roleKey })

    issued.push({ email, role: roleKey })
  }

  const completedAt = new Date().toISOString()
  const { error: completionError } = await admin.auth.admin.updateUserById(superAdmin.id, {
    app_metadata: { ...(superAdmin.app_metadata ?? {}), must_change_password: true, demo_account: false, provisioned_by: 'oye_super_admin_bootstrap', access_bootstrap_completed_at: completedAt },
  })
  if (completionError) return reply(500, { ok: false, code: 'bootstrap_completion_mark_failed' })

  return reply(200, {
    ok: true,
    completedAt,
    superAdmin: { email: SUPER_ADMIN_EMAIL, role: 'platform_owner', mustChangePassword: true },
    demoUsers: issued,
    temporaryPasswordReturned: false,
  })
}
