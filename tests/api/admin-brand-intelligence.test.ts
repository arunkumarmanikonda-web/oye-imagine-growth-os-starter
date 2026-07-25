import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GET } from "@/app/api/admin/brand-intelligence/route";
import { getNeejeeBrandIntelligenceSnapshot } from "@/lib/admin/brand-intelligence-seed";

const TEST_SECRET = "m13b-brand-intelligence-secret";

const originalEnv = {
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  ADMIN_SECRET: process.env.ADMIN_SECRET,
  ADMIN_API_PASSWORD: process.env.ADMIN_API_PASSWORD,
  NEXT_PUBLIC_ADMIN_PASSWORD: process.env.NEXT_PUBLIC_ADMIN_PASSWORD,
};

describe("Neejee brand intelligence snapshot", () => {
  it("returns the stable pilot contract", () => {
    const snapshot = getNeejeeBrandIntelligenceSnapshot();

    expect(snapshot.workspace.brand).toBe("Neejee");
    expect(snapshot.positioning.essence).toBe("FOUND. PERSONAL.");
    expect(Array.isArray(snapshot.identityCards)).toBe(true);
    expect(snapshot.identityCards.length).toBeGreaterThanOrEqual(4);
    expect(Array.isArray(snapshot.approvedLanguage)).toBe(true);
    expect(snapshot.approvedLanguage.length).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(snapshot.prohibitedLanguage)).toBe(true);
    expect(snapshot.prohibitedLanguage.length).toBeGreaterThanOrEqual(1);
  });
});

describe("GET /api/admin/brand-intelligence", () => {
  beforeEach(() => {
    process.env.ADMIN_PASSWORD = TEST_SECRET;
    process.env.ADMIN_SECRET = TEST_SECRET;
    process.env.ADMIN_API_PASSWORD = TEST_SECRET;
    process.env.NEXT_PUBLIC_ADMIN_PASSWORD = TEST_SECRET;
  });

  afterEach(() => {
    process.env.ADMIN_PASSWORD = originalEnv.ADMIN_PASSWORD;
    process.env.ADMIN_SECRET = originalEnv.ADMIN_SECRET;
    process.env.ADMIN_API_PASSWORD = originalEnv.ADMIN_API_PASSWORD;
    process.env.NEXT_PUBLIC_ADMIN_PASSWORD = originalEnv.NEXT_PUBLIC_ADMIN_PASSWORD;
  });

  it("rejects unauthenticated requests", async () => {
    const response = await GET(
      new Request("http://localhost:3000/api/admin/brand-intelligence")
    );

    expect(response.status).toBe(401);

    const payload = await response.json();
    expect(payload.ok).toBe(false);
  });

  it("returns the brand intelligence snapshot for authenticated admin requests", async () => {
    const response = await GET(
      new Request("http://localhost:3000/api/admin/brand-intelligence", {
        headers: {
          "x-admin-secret": TEST_SECRET,
        },
      })
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control") ?? "").toContain("no-store");

    const payload = await response.json();

    expect(payload.ok).toBe(true);
    expect(payload.snapshot.workspace.brand).toBe("Neejee");
    expect(payload.snapshot.positioning.essence).toBe("FOUND. PERSONAL.");
    expect(payload.snapshot.identityCards.length).toBeGreaterThanOrEqual(4);
    expect(payload.snapshot.approvedLanguage.length).toBeGreaterThanOrEqual(1);
    expect(payload.snapshot.prohibitedLanguage.length).toBeGreaterThanOrEqual(1);
  });
});