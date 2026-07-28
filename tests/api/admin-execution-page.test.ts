import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => React.createElement("a", { href }, children),
}));

vi.mock("@/lib/admin/execution-status-store", () => ({
  getExecutionStatusDraft: vi.fn(),
}));

vi.mock("@/lib/admin/execution-status-generator", () => ({
  generateExecutionStatusDraft: vi.fn(),
}));

import ExecutionPage from "@/app/admin/execution/page";
import { getExecutionStatusDraft } from "@/lib/admin/execution-status-store";
import { generateExecutionStatusDraft } from "@/lib/admin/execution-status-generator";

const getExecutionStatusDraftMock = vi.mocked(getExecutionStatusDraft);
const generateExecutionStatusDraftMock = vi.mocked(generateExecutionStatusDraft);

function buildDraft(overrides: Record<string, unknown> = {}) {
  return {
    id: "execution-status-001",
    pilotId: "pilot-001",
    workspaceId: "workspace-001",
    generatedAt: "2026-01-01T00:00:00.000Z",
    lastUpdatedAt: "2026-01-01T00:15:00.000Z",
    status: "draft",
    campaignName: "Acme Co / Jane Doe rollout",
    overallStatus: "Launch motion is active with one blocker under review.",
    completedItems: ["Landing page approved", "Email sequence approved"],
    inProgressItems: ["Google Ads QA"],
    blockedItems: ["WhatsApp business verification"],
    upcomingItems: ["Launch readiness review", "Go-live checklist sign-off"],
    notes: ["Primary focus is launch readiness."],
    ...overrides,
  };
}

describe("admin execution page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders persisted execution-status summary", async () => {
    getExecutionStatusDraftMock.mockReturnValue(buildDraft());

    const markup = renderToStaticMarkup(
      await (ExecutionPage as unknown as () => Promise<React.ReactElement>)(),
    );

    expect(generateExecutionStatusDraftMock).not.toHaveBeenCalled();
    expect(markup).toContain("Execution");
    expect(markup).toContain("Execution status");
    expect(markup).toContain("Acme Co / Jane Doe rollout");
    expect(markup).toContain("Launch motion is active with one blocker under review.");
    expect(markup).toContain('href="/admin/execution-status/pilot-001"');
  });

  it("generates summary when store data is absent", async () => {
    getExecutionStatusDraftMock.mockReturnValue(undefined);
    generateExecutionStatusDraftMock.mockReturnValue(
      buildDraft({
        pilotId: "pilot-xyz",
        campaignName: "Generated execution status",
      }),
    );

    const markup = renderToStaticMarkup(
      await (ExecutionPage as unknown as () => Promise<React.ReactElement>)(),
    );

    expect(generateExecutionStatusDraftMock).toHaveBeenCalledWith({});
    expect(markup).toContain("Generated execution status");
    expect(markup).toContain('href="/admin/execution-status/pilot-xyz"');
  });

  it("shows correct counts and status text", async () => {
    getExecutionStatusDraftMock.mockReturnValue(
      buildDraft({
        completedItems: ["one", "two", "three"],
        inProgressItems: ["one", "two"],
        blockedItems: ["one"],
        upcomingItems: ["one", "two", "three", "four"],
        overallStatus: "Execution is on track with one blocker.",
        lastUpdatedAt: "2026-01-02T10:30:00.000Z",
      }),
    );

    const markup = renderToStaticMarkup(
      await (ExecutionPage as unknown as () => Promise<React.ReactElement>)(),
    );

    expect(markup).toContain("Execution is on track with one blocker.");
    expect(markup).toContain("<dt>Completed</dt><dd>3</dd>");
    expect(markup).toContain("<dt>In progress</dt><dd>2</dd>");
    expect(markup).toContain("<dt>Blocked</dt><dd>1</dd>");
    expect(markup).toContain("<dt>Upcoming</dt><dd>4</dd>");
    expect(markup).toContain("2026-01-02T10:30:00.000Z");
  });

  it("preserves existing execution page behavior", async () => {
    getExecutionStatusDraftMock.mockReturnValue(buildDraft());

    const markup = renderToStaticMarkup(
      await (ExecutionPage as unknown as () => Promise<React.ReactElement>)(),
    );

    expect(markup).toContain("<main>");
    expect(markup).toContain("Track launch readiness and execution progress across the pilot workspace.");
  });
});