import { NextRequest, NextResponse } from 'next/server'
import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access'
import { autonomousExecutionStatus, executeAutonomousAction, recordChannelReadiness, setAutonomyKillSwitch } from '@/lib/autonomy/executor'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } })
}

function failure(error: unknown) {
  if (error instanceof ApiAccessError) return json({ ok: false, code: error.code }, error.status)
  const code = error instanceof Error ? error.message.split(':')[0] : 'autonomy_request_failed'
  const status = code.includes('required') || code.includes('invalid') || code.includes('mismatch') ? 400 : code.includes('denied') || code.includes('platform_owner') ? 403 : 500
  return json({ ok: false, code, error: 'Autonomous execution request could not be completed.' }, status)
}

export async function GET(request: NextRequest) {
  try {
    const access = await requireApiAccess({ lane: 'admin' })
    const workspaceId = request.nextUrl.searchParams.get('workspaceId') || undefined
    const status = await autonomousExecutionStatus(access, workspaceId)
    return json({ ok: true, ...status })
  } catch (error) {
    return failure(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const access = await requireApiAccess({ lane: 'admin' })
    const body = await request.json().catch(() => ({}))
    const operation = String(body.operation || 'execute')
    if (operation === 'execute') {
      const result = await executeAutonomousAction(access, body.execution)
      return json({ ok: true, ...result }, result.run?.status === 'blocked' ? 409 : 200)
    }
    if (operation === 'set_kill_switch') {
      const policy = await setAutonomyKillSwitch(access, { workspaceId: body.workspaceId, active: body.active === true })
      return json({ ok: true, policy })
    }
    if (operation === 'record_channel_readiness') {
      const readiness = await recordChannelReadiness(access, {
        workspaceId: body.workspaceId,
        channel: String(body.channel || ''),
        ready: body.ready === true,
        blockers: Array.isArray(body.blockers) ? body.blockers.map(String) : undefined,
        note: typeof body.note === 'string' ? body.note : undefined,
      })
      return json({ ok: true, readiness })
    }
    return json({ ok: false, code: 'autonomy_operation_unknown' }, 400)
  } catch (error) {
    return failure(error)
  }
}
