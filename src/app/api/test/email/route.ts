import { NextResponse } from 'next/server'

function retired() {
  return NextResponse.json(
    { ok: false, code: 'public_test_endpoint_retired', message: 'Provider tests are available only through authenticated administrative controls.' },
    { status: 410, headers: { 'Cache-Control': 'no-store' } },
  )
}

export async function GET() { return retired() }
export async function POST() { return retired() }
