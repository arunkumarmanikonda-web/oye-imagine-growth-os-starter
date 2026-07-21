import { NextResponse } from 'next/server';
import { getSetupStatus } from '@/lib/setup-status';

export async function GET() {
  const status = getSetupStatus();
  return NextResponse.json({
    ok: true,
    ready: status.filter((item) => item.ready).length,
    total: status.length,
    checks: status
  });
}
