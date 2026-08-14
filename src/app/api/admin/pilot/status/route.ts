import { NextResponse } from 'next/server'

import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access'
import { loadPilotProfile } from '@/lib/admin/pilot-persistence'
import { getWorkspaceDisplayName } from '@/lib/admin/workspace-branding'

const requiredFieldKeys = [
  'brandName','website','industry','geo','targetAudience','offer','monthlyBudget',
  'primaryChannels','goals','successMetrics',
] as const

function hasValue(value: unknown) {
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'string') return value.trim().length > 0
  return value !== null && value !== undefined
}

function privateJson(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } })
}

export async function GET() {
  try {
    const access = await requireApiAccess({ lane: 'admin' })
    const pilot = await loadPilotProfile(access.membership)
    const missingFields = requiredFieldKeys.filter((key) => !hasValue(pilot[key]))
    const completedFields = requiredFieldKeys.length - missingFields.length
    const completionPercent = Math.round((completedFields / requiredFieldKeys.length) * 100)

    return privateJson({
      ok: true,
      workspaceDisplayName: getWorkspaceDisplayName(),
      pilotId: pilot.id,
      status: pilot.status,
      completedFields,
      totalFields: requiredFieldKeys.length,
      completionPercent,
      missingFields,
      lastUpdatedAt: pilot.lastUpdatedAt,
    })
  } catch (error) {
    if (error instanceof ApiAccessError) return privateJson({ ok: false, code: error.code, error: error.message }, error.status)
    return privateJson({ ok: false, code: 'pilot_status_failed', error: 'Unable to load pilot status.' }, 500)
  }
}
