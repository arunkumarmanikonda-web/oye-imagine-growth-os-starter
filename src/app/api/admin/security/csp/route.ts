import { NextRequest, NextResponse } from 'next/server'
import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access'
import { listCspTelemetry } from '@/lib/security/csp-telemetry'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } })
}

export async function GET(request: NextRequest) {
  try {
    const access = await requireApiAccess({ lane: 'admin' })
    if (access.membership.role_key !== 'platform_owner') return json({ ok: false, code: 'platform_owner_required' }, 403)
    const requestedHours = Number(request.nextUrl.searchParams.get('hours') || 168)
    const result = await listCspTelemetry(Number.isFinite(requestedHours) ? requestedHours : 168)
    return json({ ok: true, ...result })
  } catch (error) {
    if (error instanceof ApiAccessError) return json({ ok: false, code: error.code }, error.status)
    const code = error instanceof Error ? error.message.split(':')[0] : 'csp_telemetry_read_failed'
    return json({ ok: false, code, error: 'CSP telemetry could not be read.' }, 500)
  }
}
