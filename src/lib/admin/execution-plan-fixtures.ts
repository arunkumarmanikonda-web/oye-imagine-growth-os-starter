import { createExecutionPlanDraftRecord } from "@/lib/admin/execution-plan-schema";

export const executionPlanDraftFixture = createExecutionPlanDraftRecord({
  id: "execution-plan-pilot-demo",
  pilotId: "pilot-demo",
  workspaceId: "workspace-demo",
  status: "draft",
  campaignName: "Pilot Demo Execution Plan",
  launchWindow: "Next 10 business days",
  milestones: [
    "Lock campaign summary and channel priorities.",
    "Finalize asset QA and launch schedule.",
    "Run launch-day readiness review with owners.",
  ],
  owners: [
    "Jordan - Growth Lead",
    "Taylor - Lifecycle Lead",
    "Alex - Paid Media Lead",
  ],
  blockers: [
    "Need final confirmation on stakeholder review timing.",
  ],
  checklist: [
    "Approve launch scope.",
    "Verify channel-level dependencies.",
    "Confirm owners and due dates.",
  ],
  notes: [
    "Fixture for execution-plan tests and local development.",
  ],
});