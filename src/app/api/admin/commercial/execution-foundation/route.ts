import { NextResponse } from 'next/server'
import { getAdminCommercialExecutionExperience } from '@/lib/recovery/commercial-agreement-execution'

export async function GET() {
  return NextResponse.json(getAdminCommercialExecutionExperience())
}