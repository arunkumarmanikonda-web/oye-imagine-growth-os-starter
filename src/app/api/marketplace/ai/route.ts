import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      code: 'public_marketplace_ai_retired',
      message: 'Marketplace intelligence is available only inside an authenticated, permission-scoped workspace.',
    },
    { status: 410, headers: { 'Cache-Control': 'no-store' } },
  )
}
