import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    token?: string;
  };

  const expected = process.env.ADMIN_BOOTSTRAP_TOKEN ?? '';
  if (!expected || body.token !== expected) {
    return NextResponse.json(
      { ok: false, error: 'invalid bootstrap token' },
      { status: 401 },
    );
  }

  return NextResponse.json({
    ok: true,
    bootstrapModeEnabled: true,
    timestamp: new Date().toISOString(),
  });
}