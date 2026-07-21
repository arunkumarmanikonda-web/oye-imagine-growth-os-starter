import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const challenge = request.nextUrl.searchParams.get("hub.challenge");
  if (challenge) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({
    ok: true,
    provider: "aisensy",
    note: "Webhook endpoint is reachable.",
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  console.log("whatsapp_webhook_event", JSON.stringify(body));

  return NextResponse.json({
    ok: true,
    received: true,
  });
}