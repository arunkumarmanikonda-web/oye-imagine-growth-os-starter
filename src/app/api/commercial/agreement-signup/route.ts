import { NextRequest, NextResponse } from 'next/server'
import { buildAgreementSignupBlueprint } from '@/lib/recovery/commercial-agreement-foundation'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json(buildAgreementSignupBlueprint(body))
}