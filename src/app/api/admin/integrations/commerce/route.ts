import { NextRequest, NextResponse } from 'next/server'
import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access'
import { ingestCommerceTarget } from '@/lib/integrations/growth-closed-loop'
function json(body:unknown,status=200){return NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}})}
export async function POST(request:NextRequest){try{const access=await requireApiAccess({lane:'admin'});const body=await request.json();if(!Array.isArray(body?.orders))return json({ok:false,code:'orders_required'},400);return json({ok:true,...await ingestCommerceTarget(access,{workspaceId:body.workspaceId,sourceSystem:body.sourceSystem,orders:body.orders})},201)}catch(error){if(error instanceof ApiAccessError)return json({ok:false,code:error.code},error.status);return json({ok:false,code:'commerce_ingestion_failed',error:'Commerce orders could not be ingested.'},500)}}
