import { NextRequest, NextResponse } from 'next/server'
import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access'
import { listPrivacyState, recordConsent } from '@/lib/privacy/consent'

const json=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}})
export const runtime='nodejs';export const dynamic='force-dynamic'

export async function GET(request:NextRequest){try{const access=await requireApiAccess({lane:'admin'});return json({ok:true,...await listPrivacyState(access,request.nextUrl.searchParams.get('workspaceId')||undefined)})}catch(error){if(error instanceof ApiAccessError)return json({ok:false,code:error.code},error.status);return json({ok:false,code:error instanceof Error?error.message.split(':')[0]:'privacy_read_failed'},500)}}
export async function POST(request:NextRequest){try{const access=await requireApiAccess({lane:'admin'});const body=await request.json();const data=await recordConsent(access,{workspaceId:body.workspaceId,subject:String(body.subject||''),channel:body.channel,purpose:String(body.purpose||''),decision:body.decision,noticeVersion:String(body.noticeVersion||''),source:String(body.source||'operator'),lawfulBasis:body.lawfulBasis,metadata:body.metadata});return json({ok:true,consent:data},201)}catch(error){if(error instanceof ApiAccessError)return json({ok:false,code:error.code},error.status);const code=error instanceof Error?error.message.split(':')[0]:'privacy_consent_failed';return json({ok:false,code,error:'Consent event was not recorded.'},code.includes('required')||code.includes('invalid')?400:code.includes('denied')?403:500)}}
