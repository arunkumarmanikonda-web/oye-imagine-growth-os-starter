import { NextRequest, NextResponse } from 'next/server'
import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access'
import { googleAuthorizationUrl } from '@/lib/integrations/google'

export async function GET(request:NextRequest){try{const access=await requireApiAccess({lane:'admin'});const result=await googleAuthorizationUrl(access,request.nextUrl.searchParams.get('workspaceId')||undefined);return NextResponse.json({ok:true,...result},{headers:{'Cache-Control':'private, no-store'}})}catch(error){if(error instanceof ApiAccessError)return NextResponse.json({ok:false,code:error.code},{status:error.status});const code=error instanceof Error?error.message.split(':')[0]:'google_oauth_start_failed';return NextResponse.json({ok:false,code,error:'Google connection could not be started.'},{status:code.includes('not_configured')?503:500})}}
