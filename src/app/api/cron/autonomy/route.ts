import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { processAutonomousQueue } from '@/lib/autonomy/worker'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } })
}

export async function POST(request: NextRequest) {
  const supplied = request.headers.get('x-oye-autonomy-secret')?.trim() || ''
  if (!supplied) return json({ ok: false, code: 'autonomy_scheduler_unauthorized' }, 401)
  const admin = createSupabaseAdminClient()
  const { data: verified, error } = await admin.rpc('verify_autonomy_scheduler_secret', { p_secret: supplied })
  if (error || verified !== true) return json({ ok: false, code: 'autonomy_scheduler_unauthorized' }, 401)
  try {
    const result = await processAutonomousQueue(10)
    return json({ ok: true, ...result })
  } catch (workerError) {
    const code = workerError instanceof Error ? workerError.message.split(':')[0] : 'autonomy_worker_failed'
    return json({ ok: false, code }, 500)
  }
}
