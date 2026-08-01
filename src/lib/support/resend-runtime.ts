import { oyeImagineOrganizationProfile } from "@/lib/foundation/organization-profile";

export interface ResendRuntimeStatus {
  provider: "resend";
  configured: boolean;
  apiKeyPresent: boolean;
  fromEmail: string;
  supportMailbox: string;
  status: "ready" | "configuration_required";
  notes: string[];
}

function clean(value: string | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export function getResendRuntimeStatus(
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>,
): ResendRuntimeStatus {
  const apiKey = clean(env.RESEND_API_KEY);
  const fromEmail = clean(env.RESEND_FROM_EMAIL) ?? oyeImagineOrganizationProfile.resendFromEmail;
  const supportMailbox = oyeImagineOrganizationProfile.supportMailbox;
  const notes: string[] = [];

  if (!apiKey) {
    notes.push("RESEND_API_KEY is not configured.");
  }

  if (!clean(env.RESEND_FROM_EMAIL)) {
    notes.push(`RESEND_FROM_EMAIL not provided. Falling back to ${fromEmail}.`);
  }

  if (fromEmail !== supportMailbox) {
    notes.push(`Support mailbox remains ${supportMailbox}; outbound sender is ${fromEmail}.`);
  }

  return {
    provider: "resend",
    configured: Boolean(apiKey),
    apiKeyPresent: Boolean(apiKey),
    fromEmail,
    supportMailbox,
    status: apiKey ? "ready" : "configuration_required",
    notes,
  };
}