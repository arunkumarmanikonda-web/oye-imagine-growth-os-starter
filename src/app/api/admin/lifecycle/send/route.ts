import { NextRequest, NextResponse } from 'next/server'
import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access'
import { sendLifecycleMessage } from '@/lib/privacy/delivery'

const json=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}})
export const runtime='nodejs';export const dynamic='force-dynamic'

export async function POST(request:NextRequest){try{const access=await requireApiAccess({lane:'admin'});const body=await request.json();const result=await sendLifecycleMessage(access,{workspaceId:body.workspaceId,channel:body.channel,purpose:String(body.purpose||''),subject:String(body.subject||''),provider:body.provider,email:body.email,whatsapp:body.whatsapp,sms:body.sms});return json({ok:true,...result},result.blocked?409:201)}catch(error){if(error instanceof ApiAccessError)return json({ok:false,code:error.code},error.status);const code=error instanceof Error?error.message.split(':')[0]:'lifecycle_send_failed';const status=code.includes('not_configured')?503:code.includes('required')||code.includes('invalid')?400:code.includes('denied')?403:500;return json({ok:false,code,error:'Lifecycle message was not sent.'},status)}}
