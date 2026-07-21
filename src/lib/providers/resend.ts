import { Resend } from 'resend';
import { requireEnv } from '@/lib/env';

export async function sendTestEmail(to: string, subject: string, html: string) {
  const resend = new Resend(requireEnv('RESEND_API_KEY'));
  return resend.emails.send({
    from: requireEnv('RESEND_FROM_EMAIL'),
    to,
    subject,
    html
  });
}
