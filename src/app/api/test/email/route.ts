import { NextRequest, NextResponse } from "next/server";
import { sendResendEmail } from "@/lib/providers/resend";
import { env } from "@/lib/env";

export async function GET() {
  return NextResponse.json({
    ok: true,
    provider: "resend",
    ready: Boolean(env.RESEND_API_KEY) && Boolean(env.RESEND_FROM_EMAIL),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const to =
      typeof body.to === "string" || Array.isArray(body.to) ? body.to : "";

    const subject =
      typeof body.subject === "string" && body.subject.trim().length > 0
        ? body.subject
        : "Oye !magine test email";

    const html =
      typeof body.html === "string"
        ? body.html
        : "<p>Oye !magine test email</p>";

    const text =
      typeof body.text === "string"
        ? body.text
        : "Oye !magine test email";

    if (!to || (Array.isArray(to) && to.length === 0)) {
      return NextResponse.json(
        { ok: false, error: "Missing 'to' in request body." },
        { status: 400 }
      );
    }

    const result = await sendResendEmail({
      to,
      subject,
      html,
      text,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        provider: "resend",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}