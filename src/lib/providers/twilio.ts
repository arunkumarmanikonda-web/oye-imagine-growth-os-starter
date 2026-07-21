import twilio from 'twilio';
import type { MessageListInstanceCreateOptions } from 'twilio/lib/rest/api/v2010/account/message';
import { env, requireEnv } from '@/lib/env';

export async function sendTestSms(to: string, body: string) {
  const client = twilio(requireEnv('TWILIO_ACCOUNT_SID'), requireEnv('TWILIO_AUTH_TOKEN'));
  const payload: MessageListInstanceCreateOptions = { to, body };

  if (env.TWILIO_MESSAGING_SERVICE_SID) {
    payload.messagingServiceSid = env.TWILIO_MESSAGING_SERVICE_SID;
  } else {
    payload.from = requireEnv('TWILIO_SMS_FROM');
  }

  return client.messages.create(payload);
}
