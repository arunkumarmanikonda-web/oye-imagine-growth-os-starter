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

function buildRequest(url: string = "http://localhost/api/admin/execution-status/summary") {
  return new NextRequest(url);
}

describe("admin execution status summary route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns persisted execution-status summary", async () => {
    getExecutionStatusDraftMock.mockReturnValue(buildDraft());

    const response = await GET(buildRequest());
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(generateExecutionStatusDraftMock).not.toHaveBeenCalled();
    expect(json).toEqual({
      pilotId: "pilot-001",
      campaignName: "Acme Co / Jane Doe rollout",
      overallStatus: "Launch motion is active with one blocker under review.",
      completedCount: 2,
      inProgressCount: 1,
      blockedCount: 1,
      upcomingCount: 2,
      lastUpdatedAt: "2026-01-01T00:15:00.000Z",
      detailHref: "/admin/execution-status/pilot-001",
    });
  });

  it("generates summary when store data is absent", async () => {
    getExecutionStatusDraftMock.mockReturnValue(undefined);
    generateExecutionStatusDraftMock.mockReturnValue(
      buildDraft({
        pilotId: "pilot-xyz",
        campaignName: "Generated execution summary",
      }),
    );

    const response = await GET(buildRequest());
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(generateExecutionStatusDraftMock).toHaveBeenCalledWith({});
    expect(json.pilotId).toBe("pilot-xyz");
    expect(json.campaignName).toBe("Generated execution summary");
  });

  it("returns correct counts", async () => {
    getExecutionStatusDraftMock.mockReturnValue(
      buildDraft({
        completedItems: ["one"],
        inProgressItems: ["two", "three"],
        blockedItems: [],
        upcomingItems: ["four", "five", "six"],
      }),
    );

    const response = await GET(buildRequest());
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.completedCount).toBe(1);
    expect(json.inProgressCount).toBe(2);
    expect(json.blockedCount).toBe(0);
    expect(json.upcomingCount).toBe(3);
  });

  it("returns 404 when pilot is missing", async () => {
    getExecutionStatusDraftMock.mockReturnValue(undefined);
    generateExecutionStatusDraftMock.mockImplementation(() => {
      throw new Error("Pilot not found");
    });

    const response = await GET(buildRequest());
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json).toEqual({ error: "Pilot not found" });
  });
});