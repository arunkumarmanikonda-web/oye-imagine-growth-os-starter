import { NextRequest, NextResponse } from 'next/server'
import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access'
import {
  createManagedUser,
  deleteManagedUser,
  getAccessControlSnapshot,
  requireManagedPasswordReset,
  updateManagedMembership,
} from '@/lib/auth/access-control-admin'

function errorResponse(error: unknown) {
  if (error instanceof ApiAccessError) return NextResponse.json({ ok: false, code: error.code }, { status: error.status })
  const message = error instanceof Error ? error.message : 'access_control_failed'
  return NextResponse.json({ ok: false, code: message.split(':')[0], message }, { status: 400 })
}

async function access() {
  return requireApiAccess({ lane: 'admin', permission: 'platform.access' })
}

export async function GET() {
  try {
    const verified = await access()
    return NextResponse.json({ ok: true, ...(await getAccessControlSnapshot(verified)) }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const verified = await access()
    const body = await request.json()
    const result = await createManagedUser({
      access: verified,
      email: String(body.email ?? ''),
      fullName: String(body.fullName ?? ''),
      roleKey: String(body.roleKey ?? ''),
      tenantId: String(body.tenantId ?? ''),
      brandId: String(body.brandId ?? ''),
      workspaceId: String(body.workspaceId ?? ''),
      temporaryPassword: typeof body.temporaryPassword === 'string' ? body.temporaryPassword : null,
      demoAccount: Boolean(body.demoAccount),
    })
    return NextResponse.json({ ok: true, result }, { status: 201, headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const verified = await access()
    const body = await request.json()
    if (body.action === 'require_password_reset') {
      const result = await requireManagedPasswordReset({
        access: verified,
        userId: String(body.userId ?? ''),
        temporaryPassword: typeof body.temporaryPassword === 'string' ? body.temporaryPassword : null,
        reason: String(body.reason ?? 'Super Admin required a credential reset.'),
      })
      return NextResponse.json({ ok: true, result }, { headers: { 'Cache-Control': 'private, no-store' } })
    }

    const result = await updateManagedMembership({
      access: verified,
      userId: String(body.userId ?? ''),
      membershipId: String(body.membershipId ?? ''),
      roleKey: typeof body.roleKey === 'string' ? body.roleKey : undefined,
      tenantId: typeof body.tenantId === 'string' ? body.tenantId : undefined,
      brandId: typeof body.brandId === 'string' ? body.brandId : undefined,
      workspaceId: typeof body.workspaceId === 'string' ? body.workspaceId : undefined,
      status: body.status === 'active' || body.status === 'suspended' || body.status === 'revoked' ? body.status : undefined,
      reason: String(body.reason ?? 'Super Admin membership update.'),
    })
    return NextResponse.json({ ok: true, result }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const verified = await access()
    const body = await request.json()
    const result = await deleteManagedUser({
      access: verified,
      userId: String(body.userId ?? ''),
      reason: String(body.reason ?? 'Super Admin deleted managed identity.'),
    })
    return NextResponse.json({ ok: true, result }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    return errorResponse(error)
  }
}
