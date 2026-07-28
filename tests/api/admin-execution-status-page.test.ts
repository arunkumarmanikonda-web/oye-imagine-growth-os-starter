import React from "react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@/lib/admin/execution-status-store", () => ({
  getExecutionStatusDraft: vi.fn(),
}));

vi.mock("@/lib/admin/execution-status-generator", () => ({
  generateExecutionStatusDraft: vi.fn(),
}));

vi.mock("@/app/admin/execution-status/[pilotId]/regenerate-button", () => ({
  RegenerateButton: ({ pilotId }: { pilotId: string }) => (
    <button data-testid="regenerate-button" data-pilot-id={pilotId}>
      Regenerate draft
    </button>
  ),
  default: ({ pilotId }: { pilotId: string }) => (
    <button data-testid="regenerate-button" data-pilot-id={pilotId}>
      Regenerate draft
    </button>
  ),
}));

import ExecutionStatusPage from "@/app/admin/execution-status/[pilotId]/page";
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
    overallStatus: "Channel setup is progressing and launch blockers are isolated.",
    completedItems: ["Landing page draft approved"],
    inProgressItems: ["Google Ads copy review"],
    blockedItems: ["Waiting on WhatsApp business verification"],
    upcomingItems: ["Schedule launch readiness review"],
    notes: "Primary focus remains launch readiness across channels.",
    ...overrides,
  };
}

describe("admin execution status page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a persisted execution-status draft when it matches the pilot", async () => {
    getExecutionStatusDraftMock.mockReturnValue(
      buildDraft({ pilotId: "pilot-123" }),
    );

    const markup = renderToStaticMarkup(
      await ExecutionStatusPage({
        params: { pilotId: "pilot-123" },
      }),
    );

    expect(generateExecutionStatusDraftMock).not.toHaveBeenCalled();
    expect(markup).toContain("Acme Co / Jane Doe rollout");
    expect(markup).toContain(
      "Channel setup is progressing and launch blockers are isolated.",
    );
    expect(markup).toContain("Landing page draft approved");
    expect(markup).toContain("Google Ads copy review");
    expect(markup).toContain("Waiting on WhatsApp business verification");
    expect(markup).toContain("Schedule launch readiness review");
    expect(markup).toContain("Primary focus remains launch readiness across channels.");
    expect(markup).toContain('data-pilot-id="pilot-123"');
  });

  it("generates a draft when stored data is absent", async () => {
    getExecutionStatusDraftMock.mockReturnValue(undefined);
    generateExecutionStatusDraftMock.mockReturnValue(
      buildDraft({
        pilotId: "pilot-456",
        campaignName: "Generated rollout draft",
      }),
    );

    const markup = renderToStaticMarkup(
      await ExecutionStatusPage({
        params: { pilotId: "pilot-456" },
      }),
    );

    expect(generateExecutionStatusDraftMock).toHaveBeenCalledWith({
      pilotId: "pilot-456",
    });
    expect(markup).toContain("Generated rollout draft");
    expect(markup).toContain('data-pilot-id="pilot-456"');
  });

  it("regenerates a draft when the stored record is mismatched to the pilot", async () => {
    getExecutionStatusDraftMock.mockReturnValue(
      buildDraft({
        pilotId: "pilot-other",
        campaignName: "Mismatched stored draft",
      }),
    );
    generateExecutionStatusDraftMock.mockReturnValue(
      buildDraft({
        pilotId: "pilot-789",
        campaignName: "Fresh draft for requested pilot",
      }),
    );

    const markup = renderToStaticMarkup(
      await ExecutionStatusPage({
        params: { pilotId: "pilot-789" },
      }),
    );

    expect(generateExecutionStatusDraftMock).toHaveBeenCalledWith({
      pilotId: "pilot-789",
    });
    expect(markup).toContain("Fresh draft for requested pilot");
    expect(markup).not.toContain("Mismatched stored draft");
  });
});