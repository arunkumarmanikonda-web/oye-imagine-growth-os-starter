import { NextRequest, NextResponse } from 'next/server'
import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access'
import { createManagedUser, getAccessControlSnapshot, requireManagedPasswordReset } from '@/lib/auth/access-control-admin'

const scope = {
  tenantId: 'tenant_oye_internal',
  brandId: 'brand_oye_imagine',
  workspaceId: 'workspace_oye_internal',
}

const demoRoles = [
  ['account_manager', 'demo.account-manager@oyeimagine.com', 'Demo Account Manager'],
  ['analyst', 'demo.analyst@oyeimagine.com', 'Demo Analyst'],
  ['brand_manager', 'demo.brand-manager@oyeimagine.com', 'Demo Brand Manager'],
  ['client_operator', 'demo.client-operator@oyeimagine.com', 'Demo Client Operator'],
  ['content_approver', 'demo.content-approver@oyeimagine.com', 'Demo Content Approver'],
  ['designer', 'demo.designer@oyeimagine.com', 'Demo Designer'],
  ['digital_marketer', 'demo.digital-marketer@oyeimagine.com', 'Demo Digital Marketer'],
  ['finance_approver', 'demo.finance-approver@oyeimagine.com', 'Demo Finance Approver'],
  ['partner_specialist', 'demo.partner-specialist@oyeimagine.com', 'Demo Partner Specialist'],
  ['tenant_admin', 'demo.tenant-admin@oyeimagine.com', 'Demo Tenant Admin'],
  ['viewer', 'demo.viewer@oyeimagine.com', 'Demo Viewer'],
] as const

function errorResponse(error: unknown) {
  if (error instanceof ApiAccessError) return NextResponse.json({ ok: false, code: error.code }, { status: error.status })
  const message = error instanceof Error ? error.message : 'demo_bootstrap_failed'
  return NextResponse.json({ ok: false, code: message.split(':')[0], message }, { status: 400 })
}

export async function POST(request: NextRequest) {
  try {
    const access = await requireApiAccess({ lane: 'admin', permission: 'platform.access' })
    const body = await request.json().catch(() => ({}))
    const sharedTemporaryPassword = typeof body.temporaryPassword === 'string' && body.temporaryPassword.trim()
      ? body.temporaryPassword.trim()
      : null

    const before = await getAccessControlSnapshot(access)
    const existingByEmail = new Map(before.users.filter((user) => user.email).map((user) => [String(user.email).toLowerCase(), user]))
    const results: Array<Record<string, unknown>> = []

    for (const [roleKey, email, fullName] of demoRoles) {
      const existing = existingByEmail.get(email)
      if (existing) {
        results.push({ email, roleKey, status: 'already_exists', userId: existing.id, mustChangePassword: existing.mustChangePassword, demoAccount: existing.demoAccount })
        continue
      }

      const created = await createManagedUser({
        access,
        email,
        fullName,
        roleKey,
        ...scope,
        temporaryPassword: sharedTemporaryPassword,
        demoAccount: true,
      })
      results.push({ ...created, roleKey, status: 'created' })
    }

    let superAdminReset: Record<string, unknown> | null = null
    if (body.resetCurrentSuperAdmin === true) {
      const temporaryPassword = typeof body.superAdminTemporaryPassword === 'string' && body.superAdminTemporaryPassword.trim()
        ? body.superAdminTemporaryPassword.trim()
        : null
      superAdminReset = await requireManagedPasswordReset({
        access,
        userId: access.subject,
        temporaryPassword,
        reason: 'Platform Owner initiated launch credential bootstrap.',
      })
    }

    return NextResponse.json(
      {
        ok: true,
        scope,
        results,
        superAdminReset,
        warning: 'Temporary passwords are returned only in this response. Store them securely and require the user to change them at first login.',
      },
      { headers: { 'Cache-Control': 'private, no-store' } },
    )
  } catch (error) {
    return errorResponse(error)
  }
}
