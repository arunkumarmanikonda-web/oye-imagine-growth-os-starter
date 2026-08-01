import { NextResponse } from "next/server";
import { getSeedSupportMailLogs, summarizeSupportMailLogs } from "@/lib/support/support-mail-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const logs = getSeedSupportMailLogs();

  return NextResponse.json({
    ok: true,
    logs,
    summary: summarizeSupportMailLogs(logs),
  });
}