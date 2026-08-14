import { NextRequest, NextResponse } from 'next/server'
import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access'
import { runBrandStrategist } from '@/lib/ai/agent-runtime'

function json(body:unknown,status=200){return NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}})}
export const runtime='nodejs';export const dynamic='force-dynamic'

export async function POST(request:NextRequest){try{const access=await requireApiAccess({lane:'admin'});const body=await request.json();const objective=String(body?.objective||'').trim();if(!objective)return json({ok:false,code:'objective_required'},400);const result=await runBrandStrategist({access,workspaceId:body?.workspaceId,objective,preferredProvider:body?.preferredProvider});return json({ok:true,...result},201)}catch(error){if(error instanceof ApiAccessError)return json({ok:false,code:error.code},error.status);const code=error instanceof Error?error.message.split(':')[0]:'agent_run_failed';const status=code.includes('kill_switch')||code.includes('disabled')||code.includes('denied')?403:code.includes('required')?400:code.includes('not_configured')||code.includes('provider_unavailable')?503:500;return json({ok:false,code,error:'Brand strategist run could not complete.'},status)}}
