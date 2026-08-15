import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'

const TOKEN_SHA256 = '694c26fe5d771bddafbf05d6a7fdad5e12d196bae0a7f0362d1e8614698ec775'
const SUPABASE_URL = 'https://bqhaifivpcwwiauiynlv.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxaGFpZml2cGN3d2lhdWl5bmx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MjA0NDEsImV4cCI6MjEwMDE5NjQ0MX0.-u5ts6n6OVzDNepUlP1x2aZ7m5JWArjxxG0UM5jUEvg'

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } })
}

function validToken(value: string) {
  if (!value) return false
  const actual = crypto.createHash('sha256').update(value).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(TOKEN_SHA256))
}

export async function GET(request: NextRequest) {
  if (process.env.VERCEL_ENV !== 'preview') return json(404, { ok: false, code: 'preview_only' })
  const token = request.nextUrl.searchParams.get('token') ?? ''
  if (!validToken(token)) return json(403, { ok: false, code: 'invalid_one_time_token' })

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/bootstrap-access-identities`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
        'x-oye-bootstrap-token': token,
        'content-type': 'application/json',
      },
      body: '{}',
      cache: 'no-store',
    })

    const text = await response.text()
    let body: unknown
    try {
      body = JSON.parse(text)
    } catch {
      body = { ok: false, code: 'invalid_bootstrap_response', status: response.status }
    }

    return json(response.status, body)
  } catch (error) {
    return json(502, {
      ok: false,
      code: 'bootstrap_bridge_failed',
      message: error instanceof Error ? error.message : 'unknown',
    })
  }
}
