import { NextResponse } from 'next/server'
import { getAdminCommercialDashboardExperience } from '@/lib/recovery/commercial-dashboard-foundation'

export async function GET() {
  return NextResponse.json(getAdminCommercialDashboardExperience())
}