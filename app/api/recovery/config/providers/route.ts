import { NextResponse } from 'next/server';
import { providerCatalog } from '../../../../../src/lib/config-control/provider-catalog';

export async function GET() {
  return NextResponse.json({
    ok: true,
    providers: Object.values(providerCatalog),
  });
}