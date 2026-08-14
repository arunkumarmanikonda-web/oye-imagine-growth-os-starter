import { NextResponse } from 'next/server'
import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access'
import { refreshCreativeGeneration } from '@/lib/creative/generation-service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Context = { params: Promise<{ jobId: string }> }

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } })
}

export async function GET(_request: Request, context: Context) {
  try {
    const access = await requireApiAccess({ lane: 'admin' })
    const { jobId } = await context.params
    if (!jobId?.trim()) return json({ ok: false, code: 'job_id_required' }, 400)
    const result = await refreshCreativeGeneration(access, jobId)
    return json({ ok: true, ...result })
  } catch (error) {
    if (error instanceof ApiAccessError) return json({ ok: false, code: error.code, error: error.message }, error.status)
    const code = error instanceof Error ? error.message.split(':')[0] : 'creative_job_refresh_failed'
    const status = code === 'creative_job_not_found' ? 404 : code.includes('not_configured') ? 503 : 500
    return json({ ok: false, code, error: 'Creative generation status could not be refreshed.' }, status)
  }
}
