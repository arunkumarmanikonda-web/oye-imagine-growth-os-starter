import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const TOKEN_SHA256 = '694c26fe5d771bddafbf05d6a7fdad5e12d196bae0a7f0362d1e8614698ec775'
const INTERNAL_SCOPE = {
  tenant_id: 'tenant_oye_internal',
  brand_id: 'brand_oye_imagine',
  workspace_id: 'workspace_oye_internal',
}

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } })
}

function validToken(value: string) {
  if (!value) return false
  const actual = crypto.createHash('sha256').update(value).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(TOKEN_SHA256))
}

function temporaryPassword() {
  return `Oye!${crypto.randomBytes(10).toString('base64url')}9aZ`
}

export async function GET(request: NextRequest) {
  if (process.env.VERCEL_ENV !== 'preview') return json(404, { ok: false, code: 'preview_only' })
  if (!validToken(request.nextUrl.searchParams.get('token') ?? '')) return json(403, { ok: false, code: 'invalid_one_time_token' })

  const admin = createSupabaseAdminClient()
  const { data: listed, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (listError) return json(500, { ok: false, code: 'list_users_failed', message: listError.message })

  const knownUsers = [...(listed.users ?? [])]
  const existingOwner = knownUsers.find((user) => user.email?.toLowerCase() === 'admin@oyeimagine.com')
  if (existingOwner?.app_metadata?.access_bootstrap_completed_at) {
    return json(409, { ok: false, code: 'bootstrap_already_completed', completedAt: existingOwner.app_metadata.access_bootstrap_completed_at })
  }

  const password = temporaryPassword()
  const now = new Date().toISOString()

  async function ensureIdentity(input: { email: string; fullName: string; roleKey: string; demoAccount: boolean }) {
    let user = knownUsers.find((candidate) => candidate.email?.toLowerCase() === input.email.toLowerCase())
    const appMetadata = {
      ...(user?.app_metadata ?? {}),
      must_change_password: true,
      demo_account: input.demoAccount,
      provisioned_by: 'oye_preview_access_bootstrap',
      password_reset_required_at: now,
    }
    const userMetadata = {
      ...(user?.user_metadata ?? {}),
      full_name: input.fullName,
      ...(input.demoAccount ? { demo_role_key: input.roleKey } : {}),
    }

    if (user) {
      const { data, error } = await admin.auth.admin.updateUserById(user.id, {
        password,
        email_confirm: true,
        app_metadata: appMetadata,
        user_metadata: userMetadata,
      })
      if (error || !data.user) throw new Error(`identity_update_failed:${input.email}:${error?.message ?? 'unknown'}`)
      user = data.user
    } else {
      const { data, error } = await admin.auth.admin.createUser({
        email: input.email,
        password,
        email_confirm: true,
        app_metadata: appMetadata,
        user_metadata: userMetadata,
      })
      if (error || !data.user) throw new Error(`identity_create_failed:${input.email}:${error?.message ?? 'unknown'}`)
      user = data.user
      knownUsers.push(data.user)
    }

    return user
  }

  try {
    const owner = await ensureIdentity({
      email: 'admin@oyeimagine.com',
      fullName: 'Oye Imagine Super Admin',
      roleKey: 'platform_owner',
      demoAccount: false,
    })

    const { error: ownerMembershipError } = await admin.from('core_tenant_memberships').upsert({
      membership_id: 'membership_platform_owner_primary',
      ...INTERNAL_SCOPE,
      user_id: owner.id,
      role_key: 'platform_owner',
      status: 'active',
      authority_limits: {},
      metadata: {
        accessLane: 'admin',
        requiresMfa: true,
        experienceRoleKey: 'platform_owner',
        provisionedBy: 'oye_preview_access_bootstrap',
      },
    }, { onConflict: 'membership_id' })
    if (ownerMembershipError) throw new Error(`owner_membership_failed:${ownerMembershipError.message}`)

    const { data: roles, error: rolesError } = await admin
      .from('core_role_definitions')
      .select('role_key,role_name,metadata,system_role')
      .eq('system_role', true)
      .neq('role_key', 'platform_owner')
      .order('role_key')
    if (rolesError) throw new Error(`roles_read_failed:${rolesError.message}`)

    const demoUsers: Array<{ email: string; role: string }> = []
    for (const role of roles ?? []) {
      const roleKey = String(role.role_key)
      const email = `demo.${roleKey.replaceAll('_', '-')}@oyeimagine.com`
      const demo = await ensureIdentity({
        email,
        fullName: `Demo ${String(role.role_name)}`,
        roleKey,
        demoAccount: true,
      })
      const roleMetadata = role.metadata && typeof role.metadata === 'object' && !Array.isArray(role.metadata) ? role.metadata : {}
      const { error: membershipError } = await admin.from('core_tenant_memberships').upsert({
        membership_id: `membership_demo_${roleKey}`,
        ...INTERNAL_SCOPE,
        user_id: demo.id,
        role_key: roleKey,
        status: 'active',
        authority_limits: {},
        metadata: {
          ...roleMetadata,
          demoAccount: true,
          provisionedBy: 'oye_preview_access_bootstrap',
        },
      }, { onConflict: 'membership_id' })
      if (membershipError) throw new Error(`demo_membership_failed:${roleKey}:${membershipError.message}`)
      demoUsers.push({ email, role: roleKey })
    }

    const { data: refreshedOwner, error: refreshError } = await admin.auth.admin.getUserById(owner.id)
    if (refreshError || !refreshedOwner.user) throw new Error(`owner_refresh_failed:${refreshError?.message ?? 'unknown'}`)
    const { error: completionError } = await admin.auth.admin.updateUserById(owner.id, {
      app_metadata: {
        ...(refreshedOwner.user.app_metadata ?? {}),
        must_change_password: true,
        demo_account: false,
        provisioned_by: 'oye_preview_access_bootstrap',
        password_reset_required_at: now,
        access_bootstrap_completed_at: now,
      },
    })
    if (completionError) throw new Error(`completion_marker_failed:${completionError.message}`)

    return json(200, {
      ok: true,
      completedAt: now,
      temporaryPassword: password,
      superAdmin: { email: 'admin@oyeimagine.com', role: 'platform_owner', mustChangePassword: true, requiresMfa: true },
      demoUsers,
    })
  } catch (error) {
    return json(500, { ok: false, code: 'bootstrap_failed', message: error instanceof Error ? error.message : 'unknown' })
  }
}
