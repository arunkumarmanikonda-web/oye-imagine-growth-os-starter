import { describe, expect, it, vi, beforeEach } from "vitest";

const { generateEmailSequenceDraftMock } = vi.hoisted(() => ({
  generateEmailSequenceDraftMock: vi.fn(),
}));

vi.mock("@/lib/admin/email-sequence-generator", () => ({
  generateEmailSequenceDraft: generateEmailSequenceDraftMock,
}));

import { POST } from "@/app/api/admin/email-sequence/generate/route";

describe("admin email sequence generate route", () => {
  beforeEach(() => {
    generateEmailSequenceDraftMock.mockReset();
  });

  it("generates and returns an email sequence draft", async () => {
    generateEmailSequenceDraftMock.mockReturnValue({
      pilotId: "pilot-email-1",
      workspaceId: "workspace-email-1",
      sequenceName: "Neejee founder introduction sequence",
      emails: [{ id: "email-1", subject: "Launch your growth system faster" }],
    });

    const request = new Request("http://localhost/api/admin/email-sequence/generate", {
      method: "POST",
      body: JSON.stringify({ pilotId: "pilot-email-1" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(generateEmailSequenceDraftMock).toHaveBeenCalledWith("pilot-email-1");
    expect(json).toMatchObject({
      pilotId: "pilot-email-1",
      sequenceName: "Neejee founder introduction sequence",
    });
  });

  it("uses defaults when request body is empty", async () => {
    generateEmailSequenceDraftMock.mockReturnValue({
      pilotId: "pilot-demo",
      workspaceId: "workspace-demo",
      sequenceName: "Default sequence",
      emails: [],
    });

    const request = new Request("http://localhost/api/admin/email-sequence/generate", {
      method: "POST",
      body: "",
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(generateEmailSequenceDraftMock).toHaveBeenCalledWith("pilot-demo");
    expect(json.pilotId).toBe("pilot-demo");
  });

  it("returns 404 when the pilot does not exist", async () => {
    generateEmailSequenceDraftMock.mockImplementation(() => {
      throw new Error("Pilot not found: pilot-missing");
    });

    const request = new Request("http://localhost/api/admin/email-sequence/generate", {
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
    const request = new Request("http://localhost/api/admin/email-sequence/generate", {
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