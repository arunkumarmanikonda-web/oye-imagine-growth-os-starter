import { NextRequest, NextResponse } from 'next/server';
import { ApiAccessError, requireApiAccess } from '@/lib/auth/api-access';
import {
  listProviderConfiguration,
  saveProviderCredential,
} from '@/lib/config-control/provider-vault';

function errorResponse(error: unknown) {
  if (error instanceof ApiAccessError) {
    return NextResponse.json({ ok: false, code: error.code }, { status: error.status });
  }
  const code = error instanceof Error ? error.message.split(':')[0] : 'provider_config_failed';
  const status = code === 'platform_owner_required' ? 403 : 500;
  return NextResponse.json({ ok: false, code }, { status });
}

export async function GET() {
  try {
    const access = await requireApiAccess({ lane: 'admin' });
    const configuration = await listProviderConfiguration(access);
    return NextResponse.json(
      { ok: true, configuration },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const access = await requireApiAccess({ lane: 'admin' });
    const payload = (await request.json()) as {
      providerKey?: string;
      fieldKey?: string;
      value?: string;
      environment?: 'development' | 'preview' | 'staging' | 'production';
    };
    if (!payload.providerKey || !payload.fieldKey || typeof payload.value !== 'string') {
      return NextResponse.json({ ok: false, code: 'provider_credential_payload_required' }, { status: 400 });
    }
    const result = await saveProviderCredential({
      access,
      providerKey: payload.providerKey,
      fieldKey: payload.fieldKey,
      value: payload.value,
      environment: payload.environment,
    });
    return NextResponse.json(
      { ok: true, result },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
