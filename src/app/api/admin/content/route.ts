import { NextResponse } from 'next/server'
import { getAdminContentStudioExperience } from '@/lib/recovery/content-governance'

export async function GET() {
  return NextResponse.json(getAdminContentStudioExperience())
}