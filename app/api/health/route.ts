import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    surface: 'recovery',
    timestamp: new Date().toISOString(),
  });
}