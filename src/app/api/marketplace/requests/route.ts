import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      code: 'marketplace_request_intake_gated',
      message: 'Marketplace request intake is not open on the public API. Use the main contact flow until governed specialist onboarding is activated.',
    },
    { status: 410, headers: { 'Cache-Control': 'no-store' } },
  )
}
