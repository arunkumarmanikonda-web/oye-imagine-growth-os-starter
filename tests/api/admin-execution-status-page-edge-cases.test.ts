import { beforeEach, describe, expect, it, vi } from "vitest";

const storeMockFns = vi.hoisted(() => ({
  getExecutionStatusDraft: vi.fn(),
}));

const generatorMockFns = vi.hoisted(() => ({
  generateExecutionStatusDraft: vi.fn(),
}));

vi.mock("@/lib/admin/execution-status-store", () => ({
  getExecutionStatusDraft: storeMockFns.getExecutionStatusDraft,
}));

vi.mock("@/lib/admin/execution-status-generator", () => ({
  generateExecutionStatusDraft: generatorMockFns.generateExecutionStatusDraft,
}));

import ExecutionStatusPage from "@/app/admin/execution-status/[pilotId]/page";

describe("admin execution status page malformed persisted draft handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without regeneration when persisted draft shape is malformed", async () => {
    storeMockFns.getExecutionStatusDraft.mockReturnValue({
      pilotId: "pilot-123",
      generatedAt: "2026-01-01T00:15:00.000Z",
      summary: null,
      draft: null,
    });

    const page = await ExecutionStatusPage({
      params: Promise.resolve({ pilotId: "pilot-123" }),
    });

    expect(page).toBeTruthy();
    expect(storeMockFns.getExecutionStatusDraft).toHaveBeenCalledTimes(1);
    expect(generatorMockFns.generateExecutionStatusDraft).not.toHaveBeenCalled();
  });
});