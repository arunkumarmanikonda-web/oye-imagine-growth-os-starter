import { NextRequest, NextResponse } from 'next/server'
import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access'
import { socialAuthorizationUrl } from '@/lib/integrations/social-oauth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const access = await requireApiAccess({ lane: 'admin' })
    const result = await socialAuthorizationUrl(access, 'linkedin', request.nextUrl.searchParams.get('workspaceId') || undefined)
    return NextResponse.json({ ok: true, ...result }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    if (error instanceof ApiAccessError) return NextResponse.json({ ok: false, code: error.code }, { status: error.status })
    const code = error instanceof Error ? error.message.split(':')[0] : 'linkedin_oauth_start_failed'
    return NextResponse.json({ ok: false, code, error: 'LinkedIn authorization could not be started.' }, { status: code.includes('not_configured') ? 503 : code.includes('platform_owner') ? 403 : 500 })
  }
}
