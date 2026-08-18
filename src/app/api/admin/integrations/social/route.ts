import { NextRequest, NextResponse } from 'next/server'
import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access'
import { connectSocialAccount, listSocialConnectionStatus } from '@/lib/integrations/social-accounts'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } })
}

function failure(error: unknown) {
  if (error instanceof ApiAccessError) return json({ ok: false, code: error.code }, error.status)
  const code = error instanceof Error ? error.message.split(':')[0] : 'social_integration_failed'
  const status = code.includes('required') || code.includes('invalid') || code.includes('mismatch') ? 400 : code.includes('authorized') || code.includes('platform_owner') ? 403 : code.includes('verification_failed') ? 409 : 500
  return json({ ok: false, code, error: 'Social account connection could not be completed.' }, status)
}

export async function GET(request: NextRequest) {
  try {
    const access = await requireApiAccess({ lane: 'admin' })
    const result = await listSocialConnectionStatus(access, request.nextUrl.searchParams.get('workspaceId') || undefined)
    return json({ ok: true, ...result })
  } catch (error) {
    return failure(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const access = await requireApiAccess({ lane: 'admin' })
    const body = await request.json().catch(() => ({}))
    if (body.provider === 'meta') {
      const result = await connectSocialAccount(access, {
        provider: 'meta',
        workspaceId: body.workspaceId,
        accessToken: String(body.accessToken || ''),
        apiVersion: String(body.apiVersion || ''),
        facebookPageId: String(body.facebookPageId || ''),
        instagramUserId: body.instagramUserId ? String(body.instagramUserId) : null,
        scopes: Array.isArray(body.scopes) ? body.scopes.map(String) : [],
      })
      return json({ ok: true, ...result }, 201)
    }
    if (body.provider === 'linkedin') {
      const result = await connectSocialAccount(access, {
        provider: 'linkedin',
        workspaceId: body.workspaceId,
        accessToken: String(body.accessToken || ''),
        apiVersion: String(body.apiVersion || ''),
        organizationUrn: String(body.organizationUrn || ''),
        memberUrn: String(body.memberUrn || ''),
        scopes: Array.isArray(body.scopes) ? body.scopes.map(String) : [],
      })
      return json({ ok: true, ...result }, 201)
    }
    return json({ ok: false, code: 'social_provider_unsupported' }, 400)
  } catch (error) {
    return failure(error)
  }
}
