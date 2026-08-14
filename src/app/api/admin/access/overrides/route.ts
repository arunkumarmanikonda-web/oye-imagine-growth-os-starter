import { NextRequest, NextResponse } from 'next/server'
import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access'
import { revokePermissionOverride, setPermissionOverride } from '@/lib/auth/access-control-admin'

function errorResponse(error: unknown) {
  if (error instanceof ApiAccessError) return NextResponse.json({ ok: false, code: error.code }, { status: error.status })
  const message = error instanceof Error ? error.message : 'permission_control_failed'
  return NextResponse.json({ ok: false, code: message.split(':')[0], message }, { status: 400 })
}

export async function POST(request: NextRequest) {
  try {
    const access = await requireApiAccess({ lane: 'admin', permission: 'platform.access' })
    const body = await request.json()
    const result = await setPermissionOverride({
      access,
      userId: String(body.userId ?? ''),
      permissionKey: String(body.permissionKey ?? ''),
      effect: body.effect === 'deny' ? 'deny' : 'allow',
      reason: String(body.reason ?? ''),
      tenantId: typeof body.tenantId === 'string' && body.tenantId ? body.tenantId : null,
      brandId: typeof body.brandId === 'string' && body.brandId ? body.brandId : null,
      workspaceId: typeof body.workspaceId === 'string' && body.workspaceId ? body.workspaceId : null,
      validUntil: typeof body.validUntil === 'string' && body.validUntil ? body.validUntil : null,
    })
    return NextResponse.json({ ok: true, result }, { status: 201, headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const access = await requireApiAccess({ lane: 'admin', permission: 'platform.access' })
    const body = await request.json()
    const result = await revokePermissionOverride({
      access,
      overrideId: String(body.overrideId ?? ''),
      reason: String(body.reason ?? 'Super Admin revoked permission override.'),
    })
    return NextResponse.json({ ok: true, result }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    return errorResponse(error)
  }
}
