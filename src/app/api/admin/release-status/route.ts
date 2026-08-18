import { NextResponse } from 'next/server'
import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access'
import { buildReleaseReadinessEvidence } from '@/lib/release/readiness'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'private, no-store' },
  })
}

export async function GET() {
  try {
    const access = await requireApiAccess({ lane: 'admin' })
    if (access.membership.role_key !== 'platform_owner') {
      return json({ ok: false, code: 'platform_owner_required' }, 403)
    }

    const evidence = await buildReleaseReadinessEvidence()
    return json({ ok: true, ...evidence })
  } catch (error) {
    if (error instanceof ApiAccessError) return json({ ok: false, code: error.code }, error.status)
    const code = error instanceof Error ? error.message.split(':')[0] : 'release_readiness_failed'
    return json({ ok: false, code, error: 'Release-readiness evidence could not be assembled.' }, 500)
  }
}
