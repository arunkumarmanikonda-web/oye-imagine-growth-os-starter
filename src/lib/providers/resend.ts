import { Resend } from "resend";
import { env } from "../env";

export type ResendEmailInput = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
};

export async function sendResendEmail(input: ResendEmailInput) {
  if (!env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is missing");
  }

  if (!env.RESEND_FROM_EMAIL) {
    throw new Error("RESEND_FROM_EMAIL is missing");
  }

  const resend = new Resend(env.RESEND_API_KEY);

  const payload = {
    from: env.RESEND_FROM_EMAIL,
    to: input.to,
    subject: input.subject,
    text: input.text,
    ...(input.html ? { html: input.html } : {}),
  };

  const response = await resend.emails.send(payload);

  return {
    ok: true,
    provider: "resend",
    data: response,
  };
}