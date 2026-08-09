import { NextResponse } from "next/server";

import { buildSocialCrmLifecycleExecutionSnapshot } from "@/lib/recovery/social-crm-lifecycle-foundation";

export async function GET() {
  const snapshot = buildSocialCrmLifecycleExecutionSnapshot();
  return NextResponse.json(snapshot);
}
