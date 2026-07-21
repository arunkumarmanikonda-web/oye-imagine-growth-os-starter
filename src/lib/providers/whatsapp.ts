import { requireEnv } from '@/lib/env';

export async function sendTestWhatsApp(to: string, body: string) {
  const phoneNumberId = requireEnv('WHATSAPP_PHONE_NUMBER_ID');
  const accessToken = requireEnv('WHATSAPP_ACCESS_TOKEN');

  const response = await fetch(`https://graph.facebook.com/v23.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { body }
    })
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(JSON.stringify(json));
  }
  return json;
}
