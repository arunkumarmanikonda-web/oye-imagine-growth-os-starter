import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    '/workspace/:path*',
    '/admin/:path*',
    '/client/:path*',
    '/api/admin/:path*',
    '/api/client/:path*',
    '/onboarding/activation/:path*',
    '/account/change-password',
    '/login',
    '/login/admin',
    '/login/client',
    '/signup/:path*',
  ],
}
