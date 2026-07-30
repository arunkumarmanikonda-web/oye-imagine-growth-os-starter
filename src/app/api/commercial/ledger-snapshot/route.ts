import { NextRequest, NextResponse } from 'next/server'
import { buildLedgerSnapshot } from '@/lib/recovery/commercial-invoicing-foundation'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json(buildLedgerSnapshot(body))
}