import { NextResponse } from 'next/server'

function retired() {
  return NextResponse.json(
    {
      ok: false,
      code: 'legacy_bootstrap_retired',
      message: 'Legacy Neejee seeding is disabled. Pilot and customer contexts must be created through governed onboarding and authenticated administration.',
    },
    { status: 410, headers: { 'Cache-Control': 'no-store' } },
  )
}

export async function GET() {
  return retired()
}

export async function POST() {
  return retired()
}
