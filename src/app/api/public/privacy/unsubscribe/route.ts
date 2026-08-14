import { NextRequest, NextResponse } from 'next/server'
import { applyPublicUnsubscribe } from '@/lib/privacy/consent'

export const runtime='nodejs';export const dynamic='force-dynamic'

async function apply(request:NextRequest){const token=request.nextUrl.searchParams.get('token')||'';if(!token)return NextResponse.json({ok:false,code:'unsubscribe_token_required'},{status:400,headers:{'Cache-Control':'no-store'}});try{const result=await applyPublicUnsubscribe(token);return NextResponse.json(result,{headers:{'Cache-Control':'no-store'}})}catch(error){const code=error instanceof Error?error.message.split(':')[0]:'unsubscribe_failed';return NextResponse.json({ok:false,code,error:'The opt-out request could not be applied.'},{status:code.includes('expired')||code.includes('invalid')?400:500,headers:{'Cache-Control':'no-store'}})}}
export async function GET(request:NextRequest){return apply(request)}
export async function POST(request:NextRequest){return apply(request)}
