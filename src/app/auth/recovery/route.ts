import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.redirect(new URL('/forgot-password?error=unavailable', request.url))

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) return NextResponse.redirect(new URL('/forgot-password?error=unavailable', request.url))

  const destination = new URL('/account/change-password', request.url)
  destination.searchParams.set('next', '/workspace')
  return NextResponse.redirect(destination)
}
