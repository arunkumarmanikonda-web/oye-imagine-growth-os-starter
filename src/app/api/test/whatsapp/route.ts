import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendTestWhatsApp } from '@/lib/providers/whatsapp';

const schema = z.object({
  to: z.string().min(8),
  body: z.string().min(1).max(4096)
});

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json());
    const result = await sendTestWhatsApp(body.to, body.body);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 400 });
  }
}
