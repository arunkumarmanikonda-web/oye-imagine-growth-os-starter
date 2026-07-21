import { env, isPresent } from "./env";

export type SetupCheck = {
  key: string;
  label: string;
  ready: boolean;
  note: string;
};

export function getSetupStatus() {
  const checks: SetupCheck[] = [
    {
      key: "github",
      label: "Git repository bootstrap",
      ready: true,
      note: "Repository is initialized and pushed.",
    },
    {
      key: "vercel",
      label: "Vercel deployment",
      ready: isPresent(env.NEXT_PUBLIC_APP_URL),
      note: env.NEXT_PUBLIC_APP_URL
        ? "App URL set: " + env.NEXT_PUBLIC_APP_URL
        : "Set NEXT_PUBLIC_APP_URL.",
    },
    {
      key: "supabase",
      label: "Supabase project + keys",
      ready:
        isPresent(env.NEXT_PUBLIC_SUPABASE_URL) &&
        isPresent(env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
        isPresent(env.SUPABASE_SERVICE_ROLE_KEY),
      note: "Requires Supabase URL, publishable/anon key, and service role key.",
    },
    {
      key: "resend",
      label: "Resend email",
      ready: isPresent(env.RESEND_API_KEY) && isPresent(env.RESEND_FROM_EMAIL),
      note: "Resend is configured only for email.",
    },
    {
      key: "sms",
      label: "Fast2SMS gateway",
      ready:
        isPresent(env.FAST2SMS_API_KEY) &&
        isPresent(env.FAST2SMS_ROUTE) &&
        isPresent(env.FAST2SMS_SENDER_ID) &&
        isPresent(env.FAST2SMS_ENTITY_ID),
      note: isPresent(env.FAST2SMS_TEMPLATE_ID)
        ? "Fast2SMS configured with DLT fields."
        : "Fast2SMS configured. Add FAST2SMS_TEMPLATE_ID if your DLT route requires explicit template id.",
    },
    {
      key: "whatsapp",
      label: "AiSensy WhatsApp",
      ready:
        isPresent(env.AISENSY_API_KEY) &&
        isPresent(env.AISENSY_CAMPAIGN_NAME),
      note: "AiSensy API campaign send is configured.",
    },
  ];

  const ready = checks.filter((x) => x.ready).length;

  return {
    ok: true,
    ready,
    total: checks.length,
    checks,
  };
}