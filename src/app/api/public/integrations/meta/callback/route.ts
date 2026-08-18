import { NextRequest, NextResponse } from 'next/server'
import { completeSocialOauthCallback } from '@/lib/integrations/social-oauth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function integrationsUrl(request: NextRequest, params: Record<string, string>) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
  const url = new URL('/admin/integrations', base)
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)
  return url
}

export async function GET(request: NextRequest) {
  const error = request.nextUrl.searchParams.get('error')
  if (error) return NextResponse.redirect(integrationsUrl(request, { meta: 'authorization_denied' }))
  const code = request.nextUrl.searchParams.get('code') || ''
  const state = request.nextUrl.searchParams.get('state') || ''
  if (!code || !state) return NextResponse.redirect(integrationsUrl(request, { meta: 'callback_invalid' }))
  try {
    const session = await completeSocialOauthCallback('meta', { code, state })
    return NextResponse.redirect(integrationsUrl(request, { meta: 'select_resource', oauthSelection: session.session_id }))
  } catch (callbackError) {
    const codeName = callbackError instanceof Error ? callbackError.message.split(':')[0] : 'meta_oauth_callback_failed'
    return NextResponse.redirect(integrationsUrl(request, { meta: codeName }))
  }
}
