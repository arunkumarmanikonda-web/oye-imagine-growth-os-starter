import { env } from "../env";

export type Fast2SmsInput = {
  to: string;
  message: string;
};

function normalizeIndianNumber(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length > 10) return digits.slice(-10);
  return digits;
}

export async function sendFast2Sms(input: Fast2SmsInput) {
  if (!env.FAST2SMS_API_KEY) throw new Error("FAST2SMS_API_KEY is missing");
  if (!env.FAST2SMS_ROUTE) throw new Error("FAST2SMS_ROUTE is missing");
  if (!env.FAST2SMS_SENDER_ID) throw new Error("FAST2SMS_SENDER_ID is missing");
  if (!env.FAST2SMS_ENTITY_ID) throw new Error("FAST2SMS_ENTITY_ID is missing");

  const route =
    env.FAST2SMS_ROUTE.toLowerCase() === "dlt" ? "dlt_manual" : env.FAST2SMS_ROUTE;

  const payload: Record<string, unknown> = {
    route,
    sender_id: env.FAST2SMS_SENDER_ID,
    message: input.message,
    numbers: normalizeIndianNumber(input.to),
    entity_id: env.FAST2SMS_ENTITY_ID,
  };

  if (env.FAST2SMS_TEMPLATE_ID) {
    payload.template_id = env.FAST2SMS_TEMPLATE_ID;
  }

  const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
    method: "POST",
    headers: {
      authorization: env.FAST2SMS_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const raw = await response.text();
  let data: unknown = raw;

  try {
    data = JSON.parse(raw);
  } catch {}

  if (!response.ok) {
    throw new Error("Fast2SMS send failed: " + response.status + " " + raw);
  }

  return {
    ok: true,
    provider: "fast2sms",
    status: response.status,
    data,
  };
}