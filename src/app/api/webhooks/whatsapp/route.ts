import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams;
  const mode = search.get('hub.mode');
  const token = search.get('hub.verify_token');
  const challenge = search.get('hub.challenge');

  if (mode === 'subscribe' && token && token === env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? 'ok', { status: 200 });
  }

  return NextResponse.json({ ok: false, error: 'Verification failed' }, { status: 403 });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({ ok: true, received: true, body });
}
