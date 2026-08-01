import { NextResponse } from 'next/server'
import { getAdminCommercialFoundationExperience } from '@/lib/recovery/commercial-agreement-foundation'

export async function GET() {
  return NextResponse.json(getAdminCommercialFoundationExperience())
}