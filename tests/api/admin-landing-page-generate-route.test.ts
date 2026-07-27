import { beforeEach, describe, expect, it, vi } from "vitest";

const { generateLandingPageBriefMock } = vi.hoisted(() => ({
  generateLandingPageBriefMock: vi.fn(),
}));

vi.mock("@/lib/admin/landing-page-generator", () => ({
  generateLandingPageBrief: generateLandingPageBriefMock,
}));

import { POST } from "@/app/api/admin/landing-page/generate/route";

describe("admin landing page generate route", () => {
  beforeEach(() => {
    generateLandingPageBriefMock.mockReset();
  });

  it("generates and returns a landing page brief", async () => {
    generateLandingPageBriefMock.mockReturnValue({
      pilotId: "neejee-pilot",
      workspaceDisplayName: "Oye Imagine",
      hero: {
        headline: "Book a confident next step with Neejee Clinics",
      },
    });

    const request = new Request("http://localhost/api/admin/landing-page/generate", {
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
    expect(json.landingPage.hero.headline).toContain("Neejee Clinics");
    expect(generateLandingPageBriefMock).toHaveBeenCalledWith({
      pilotId: "neejee-pilot",
      forceRegenerate: true,
    });
  });

  it("uses defaults when request body is empty", async () => {
    generateLandingPageBriefMock.mockReturnValue({
      pilotId: "neejee-pilot",
      workspaceDisplayName: "Oye Imagine",
    });

    const request = new Request("http://localhost/api/admin/landing-page/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.ok).toBe(true);
    expect(generateLandingPageBriefMock).toHaveBeenCalledWith({
      pilotId: undefined,
      forceRegenerate: false,
    });
  });

  it("returns 404 when the pilot does not exist", async () => {
    generateLandingPageBriefMock.mockImplementation(() => {
      throw new Error("Pilot not found: missing-pilot");
    });

    const request = new Request("http://localhost/api/admin/landing-page/generate", {
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
    const request = new Request("http://localhost/api/admin/landing-page/generate", {
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