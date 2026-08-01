import { NextRequest, NextResponse } from 'next/server'
import { buildClientCommercialDashboard } from '@/lib/recovery/commercial-dashboard-foundation'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json(buildClientCommercialDashboard(body))
}