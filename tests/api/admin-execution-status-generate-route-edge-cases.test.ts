import { beforeEach, describe, expect, it, vi } from "vitest";

const generatorMockFns = vi.hoisted(() => ({
  generateExecutionStatusDraft: vi.fn(),
}));

vi.mock("@/lib/admin/execution-status-generator", () => ({
  generateExecutionStatusDraft: generatorMockFns.generateExecutionStatusDraft,
}));

import { POST } from "@/app/api/admin/execution-status/generate/route";

describe("admin execution-status generate route edge cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 404 when the pilot cannot be resolved", async () => {
    generatorMockFns.generateExecutionStatusDraft.mockRejectedValue(
      Object.assign(new Error("Pilot not found"), { code: "NOT_FOUND" })
    );

    const request = new Request("http://localhost/api/admin/execution-status/generate", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ pilotId: "pilot-missing" }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(generatorMockFns.generateExecutionStatusDraft).toHaveBeenCalledTimes(1);
    expect(generatorMockFns.generateExecutionStatusDraft).toHaveBeenCalledWith({ pilotId: "pilot-missing" });
    expect(json).toHaveProperty("error");
  });

  it("returns 500 when generation fails unexpectedly", async () => {
    generatorMockFns.generateExecutionStatusDraft.mockRejectedValue(
      new Error("database offline")
    );

    const request = new Request("http://localhost/api/admin/execution-status/generate", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ pilotId: "pilot-123" }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(generatorMockFns.generateExecutionStatusDraft).toHaveBeenCalledTimes(1);
    expect(generatorMockFns.generateExecutionStatusDraft).toHaveBeenCalledWith({ pilotId: "pilot-123" });
    expect(json).toHaveProperty("error");
  });
});