import { NextRequest, NextResponse } from 'next/server'
import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access'
import {
  getWorkspaceOnboardingSnapshotLive,
  saveWorkspaceOnboardingSnapshotLive,
} from '@/lib/admin/workspace-live'
import { type NeejeePilotInput } from '@/lib/admin/pilot-schema'
import { loadPilotProfile, savePilotProfile } from '@/lib/admin/pilot-persistence'
import { getWorkspaceDisplayName } from '@/lib/admin/workspace-branding'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const pilotKeys = new Set([
  'id','workspaceDisplayName','brandName','website','industry','geo','targetAudience','offer',
  'monthlyBudget','primaryChannels','competitors','goals','successMetrics','status','lastUpdatedAt',
])

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}
function hasOwn(source: Record<string, unknown>, key: string) { return Object.prototype.hasOwnProperty.call(source, key) }
function normalizeLines(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => typeof item === 'string' ? item.trim() : '').filter(Boolean)
  if (typeof value === 'string') return value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean)
  return []
}
function toPilotPatch(source: Record<string, unknown>): NeejeePilotInput {
  const patch: NeejeePilotInput = {}
  if (hasOwn(source,'brandName')) patch.brandName=String(source.brandName??'')
  if (hasOwn(source,'website')) patch.website=String(source.website??'')
  if (hasOwn(source,'industry')) patch.industry=String(source.industry??'')
  if (hasOwn(source,'geo')) patch.geo=String(source.geo??'')
  if (hasOwn(source,'targetAudience')) patch.targetAudience=String(source.targetAudience??'')
  if (hasOwn(source,'offer')) patch.offer=String(source.offer??'')
  if (hasOwn(source,'monthlyBudget')) patch.monthlyBudget=String(source.monthlyBudget??'')
  if (hasOwn(source,'primaryChannels')) patch.primaryChannels=normalizeLines(source.primaryChannels)
  if (hasOwn(source,'competitors')) patch.competitors=normalizeLines(source.competitors)
  if (hasOwn(source,'goals')) patch.goals=normalizeLines(source.goals)
  if (hasOwn(source,'successMetrics')) patch.successMetrics=normalizeLines(source.successMetrics)
  if (hasOwn(source,'status')) patch.status=String(source.status??'') as any
  return patch
}
function extractSnapshotPatch(source: Record<string, unknown>) {
  const patch: Record<string, unknown> = {}
  for (const [key,value] of Object.entries(source)) {
    if (key==='pilot'||key==='snapshot'||pilotKeys.has(key)) continue
    patch[key]=value
  }
  return patch
}
function privateJson(body: unknown, status=200) {
  return NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}})
}

export async function GET() {
  try {
    const access=await requireApiAccess({lane:'admin'})
    const [snapshot,pilot]=await Promise.all([
      getWorkspaceOnboardingSnapshotLive(),
      loadPilotProfile(access.membership),
    ])
    return privateJson({ok:true,snapshot,pilot})
  } catch (error) {
    if (error instanceof ApiAccessError) return privateJson({ok:false,code:error.code,error:error.message},error.status)
    return privateJson({ok:false,code:'onboarding_read_failed',error:'Unable to load onboarding workspace.'},500)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const access=await requireApiAccess({lane:'admin'})
    let body: unknown
    try { body=await request.json() } catch { return privateJson({ok:false,error:'Invalid JSON body'},400) }
    if (!isRecord(body)) return privateJson({ok:false,error:'Expected an object body'},400)

    const snapshotPatch=isRecord(body.snapshot)?body.snapshot:extractSnapshotPatch(body)
    const explicitPilotPatch=isRecord(body.pilot)?toPilotPatch(body.pilot):{}
    const topLevelPilotPatch=toPilotPatch(body)
    const pilotPatch=Object.keys(explicitPilotPatch).length?explicitPilotPatch:topLevelPilotPatch

    const snapshot=await saveWorkspaceOnboardingSnapshotLive(snapshotPatch)
    const pilot=Object.keys(pilotPatch).length
      ? await savePilotProfile({membership:access.membership,actorUserId:access.subject,actorEmail:access.email,patch:{...pilotPatch,workspaceDisplayName:pilotPatch.workspaceDisplayName??getWorkspaceDisplayName()}})
      : await loadPilotProfile(access.membership)

    return privateJson({ok:true,snapshot,pilot})
  } catch (error) {
    if (error instanceof ApiAccessError) return privateJson({ok:false,code:error.code,error:error.message},error.status)
    return privateJson({ok:false,code:'onboarding_write_failed',error:'Unable to persist onboarding workspace.'},500)
  }
}
