import { NextRequest, NextResponse } from 'next/server'
import { buildPublicMarketplaceResponse } from '@/lib/ai/marketplace-public'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const message = (request.nextUrl.searchParams.get('message') ?? 'Show the best marketplace offers')
    .trim()
    .slice(0, 512)

  return NextResponse.json(
    {
      ok: true,
      response: buildPublicMarketplaceResponse(message),
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    },
  )
}
