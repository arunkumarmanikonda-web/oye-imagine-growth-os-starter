import { NextRequest, NextResponse } from 'next/server'
import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access'
import { discoverGoogleResources } from '@/lib/integrations/google'
import { resolveOperationalTarget } from '@/lib/integrations/operational-target'

export async function GET(request:NextRequest){try{const access=await requireApiAccess({lane:'admin'});const target=await resolveOperationalTarget(access,request.nextUrl.searchParams.get('workspaceId'));return NextResponse.json({ok:true,...await discoverGoogleResources(target)},{headers:{'Cache-Control':'private, no-store'}})}catch(error){if(error instanceof ApiAccessError)return NextResponse.json({ok:false,code:error.code},{status:error.status});const code=error instanceof Error?error.message.split(':')[0]:'google_discovery_failed';return NextResponse.json({ok:false,code,error:'Google resources could not be discovered.'},{status:code.includes('not_configured')||code.includes('missing')?503:500})}}
