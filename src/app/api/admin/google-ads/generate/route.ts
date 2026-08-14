import { NextResponse } from 'next/server'
import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access'
import { generateGoogleAdsDraft } from '@/lib/admin/google-ads-generator'

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function privateJson(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'private, no-store' },
  })
}

export async function POST(request: Request) {
  try {
    await requireApiAccess({ lane: 'admin' })

    const body = await request.json().catch(() => ({}))

    if (!isRecord(body)) {
      return privateJson(
        { ok: false, error: 'Request body must be a JSON object.' },
        400,
      )
    }

    const pilotId =
      typeof body.pilotId === 'string' && body.pilotId.trim().length > 0
        ? body.pilotId.trim()
        : undefined

    const forceRegenerate = body.forceRegenerate === true
    const googleAdsDraft = generateGoogleAdsDraft({
      pilotId,
      forceRegenerate,
    })

    const workspaceDisplayName =
      typeof (googleAdsDraft as Record<string, unknown>).workspaceDisplayName ===
        'string' &&
      ((googleAdsDraft as Record<string, unknown>).workspaceDisplayName as string)
        .trim().length > 0
        ? ((googleAdsDraft as Record<string, unknown>).workspaceDisplayName as string).trim()
        : 'Oye !magine'

    return privateJson(
      {
        ok: true,
        executionState: 'draft_only',
        externalGoogleAdsMutationPerformed: false,
        workspaceDisplayName,
        googleAdsDraft,
      },
      201,
    )
  } catch (error) {
    if (error instanceof ApiAccessError) {
      return privateJson(
        { ok: false, error: error.message, code: error.code },
        error.status,
      )
    }

    const message = error instanceof Error ? error.message : 'Unknown error'

    if (message.startsWith('Pilot not found:')) {
      return privateJson({ ok: false, error: message }, 404)
    }

    return privateJson({ ok: false, error: message }, 500)
  }
}
