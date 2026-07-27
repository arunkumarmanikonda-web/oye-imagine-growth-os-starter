import { beforeEach, describe, expect, it, vi } from "vitest";

const { generateGoogleAdsDraftMock } = vi.hoisted(() => ({
  generateGoogleAdsDraftMock: vi.fn(),
}));

vi.mock("@/lib/admin/google-ads-generator", () => ({
  generateGoogleAdsDraft: generateGoogleAdsDraftMock,
}));

import { POST } from "@/app/api/admin/google-ads/generate/route";

describe("admin google ads generate route", () => {
  beforeEach(() => {
    generateGoogleAdsDraftMock.mockReset();
  });

  it("generates and returns a Google Ads draft", async () => {
    generateGoogleAdsDraftMock.mockReturnValue({
      pilotId: "neejee-pilot",
      workspaceDisplayName: "Oye Imagine",
      brandName: "Neejee Clinics",
      objective: "Generate qualified consultation demand.",
      keywordClusters: [
        {
          theme: "Hair transplant high intent",
          keywords: ["best hair transplant clinic"],
        },
      ],
    });

    const request = new Request("http://localhost/api/admin/google-ads/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        pilotId: "neejee-pilot",
        forceRegenerate: true,
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.ok).toBe(true);
    expect(json.workspaceDisplayName).toBe("Oye Imagine");
    expect(json.googleAdsDraft.brandName).toBe("Neejee Clinics");
    expect(json.googleAdsDraft.keywordClusters.length).toBe(1);
    expect(generateGoogleAdsDraftMock).toHaveBeenCalledWith({
      pilotId: "neejee-pilot",
      forceRegenerate: true,
    });
  });

  it("uses defaults when request body is empty", async () => {
    generateGoogleAdsDraftMock.mockReturnValue({
      pilotId: "neejee-pilot",
      workspaceDisplayName: "Oye Imagine",
      objective: "Generate qualified consultation demand.",
    });

    const request = new Request("http://localhost/api/admin/google-ads/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.ok).toBe(true);
    expect(generateGoogleAdsDraftMock).toHaveBeenCalledWith({
      pilotId: undefined,
      forceRegenerate: false,
    });
  });

  it("returns 404 when the pilot does not exist", async () => {
    generateGoogleAdsDraftMock.mockImplementation(() => {
      throw new Error("Pilot not found: missing-pilot");
    });

    const request = new Request("http://localhost/api/admin/google-ads/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        pilotId: "missing-pilot",
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.ok).toBe(false);
    expect(json.error).toContain("Pilot not found: missing-pilot");
  });

  it("returns 400 when the request body is not a JSON object", async () => {
    const request = new Request("http://localhost/api/admin/google-ads/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(["not-an-object"]),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.ok).toBe(false);
    expect(json.error).toContain("Request body must be a JSON object");
  });
});