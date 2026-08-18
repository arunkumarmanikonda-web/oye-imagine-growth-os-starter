import { NextRequest, NextResponse } from 'next/server'
import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access'
import { listProviderReadiness, runProviderQa, type ProviderQaChannel } from '@/lib/integrations/provider-qa'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const CHANNELS = new Set<ProviderQaChannel>(['google_ads', 'facebook', 'instagram', 'linkedin', 'youtube'])

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } })
}

function failure(error: unknown) {
  if (error instanceof ApiAccessError) return json({ ok: false, code: error.code }, error.status)
  const code = error instanceof Error ? error.message.split(':')[0] : 'provider_readiness_failed'
  const status = code.includes('required') || code.includes('invalid') || code.includes('unsupported')
    ? 400
    : code.includes('platform_owner') || code.includes('authorized')
      ? 403
      : 500
  return json({ ok: false, code, error: 'Provider readiness operation could not be completed.' }, status)
}

export async function GET(request: NextRequest) {
  try {
    const access = await requireApiAccess({ lane: 'admin' })
    const result = await listProviderReadiness(access, request.nextUrl.searchParams.get('workspaceId') || undefined)
    return json({ ok: true, ...result })
  } catch (error) {
    return failure(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const access = await requireApiAccess({ lane: 'admin' })
    if (access.membership.role_key !== 'platform_owner') return json({ ok: false, code: 'platform_owner_required' }, 403)
    const body = await request.json().catch(() => ({}))
    const channel = String(body.channel || '') as ProviderQaChannel
    if (!CHANNELS.has(channel)) return json({ ok: false, code: 'provider_qa_channel_invalid' }, 400)
    const result = await runProviderQa(access, {
      workspaceId: body.workspaceId ? String(body.workspaceId) : undefined,
      channel,
      externalResourceId: body.externalResourceId ? String(body.externalResourceId) : undefined,
    })
    return json({ ok: true, ...result }, 201)
  } catch (error) {
    return failure(error)
  }
}