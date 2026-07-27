import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  generateWhatsappDraft: vi.fn(),
}));

vi.mock("@/lib/admin/whatsapp-generator", () => ({
  generateWhatsappDraft: mocks.generateWhatsappDraft,
}));

import { POST } from "@/app/api/admin/whatsapp/generate/route";

describe("admin whatsapp generate route", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.generateWhatsappDraft.mockReturnValue({
      id: "whatsapp-pilot-1",
      pilotId: "pilot-1",
      workspaceId: "workspace-1",
      status: "draft",
      senderName: "Jordan at Acme AI",
      goal: "Book more qualified demos",
      messages: [
        { id: "msg-1", body: "Hello from WhatsApp." },
        { id: "msg-2", body: "Quick follow-up." },
        { id: "msg-3", body: "Open to a quick reply?" },
      ],
      notes: ["Generated from connected channel assets."],
    });
  });

  it("generates and returns a WhatsApp draft", async () => {
    const request = new Request("http://localhost/api/admin/whatsapp/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pilotId: "pilot-1" }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.generateWhatsappDraft).toHaveBeenCalledWith("pilot-1");
    expect(json.pilotId).toBe("pilot-1");
    expect(json.messages).toHaveLength(3);
  });

  it("uses defaults when request body is empty", async () => {
    const request = new Request("http://localhost/api/admin/whatsapp/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mocks.generateWhatsappDraft).toHaveBeenCalledWith("pilot-demo");
  });

  it("returns 404 when the pilot does not exist", async () => {
    mocks.generateWhatsappDraft.mockImplementation(() => {
      throw new Error('Pilot not found for ID "missing-pilot"');
    });

    const request = new Request("http://localhost/api/admin/whatsapp/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pilotId: "missing-pilot" }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toMatch(/Pilot not found/i);
  });

  it("returns 400 when the request body is not a JSON object", async () => {
    const request = new Request("http://localhost/api/admin/whatsapp/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(["pilot-1"]),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toMatch(/JSON object/i);
    expect(mocks.generateWhatsappDraft).not.toHaveBeenCalled();
  });
});