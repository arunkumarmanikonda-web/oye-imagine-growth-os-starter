import { NextRequest, NextResponse } from 'next/server'
import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function meta(access: Awaited<ReturnType<typeof requireApiAccess>>, key: string) {
  const value = access.membership.metadata?.[key]
  return typeof value === 'string' && value.trim() ? value.trim() : null
}
function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } })
}

export async function GET(request: NextRequest) {
  try {
    const access = await requireApiAccess({ lane: 'admin' })
    const tenantId = meta(access, 'operationalTenantId') || access.membership.tenant_id
    const workspaceId = meta(access, 'operationalWorkspaceId') || access.membership.workspace_id
    const params = request.nextUrl.searchParams
    const kind = params.get('kind')?.trim()
    const channel = params.get('channel')?.trim()
    const status = params.get('status')?.trim()
    const campaign = params.get('campaign')?.trim()
    const q = params.get('q')?.trim()
    const limit = Math.min(Math.max(Number(params.get('limit') || 50), 1), 100)

    const admin = createSupabaseAdminClient()
    let query = admin.from('creative_assets')
      .select('asset_id,brand_id,workspace_id,campaign_id,parent_asset_id,source_generation_job_id,storage_bucket,storage_path,asset_kind,purpose,channel,mime_type,sha256,byte_size,width,height,duration_ms,title,alt_text,caption,status,approved_by,approved_at,metadata,created_at,updated_at')
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (workspaceId) query = query.eq('workspace_id', workspaceId)
    if (kind) query = query.eq('asset_kind', kind)
    if (channel) query = query.eq('channel', channel)
    if (status) query = query.eq('status', status)
    if (campaign) query = query.eq('campaign_id', campaign)
    if (q) query = query.ilike('title', `%${q.replace(/[%_]/g, '')}%`)
    const { data, error } = await query
    if (error) throw new Error(`creative_assets_read_failed:${error.message}`)

    const assets = await Promise.all((data ?? []).map(async (asset) => {
      const { data: signed } = await admin.storage.from(asset.storage_bucket).createSignedUrl(asset.storage_path, 900)
      return { ...asset, signedUrl: signed?.signedUrl || null }
    }))
    return json({ ok: true, assets })
  } catch (error) {
    if (error instanceof ApiAccessError) return json({ ok: false, code: error.code, error: error.message }, error.status)
    return json({ ok: false, code: 'creative_assets_read_failed', error: 'Creative assets could not be loaded.' }, 500)
  }
}
