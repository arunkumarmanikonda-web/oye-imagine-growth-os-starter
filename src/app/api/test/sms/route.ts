import { NextRequest, NextResponse } from "next/server";
import { sendFast2Sms } from "@/lib/providers/fast2sms";
import { env } from "@/lib/env";

export async function GET() {
  return NextResponse.json({
    ok: true,
    provider: "fast2sms",
    ready:
      Boolean(env.FAST2SMS_API_KEY) &&
      Boolean(env.FAST2SMS_ROUTE) &&
      Boolean(env.FAST2SMS_SENDER_ID) &&
      Boolean(env.FAST2SMS_ENTITY_ID),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const to = typeof body.to === "string" ? body.to : "";
    const message =
      typeof body.message === "string" && body.message.trim().length > 0
        ? body.message
        : "Oye !magine test SMS";

    if (!to) {
      return NextResponse.json(
        { ok: false, error: "Missing 'to' in request body." },
        { status: 400 }
      );
    }

    const result = await sendFast2Sms({ to, message });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        provider: "fast2sms",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}