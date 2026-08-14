import { NextRequest, NextResponse } from 'next/server'
import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access'
import { createCustomRole, deleteCustomRole, updateCustomRole } from '@/lib/auth/access-control-admin'

function responseFor(error: unknown) {
  if (error instanceof ApiAccessError) return NextResponse.json({ ok: false, code: error.code }, { status: error.status })
  const message = error instanceof Error ? error.message : 'role_control_failed'
  return NextResponse.json({ ok: false, code: message.split(':')[0], message }, { status: 400 })
}

async function access() { return requireApiAccess({ lane: 'admin', permission: 'platform.access' }) }

export async function POST(request: NextRequest) {
  try {
    const verified = await access(); const body = await request.json()
    const result = await createCustomRole({
      access: verified,
      roleKey: String(body.roleKey ?? ''),
      roleName: String(body.roleName ?? ''),
      roleScope: ['platform','tenant','brand','workspace','campaign'].includes(body.roleScope) ? body.roleScope : 'workspace',
      baseRoleKey: String(body.baseRoleKey ?? 'viewer'),
      permissions: Array.isArray(body.permissions) ? body.permissions.map(String) : [],
      reason: String(body.reason ?? 'Super Admin created custom role.'),
    })
    return NextResponse.json({ ok: true, result }, { status: 201, headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) { return responseFor(error) }
}

export async function PATCH(request: NextRequest) {
  try {
    const verified = await access(); const body = await request.json()
    const result = await updateCustomRole({
      access: verified,
      roleKey: String(body.roleKey ?? ''),
      roleName: typeof body.roleName === 'string' ? body.roleName : undefined,
      baseRoleKey: typeof body.baseRoleKey === 'string' ? body.baseRoleKey : undefined,
      permissions: Array.isArray(body.permissions) ? body.permissions.map(String) : undefined,
      reason: String(body.reason ?? 'Super Admin updated custom role.'),
    })
    return NextResponse.json({ ok: true, result }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) { return responseFor(error) }
}

export async function DELETE(request: NextRequest) {
  try {
    const verified = await access(); const body = await request.json()
    const result = await deleteCustomRole({ access: verified, roleKey: String(body.roleKey ?? ''), reason: String(body.reason ?? 'Super Admin deleted custom role.') })
    return NextResponse.json({ ok: true, result }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) { return responseFor(error) }
}
