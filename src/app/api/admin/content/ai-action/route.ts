import { NextRequest, NextResponse } from 'next/server'
import { createAiDraftEnvelope } from '@/lib/recovery/content-governance'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json(createAiDraftEnvelope(body))
}