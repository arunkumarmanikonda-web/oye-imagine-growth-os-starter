import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@/app/admin/execution/execution-status-detail-rail", () => ({
  ExecutionStatusDetailRail: () =>
    React.createElement(
      "section",
      {
        "data-testid": "execution-status-detail-rail",
      },
      "Execution status detail rail"
    ),
}));

import AdminExecutionPage from "@/app/admin/execution/page";

describe("admin execution page detail rail", () => {
  it("renders the execution-status detail rail once", async () => {
    const page = await AdminExecutionPage();
    const html = renderToStaticMarkup(page);

    expect(html).toContain('data-testid="execution-status-detail-rail"');
    expect(html).toContain("Execution status detail rail");

    const matches = html.match(/data-testid="execution-status-detail-rail"/g) ?? [];
    expect(matches).toHaveLength(1);
  });
});