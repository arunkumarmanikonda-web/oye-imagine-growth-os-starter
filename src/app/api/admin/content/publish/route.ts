import { NextRequest, NextResponse } from 'next/server'
import { createPublishWorkflow } from '@/lib/recovery/content-governance'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json(createPublishWorkflow(body))
}