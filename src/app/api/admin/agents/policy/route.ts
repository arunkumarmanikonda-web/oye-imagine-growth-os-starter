import { NextRequest, NextResponse } from 'next/server'
import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access'
import { getAgentPolicies, updateAgentPolicy } from '@/lib/ai/agent-runtime'

function json(body:unknown,status=200){return NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}})}
export const runtime='nodejs';export const dynamic='force-dynamic'

export async function GET(request:NextRequest){try{const access=await requireApiAccess({lane:'admin'});return json({ok:true,...await getAgentPolicies(access,request.nextUrl.searchParams.get('workspaceId')||undefined)})}catch(error){if(error instanceof ApiAccessError)return json({ok:false,code:error.code},error.status);return json({ok:false,code:'agent_policy_read_failed'},500)}}

export async function PUT(request:NextRequest){try{const access=await requireApiAccess({lane:'admin'});const body=await request.json();const agentKey=String(body?.agentKey||'').trim();if(!agentKey)return json({ok:false,code:'agent_key_required'},400);return json({ok:true,...await updateAgentPolicy({access,workspaceId:body?.workspaceId,agentKey,patch:{autonomyLevel:body?.autonomyLevel,enabled:body?.enabled,killSwitch:body?.killSwitch,allowedToolClasses:body?.allowedToolClasses,maxRunCostUsd:body?.maxRunCostUsd,maxToolCalls:body?.maxToolCalls}})})}catch(error){if(error instanceof ApiAccessError)return json({ok:false,code:error.code},error.status);return json({ok:false,code:'agent_policy_write_failed'},500)}}
