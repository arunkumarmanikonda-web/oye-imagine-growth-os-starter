import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendTestSms } from '@/lib/providers/twilio';

const schema = z.object({
  to: z.string().min(8),
  body: z.string().min(1).max(1000)
});

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json());
    const result = await sendTestSms(body.to, body.body);
    return NextResponse.json({ ok: true, sid: result.sid, status: result.status });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 400 });
  }
}
