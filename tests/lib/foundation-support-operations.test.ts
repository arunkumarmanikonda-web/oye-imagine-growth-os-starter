import { describe, expect, it } from "vitest";
import {
  buildAdminStudioHardeningChecklist,
  buildPublishGovernanceRules,
  buildSupportEscalationPlan,
  getSupportOperationsSnapshot,
} from "../../src/lib/support/support-operations";

describe("foundation support operations", () => {
  it("returns support snapshot and closure readiness", () => {
    const snapshot = getSupportOperationsSnapshot({});

    expect(snapshot.channelCount).toBeGreaterThan(0);
    expect(snapshot.mailSummary.total).toBeGreaterThan(0);
    expect(snapshot.batchClosureReadiness.length).toBeGreaterThanOrEqual(4);
  });

  it("returns publish governance and hardening checklist", () => {
    const governance = buildPublishGovernanceRules();
    const hardening = buildAdminStudioHardeningChecklist();

    expect(governance.length).toBeGreaterThanOrEqual(4);
    expect(hardening.length).toBeGreaterThanOrEqual(4);
  });

  it("returns escalation plans for operational issues", () => {
    const resendPlan = buildSupportEscalationPlan("resend");
    const publishPlan = buildSupportEscalationPlan("publish");

    expect(resendPlan.some((step) => step.includes("RESEND_API_KEY"))).toBe(true);
    expect(publishPlan.some((step) => step.includes("Rollback"))).toBe(true);
  });
});