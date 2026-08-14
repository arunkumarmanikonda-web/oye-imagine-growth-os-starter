import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { applyDeliveryCallback } from '@/lib/privacy/delivery'

export const runtime='nodejs';export const dynamic='force-dynamic'

function authorized(request:NextRequest){const expected=process.env.OYE_PROVIDER_CALLBACK_SECRET?.trim();if(!expected)return false;const supplied=request.headers.get('authorization')?.replace(/^Bearer\s+/i,'').trim()||'';const a=Buffer.from(supplied),b=Buffer.from(expected);return a.length===b.length&&a.length>0&&crypto.timingSafeEqual(a,b)}

export async function POST(request:NextRequest){if(!authorized(request))return NextResponse.json({ok:false,code:process.env.OYE_PROVIDER_CALLBACK_SECRET?'callback_unauthorized':'callback_not_configured'},{status:process.env.OYE_PROVIDER_CALLBACK_SECRET?401:503,headers:{'Cache-Control':'no-store'}});try{const body=await request.json();const providerMessageId=String(body.providerMessageId||'').trim(),providerStatus=String(body.providerStatus||'').trim();if(!providerMessageId||!providerStatus)return NextResponse.json({ok:false,code:'callback_fields_required'},{status:400});const job=await applyDeliveryCallback({providerMessageId,providerStatus,metadata:body.metadata});return NextResponse.json({ok:true,job},{headers:{'Cache-Control':'no-store'}})}catch(error){return NextResponse.json({ok:false,code:error instanceof Error?error.message.split(':')[0]:'callback_failed'},{status:500,headers:{'Cache-Control':'no-store'}})}}
