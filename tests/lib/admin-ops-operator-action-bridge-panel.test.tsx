import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { OperatorActionBridgePanel } from "../../src/app/admin/ops/operator-action-bridge-panel";

describe("admin ops operator action bridge panel", () => {
  it("renders bridge metrics, next action, and blockers", () => {
    const html = renderToStaticMarkup(
      <OperatorActionBridgePanel
        companyName="Neejee"
        bridge={{
          operatorQueueCount: 1,
          operatorQueueTypes: ["activation"],
          highestPriority: "medium",
          activationQueueCount: 1,
          queueSummary: {
            openApprovals: 0,
            pendingReports: 1,
            pendingCampaigns: 2,
            pendingStrategyTasks: 0,
            activeBlockers: 2,
          },
          sharedBlockers: [
            "Required providers are not production ready",
            "eSign provider not ready",
          ],
          nextBestAction: "Neejee: resolve 2 active blocker(s)",
          nextBestActionOwnerRole: "PROGRAM_MANAGER",
          managedQueueActionable: true,
          launchReady: false,
          blockingChecks: [
            "commercial: commercial review",
            "providers: provider readiness",
            "activation: activation gate",
          ],
          continuityReady: true,
        }}
      />,
    );

    expect(html).toContain("Operator action bridge");
    expect(html).toContain("Neejee");
    expect(html).toContain("Neejee: resolve 2 active blocker(s)");
    expect(html).toContain("PROGRAM_MANAGER");
    expect(html).toContain("Queue summary");
    expect(html).toContain("Open approvals");
    expect(html).toContain("Pending reports");
    expect(html).toContain("Pending campaigns");
    expect(html).toContain("Pending strategy tasks");
    expect(html).toContain("Active blockers");
    const queueSummaryMatches = html.match(/Queue summary/g) ?? [];
    expect(queueSummaryMatches).toHaveLength(1);
    expect(html).toContain("commercial: commercial review");
    expect(html).toContain("Required providers are not production ready");
    expect(html).toContain("\u2022 commercial: commercial review");
    expect(html).not.toContain("â€¢");
    expect(html).not.toContain("Ã¢â‚¬Â¢");
  });

  it("returns no markup when the bridge is absent", () => {
    const html = renderToStaticMarkup(
      <OperatorActionBridgePanel companyName={null} bridge={null} />,
    );

    expect(html).toBe("");
  });
});
