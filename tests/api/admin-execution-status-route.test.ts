import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/admin/execution-status/[pilotId]/route";
import { generateExecutionStatusDraft } from "@/lib/admin/execution-status-generator";
import { getExecutionStatusDraft } from "@/lib/admin/execution-status-store";

vi.mock("@/lib/admin/execution-status-store", () => ({
  getExecutionStatusDraft: vi.fn(),
}));

vi.mock("@/lib/admin/execution-status-generator", () => ({
  generateExecutionStatusDraft: vi.fn(),
}));

const mockedGetExecutionStatusDraft = vi.mocked(getExecutionStatusDraft);
const mockedGenerateExecutionStatusDraft = vi.mocked(generateExecutionStatusDraft);

function makeDraft(overrides: Record<string, unknown> = {}) {
  return {
    pilotId: "pilot-123",
    campaignName: "Neejee Activation Sprint",
    overallStatus: "In progress",
    completed: [
      "Brand intelligence approved",
      "Execution plan published",
    ],
    inProgress: [
      "Landing page QA",
      "Email sequence review",
    ],
    blocked: [
      "Finance sign-off pending",
    ],
    upcoming: [
      "Google Ads launch",
      "Marketplace activation",
    ],
    notes: [
      "Daily review remains active.",
    ],
    generatedAt: "2026-01-01T00:00:00.000Z",
    lastUpdatedAt: "2026-01-02T10:30:00.000Z",
    ...overrides,
  };
}

describe("admin execution status detail route", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns a persisted execution-status draft when it matches the pilot", async () => {
    const persistedDraft = makeDraft();

    mockedGetExecutionStatusDraft.mockReturnValue(persistedDraft);

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ pilotId: "pilot-123" }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(persistedDraft);
    expect(mockedGenerateExecutionStatusDraft).not.toHaveBeenCalled();
  });

  it("generates a draft when stored data is absent", async () => {
    const generatedDraft = makeDraft({
      overallStatus: "Blocked",
      blocked: ["Creative approval pending", "Tracking not configured"],
    });

    mockedGetExecutionStatusDraft.mockReturnValue(undefined);
    mockedGenerateExecutionStatusDraft.mockResolvedValue(generatedDraft);

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ pilotId: "pilot-123" }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(generatedDraft);
    expect(mockedGenerateExecutionStatusDraft).toHaveBeenCalledWith({
      pilotId: "pilot-123",
    });
  });

  it("regenerates a draft when the stored record is mismatched to the pilot", async () => {
    const mismatchedDraft = makeDraft({ pilotId: "pilot-other" });
    const regeneratedDraft = makeDraft({
      pilotId: "pilot-123",
      overallStatus: "Completed",
    });

    mockedGetExecutionStatusDraft.mockReturnValue(mismatchedDraft);
    mockedGenerateExecutionStatusDraft.mockResolvedValue(regeneratedDraft);

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ pilotId: "pilot-123" }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(regeneratedDraft);
    expect(mockedGenerateExecutionStatusDraft).toHaveBeenCalledWith({
      pilotId: "pilot-123",
    });
  });

  it("returns 404 when the pilot cannot be resolved", async () => {
    mockedGetExecutionStatusDraft.mockReturnValue(undefined);
    mockedGenerateExecutionStatusDraft.mockRejectedValue(
      new Error("Pilot pilot-missing was not found."),
    );

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ pilotId: "pilot-missing" }),
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Pilot pilot-missing was not found.",
    });
  });
});