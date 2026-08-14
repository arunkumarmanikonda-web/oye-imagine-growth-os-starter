import { NextRequest, NextResponse } from 'next/server'
import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access'
import {
  getWorkspaceBrandIntelligenceSnapshotLive,
  saveWorkspaceBrandIntelligenceSnapshotLive,
} from '@/lib/admin/workspace-live'

export const runtime='nodejs'
export const dynamic='force-dynamic'

function isRecord(value: unknown): value is Record<string,unknown> {
  return !!value && typeof value==='object' && !Array.isArray(value)
}
function privateJson(body: unknown,status=200) {
  return NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}})
}

export async function GET() {
  try {
    await requireApiAccess({lane:'admin'})
    return privateJson({ok:true,snapshot:await getWorkspaceBrandIntelligenceSnapshotLive()})
  } catch (error) {
    if (error instanceof ApiAccessError) return privateJson({ok:false,code:error.code,error:error.message},error.status)
    return privateJson({ok:false,code:'brand_intelligence_read_failed',error:'Unable to load brand intelligence.'},500)
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireApiAccess({lane:'admin'})
    let body: unknown
    try { body=await request.json() } catch { return privateJson({ok:false,error:'Invalid JSON body'},400) }
    if (!isRecord(body)) return privateJson({ok:false,error:'Expected an object body'},400)
    const snapshot=await saveWorkspaceBrandIntelligenceSnapshotLive(body)
    return privateJson({ok:true,snapshot})
  } catch (error) {
    if (error instanceof ApiAccessError) return privateJson({ok:false,code:error.code,error:error.message},error.status)
    return privateJson({ok:false,code:'brand_intelligence_write_failed',error:'Unable to persist brand intelligence.'},500)
  }
}
