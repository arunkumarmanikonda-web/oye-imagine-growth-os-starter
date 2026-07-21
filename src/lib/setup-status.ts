import { env } from '@/lib/env';

export type SetupItem = {
  key: string;
  label: string;
  ready: boolean;
  note: string;
};

export function getSetupStatus(): SetupItem[] {
  return [
    {
      key: 'github',
      label: 'Git repository bootstrap',
      ready: true,
      note: 'Local starter scaffold created. Push to GitHub, then import into Vercel.'
    },
    {
      key: 'vercel',
      label: 'Vercel deployment',
      ready: !!env.NEXT_PUBLIC_APP_URL,
      note: env.NEXT_PUBLIC_APP_URL ? `App URL set: ${env.NEXT_PUBLIC_APP_URL}` : 'Set NEXT_PUBLIC_APP_URL after Vercel project creation.'
    },
    {
      key: 'supabase',
      label: 'Supabase project + keys',
      ready: !!env.NEXT_PUBLIC_SUPABASE_URL && !!env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !!env.SUPABASE_SERVICE_ROLE_KEY,
      note: 'Requires Supabase URL, anon key, and service role key.'
    },
    {
      key: 'resend',
      label: 'Resend email',
      ready: !!env.RESEND_API_KEY && !!env.RESEND_FROM_EMAIL,
      note: 'Resend is configured only for email, not SMS.'
    },
    {
      key: 'sms',
      label: 'SMS gateway',
      ready: !!env.TWILIO_ACCOUNT_SID && !!env.TWILIO_AUTH_TOKEN && (!!env.TWILIO_MESSAGING_SERVICE_SID || !!env.TWILIO_SMS_FROM),
      note: 'Starter uses Twilio placeholders. India DLT registration is still required before production sends.'
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp Cloud API',
      ready: !!env.WHATSAPP_ACCESS_TOKEN && !!env.WHATSAPP_PHONE_NUMBER_ID && !!env.WHATSAPP_VERIFY_TOKEN,
      note: 'Meta access token, phone number ID, and verify token required.'
    }
  ];
}
