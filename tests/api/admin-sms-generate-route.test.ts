import { beforeEach, describe, expect, it, vi } from "vitest";

const { generateSmsDraftMock } = vi.hoisted(() => ({
  generateSmsDraftMock: vi.fn(),
}));

vi.mock("@/lib/admin/sms-generator", () => ({
  generateSmsDraft: generateSmsDraftMock,
}));

import { POST } from "@/app/api/admin/sms/generate/route";

describe("admin sms generate route", () => {
  beforeEach(() => {
    generateSmsDraftMock.mockReset();
  });

  it("generates and returns an SMS draft", async () => {
    generateSmsDraftMock.mockReturnValue({
      pilotId: "pilot-sms-1",
      workspaceId: "workspace-sms-1",
      senderName: "Avery Stone",
      messages: [{ id: "sms-1", body: "Launch your growth system faster" }],
    });

    const request = new Request("http://localhost/api/admin/sms/generate", {
      method: "POST",
      body: JSON.stringify({ pilotId: "pilot-sms-1" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(generateSmsDraftMock).toHaveBeenCalledWith("pilot-sms-1");
    expect(json).toMatchObject({
      pilotId: "pilot-sms-1",
      senderName: "Avery Stone",
    });
  });

  it("uses defaults when request body is empty", async () => {
    generateSmsDraftMock.mockReturnValue({
      pilotId: "pilot-demo",
      workspaceId: "workspace-demo",
      senderName: "Growth OS Team",
      messages: [],
    });

    const request = new Request("http://localhost/api/admin/sms/generate", {
      method: "POST",
      body: "",
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(generateSmsDraftMock).toHaveBeenCalledWith("pilot-demo");
    expect(json.pilotId).toBe("pilot-demo");
  });

  it("returns 404 when the pilot does not exist", async () => {
    generateSmsDraftMock.mockImplementation(() => {
      throw new Error("Pilot not found: pilot-missing");
    });

    const request = new Request("http://localhost/api/admin/sms/generate", {
      method: "POST",
      body: JSON.stringify({ pilotId: "pilot-missing" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json).toEqual({ error: "Pilot not found: pilot-missing" });
  });

  it("returns 400 when the request body is not a JSON object", async () => {
    const request = new Request("http://localhost/api/admin/sms/generate", {
      method: "POST",
      body: JSON.stringify(["not", "an", "object"]),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ error: "Request body must be a JSON object." });
  });
});