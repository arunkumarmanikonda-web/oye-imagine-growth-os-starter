import { NextRequest, NextResponse } from 'next/server'
import { advanceApprovalExecution } from '@/lib/recovery/commercial-agreement-execution'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json(advanceApprovalExecution(body))
}