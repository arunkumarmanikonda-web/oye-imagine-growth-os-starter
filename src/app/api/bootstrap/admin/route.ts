import { NextResponse } from 'next/server'

function retired() {
  return NextResponse.json(
    {
      ok: false,
      code: 'legacy_bootstrap_retired',
      message: 'Legacy bootstrap is disabled. Platform identities and permissions are managed through the authenticated Super Admin Access OS.',
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
