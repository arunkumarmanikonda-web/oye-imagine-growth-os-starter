import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/admin/execution-status-store", () => ({
  getExecutionStatusDraft: vi.fn(),
}));

vi.mock("@/lib/admin/execution-status-generator", () => ({
  generateExecutionStatusDraft: vi.fn(),
}));

import { GET } from "@/app/api/admin/execution-status/summary/route";
import { getExecutionStatusDraft } from "@/lib/admin/execution-status-store";
import { generateExecutionStatusDraft } from "@/lib/admin/execution-status-generator";

const getExecutionStatusDraftMock = vi.mocked(getExecutionStatusDraft);
const generateExecutionStatusDraftMock = vi.mocked(generateExecutionStatusDraft);

function buildDraft(overrides: Record<string, unknown> = {}) {
  return {
    id: "execution-status-001",
    pilotId: "pilot-001",
    workspaceId: "workspace-001",
    campaignName: "Acme Co / Jane Doe rollout",
    overallStatus: "Launch motion is active with one blocker under review.",
    lastUpdatedAt: "2026-01-01T00:15:00.000Z",
    completedItems: ["Landing page approved", "Email sequence approved"],
    inProgressItems: ["Google Ads QA"],
    blockedItems: ["WhatsApp business verification"],
    upcomingItems: ["Launch readiness review", "Go-live checklist sign-off"],
    notes: ["Primary focus is launch readiness."],
    ...overrides,
  };
}

describe("admin execution status summary route mismatch fallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("regenerates summary when persisted execution-status draft belongs to another pilot", async () => {
    getExecutionStatusDraftMock.mockReturnValue(
      buildDraft({
        pilotId: "wrong-pilot",
        campaignName: "Wrong pilot draft",
      }),
    );

    generateExecutionStatusDraftMock.mockReturnValue(
      buildDraft({
        pilotId: "pilot-123",
        campaignName: "Generated execution summary",
      }),
    );

    const request = new NextRequest(
      "http://localhost/api/admin/execution-status/summary?pilotId=pilot-123",
    );

    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(getExecutionStatusDraftMock).toHaveBeenCalled();
    expect(generateExecutionStatusDraftMock).toHaveBeenCalledWith({ pilotId: "pilot-123" });
    expect(json).toEqual({
      pilotId: "pilot-123",
      campaignName: "Generated execution summary",
      overallStatus: "Launch motion is active with one blocker under review.",
      completedCount: 2,
      inProgressCount: 1,
      blockedCount: 1,
      upcomingCount: 2,
      lastUpdatedAt: "2026-01-01T00:15:00.000Z",
      detailHref: "/admin/execution-status/pilot-123",
    });
  });
});