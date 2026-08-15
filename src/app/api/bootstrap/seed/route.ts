import { NextResponse } from 'next/server'

function retired() {
  return NextResponse.json(
    {
      ok: false,
      code: 'legacy_bootstrap_retired',
      message: 'Legacy platform seeding is disabled in production. Use governed tenant onboarding and the authenticated Super Admin control plane.',
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
