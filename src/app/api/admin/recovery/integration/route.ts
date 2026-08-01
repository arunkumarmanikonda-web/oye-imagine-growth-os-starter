import { NextResponse } from 'next/server'
import {
  RECOVERY_ROUTE_GROUPS,
  getCommercialConciergeCrosswalk,
  getIntegrationValidationGate,
  getRecoveryIntegrationSnapshot,
} from '@/lib/recovery/recovery-integration-manifest'

export async function GET() {
  return NextResponse.json({
    snapshot: getRecoveryIntegrationSnapshot(),
    validationGate: getIntegrationValidationGate(),
    routeGroups: RECOVERY_ROUTE_GROUPS,
    crosswalk: getCommercialConciergeCrosswalk(),
  })
}