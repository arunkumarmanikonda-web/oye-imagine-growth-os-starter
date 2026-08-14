import { NextResponse } from 'next/server'

import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access'
import { type NeejeePilotInput } from '@/lib/admin/pilot-schema'
import { loadPilotProfile, savePilotProfile } from '@/lib/admin/pilot-persistence'
import { getWorkspaceDisplayName } from '@/lib/admin/workspace-branding'

type RouteContext = { params: Promise<{ id: string }> }

async function resolveId(context: RouteContext) {
  const { id } = await context.params
  return id
}

function privateJson(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } })
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const access = await requireApiAccess({ lane: 'admin' })
    const pilot = await loadPilotProfile(access.membership)
    const id = await resolveId(context)
    if (id !== pilot.id) return privateJson({ ok: false, error: `Pilot ${id} not found` }, 404)
    return privateJson({ ok: true, workspaceDisplayName: getWorkspaceDisplayName(), pilot })
  } catch (error) {
    if (error instanceof ApiAccessError) return privateJson({ ok: false, code: error.code, error: error.message }, error.status)
    return privateJson({ ok: false, code: 'pilot_read_failed', error: 'Unable to load pilot.' }, 500)
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const access = await requireApiAccess({ lane: 'admin' })
    const current = await loadPilotProfile(access.membership)
    const id = await resolveId(context)
    if (id !== current.id) return privateJson({ ok: false, error: `Pilot ${id} not found` }, 404)

    let body: NeejeePilotInput = {}
    try {
      const parsed = await request.json()
      body = parsed && typeof parsed === 'object' ? (parsed as NeejeePilotInput) : {}
    } catch {
      body = {}
    }

    const pilot = await savePilotProfile({
      membership: access.membership,
      actorUserId: access.subject,
      actorEmail: access.email,
      patch: { ...body, id, workspaceDisplayName: body.workspaceDisplayName ?? getWorkspaceDisplayName() },
    })

    return privateJson({ ok: true, workspaceDisplayName: getWorkspaceDisplayName(), pilot })
  } catch (error) {
    if (error instanceof ApiAccessError) return privateJson({ ok: false, code: error.code, error: error.message }, error.status)
    return privateJson({ ok: false, code: 'pilot_write_failed', error: 'Unable to persist pilot.' }, 500)
  }
}
