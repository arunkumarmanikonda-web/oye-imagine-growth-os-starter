import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendTestEmail } from '@/lib/providers/resend';

const schema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  html: z.string().min(1)
});

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json());
    const result = await sendTestEmail(body.to, body.subject, body.html);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 400 });
  }
}
