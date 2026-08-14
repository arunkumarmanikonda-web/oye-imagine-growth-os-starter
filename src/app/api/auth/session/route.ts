import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { VerifiedMembership } from '@/lib/auth/verified-membership'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
  const subject = claimsData?.claims?.sub

  if (claimsError || typeof subject !== 'string' || !subject) {
    const response = NextResponse.json(
      {
        session: {
          isAuthenticated: false,
          source: 'supabase',
        },
        memberships: [],
      },
      { status: 401 },
    )
    response.headers.set('Cache-Control', 'private, no-store')
    return response
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user?.id || user.id !== subject) {
    const response = NextResponse.json(
      {
        session: {
          isAuthenticated: false,
          source: 'supabase',
        },
        memberships: [],
      },
      { status: 401 },
    )
    response.headers.set('Cache-Control', 'private, no-store')
    return response
  }

  const { data: membershipRows, error: membershipError } = await supabase
    .from('core_tenant_memberships')
    .select('membership_id,tenant_id,user_id,role_key,brand_id,workspace_id,status')
    .eq('user_id', user.id)
    .eq('status', 'active')

  if (membershipError) {
    const response = NextResponse.json(
      {
        session: {
          isAuthenticated: true,
          source: 'supabase',
          userId: user.id,
          email: user.email ?? null,
        },
        memberships: [],
        accessControlAvailable: false,
      },
      { status: 503 },
    )
    response.headers.set('Cache-Control', 'private, no-store')
    return response
  }

  const memberships = (membershipRows ?? []) as VerifiedMembership[]
  const response = NextResponse.json({
    session: {
      isAuthenticated: true,
      source: 'supabase',
      userId: user.id,
      email: user.email ?? null,
    },
    memberships,
    accessControlAvailable: true,
  })
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}
