import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@/app/admin/summary/execution-status-summary-card", () => ({
  ExecutionStatusSummaryCard: () =>
    React.createElement(
      "section",
      {
        "data-testid": "execution-status-summary-card",
      },
      "Execution status summary card"
    ),
}));

import SummaryPage from "@/app/admin/summary/page";

describe("admin summary page", () => {
  it("renders the execution-status summary card once", async () => {
    const page = await SummaryPage();
    const html = renderToStaticMarkup(page);

    expect(html).toContain('data-testid="execution-status-summary-card"');
    expect(html).toContain("Execution status summary card");

    const matches =
      html.match(/data-testid="execution-status-summary-card"/g) ?? [];
    expect(matches).toHaveLength(1);
  });
});