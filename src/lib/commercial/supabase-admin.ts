import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function readRequiredEnv(names: string[]): string {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.trim().length > 0) {
      return value;
    }
  }

  throw new Error(`Missing Supabase environment variable. Checked: ${names.join(', ')}`);
}

export function getCommercialSupabaseAdminClient(): SupabaseClient {
  const url = readRequiredEnv(['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL']);
  const serviceRoleKey = readRequiredEnv(['SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SERVICE_KEY']);

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        'x-commercial-surface': 'admin-commercial',
      },
    },
  });
}