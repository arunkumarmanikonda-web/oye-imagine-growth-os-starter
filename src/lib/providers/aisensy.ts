import { env } from "../env";

export type AiSensyInput = {
  destination: string;
  userName: string;
  templateParams?: string[];
  source?: string;
  tags?: string[];
  attributes?: Record<string, string>;
  media?: {
    url: string;
    filename: string;
  };
};

function normalizePhone(input: string): string {
  const trimmed = input.trim();
  if (trimmed.startsWith("+")) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return "+91" + digits;
  if (digits.length === 12 && digits.startsWith("91")) return "+" + digits;
  return trimmed;
}

export async function sendAiSensyCampaign(input: AiSensyInput) {
  if (!env.AISENSY_API_KEY) throw new Error("AISENSY_API_KEY is missing");
  if (!env.AISENSY_CAMPAIGN_NAME) throw new Error("AISENSY_CAMPAIGN_NAME is missing");

  const payload: Record<string, unknown> = {
    apiKey: env.AISENSY_API_KEY,
    campaignName: env.AISENSY_CAMPAIGN_NAME,
    destination: normalizePhone(input.destination),
    userName: input.userName,
    source: input.source ?? env.AISENSY_SOURCE ?? "OyeImagineApp",
  };

  if (input.templateParams && input.templateParams.length > 0) {
    payload.templateParams = input.templateParams;
  }

  if (input.tags && input.tags.length > 0) {
    payload.tags = input.tags;
  }

  if (input.attributes && Object.keys(input.attributes).length > 0) {
    payload.attributes = input.attributes;
  }

  if (input.media?.url && input.media?.filename) {
    payload.media = input.media;
  }

  const response = await fetch("https://backend.aisensy.com/campaign/t1/api/v2", {
    method: "POST",
    headers: {
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
    throw new Error("AiSensy send failed: " + response.status + " " + raw);
  }

  return {
    ok: true,
    provider: "aisensy",
    status: response.status,
    data,
  };
}