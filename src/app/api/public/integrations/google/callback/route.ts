import { NextRequest, NextResponse } from 'next/server'
import { persistGoogleConnection } from '@/lib/integrations/google'

export const runtime='nodejs';export const dynamic='force-dynamic'
export async function GET(request:NextRequest){const state=request.nextUrl.searchParams.get('state')||'',code=request.nextUrl.searchParams.get('code')||'',providerError=request.nextUrl.searchParams.get('error');const base=(process.env.NEXT_PUBLIC_SITE_URL||request.nextUrl.origin).replace(/\/$/,'');if(providerError)return NextResponse.redirect(`${base}/admin/integrations?google=denied`);if(!state||!code)return NextResponse.redirect(`${base}/admin/integrations?google=invalid_callback`);try{await persistGoogleConnection({state,code});return NextResponse.redirect(`${base}/admin/integrations?google=connected`)}catch{return NextResponse.redirect(`${base}/admin/integrations?google=connection_failed`)}}
