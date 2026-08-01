import { NextResponse } from "next/server";
import {
  buildAdminStudioHardeningChecklist,
  buildPublishGovernanceRules,
  buildSupportEscalationPlan,
  getSupportOperationsSnapshot,
} from "@/lib/support/support-operations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    snapshot: getSupportOperationsSnapshot(),
    governance: buildPublishGovernanceRules(),
    hardening: buildAdminStudioHardeningChecklist(),
    resendPlan: buildSupportEscalationPlan("resend"),
    mailLogPlan: buildSupportEscalationPlan("mail_log"),
  });
}