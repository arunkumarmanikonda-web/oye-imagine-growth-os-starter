import 'server-only'

export const env = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "",
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",

  RESEND_API_KEY: process.env.RESEND_API_KEY ?? "",
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL ?? "",

  AISENSY_API_KEY: process.env.AISENSY_API_KEY ?? "",
  AISENSY_CAMPAIGN_NAME: process.env.AISENSY_CAMPAIGN_NAME ?? "",
  AISENSY_SOURCE: process.env.AISENSY_SOURCE ?? "OyeImagineApp",

  FAST2SMS_API_KEY: process.env.FAST2SMS_API_KEY ?? "",
  FAST2SMS_ROUTE: process.env.FAST2SMS_ROUTE ?? "",
  FAST2SMS_SENDER_ID: process.env.FAST2SMS_SENDER_ID ?? "",
  FAST2SMS_ENTITY_ID: process.env.FAST2SMS_ENTITY_ID ?? "",
  FAST2SMS_TEMPLATE_ID: process.env.FAST2SMS_TEMPLATE_ID ?? "",
};

export function isPresent(value: string | undefined | null): boolean {
  return Boolean(value && value.trim().length > 0);
}

export function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value || value.trim().length === 0) {
    throw new Error(name + " is missing");
  }

  return value;
}
