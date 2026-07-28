import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { getCommercialSupabaseAdminClient } from '@/lib/commercial/supabase-admin';

describe('commercial supabase admin client env resolution', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('creates a client from NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

    const client = getCommercialSupabaseAdminClient();

    expect(client).toBeTruthy();
  });

  it('throws when service role key is missing', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_SERVICE_KEY;

    expect(() => getCommercialSupabaseAdminClient()).toThrow(/Missing Supabase environment variable/);
  });
});