import { NextRequest, NextResponse } from 'next/server'
import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access'
import { chooseSocialOauthResource, getSocialOauthSelection } from '@/lib/integrations/social-oauth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } })
}

function failure(error: unknown) {
  if (error instanceof ApiAccessError) return json({ ok: false, code: error.code }, error.status)
  const code = error instanceof Error ? error.message.split(':')[0] : 'oauth_selection_failed'
  const status = code.includes('not_found') ? 404 : code.includes('expired') || code.includes('consumed') ? 409 : code.includes('invalid') || code.includes('required') ? 400 : code.includes('mismatch') || code.includes('platform_owner') ? 403 : 500
  return json({ ok: false, code, error: 'Provider resource selection could not be completed.' }, status)
}

export async function GET(request: NextRequest) {
  try {
    const access = await requireApiAccess({ lane: 'admin' })
    const sessionId = request.nextUrl.searchParams.get('sessionId') || ''
    if (!sessionId) return json({ ok: false, code: 'oauth_selection_session_required' }, 400)
    const selection = await getSocialOauthSelection(access, sessionId)
    return json({ ok: true, ...selection })
  } catch (error) {
    return failure(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const access = await requireApiAccess({ lane: 'admin' })
    const body = await request.json().catch(() => ({}))
    const sessionId = String(body.sessionId || '')
    const resourceId = String(body.resourceId || '')
    if (!sessionId || !resourceId) return json({ ok: false, code: 'oauth_selection_input_required' }, 400)
    const account = await chooseSocialOauthResource(access, { sessionId, resourceId })
    return json({ ok: true, account })
  } catch (error) {
    return failure(error)
  }
}
