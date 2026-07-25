import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GET } from "@/app/api/admin/pilot/route";
import { getNeejeePilotControlSnapshot } from "@/lib/admin/neejee-pilot";

const TEST_SECRET = "m13c-pilot-secret";

const originalEnv = {
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  ADMIN_SECRET: process.env.ADMIN_SECRET,
  ADMIN_API_PASSWORD: process.env.ADMIN_API_PASSWORD,
  NEXT_PUBLIC_ADMIN_PASSWORD: process.env.NEXT_PUBLIC_ADMIN_PASSWORD,
};

describe("Neejee pilot control snapshot", () => {
  it("connects onboarding, brand intelligence, and activation surfaces", () => {
    const snapshot = getNeejeePilotControlSnapshot();

    expect(snapshot.workspace.brand).toBe("Neejee");
    expect(snapshot.stages.length).toBeGreaterThanOrEqual(4);
    expect(snapshot.nextActions.length).toBeGreaterThanOrEqual(3);
    expect(snapshot.stages.some((stage) => stage.href === "/admin/onboarding")).toBe(true);
    expect(snapshot.stages.some((stage) => stage.href === "/admin/brand-intelligence")).toBe(true);
    expect(snapshot.stages.some((stage) => stage.href === "/admin/summary")).toBe(true);
    expect(snapshot.stages.some((stage) => stage.href === "/admin/marketplace")).toBe(true);
  });
});

describe("GET /api/admin/pilot", () => {
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
    const response = await GET(new Request("http://localhost:3000/api/admin/pilot"));

    expect(response.status).toBe(401);

    const payload = await response.json();
    expect(payload.ok).toBe(false);
  });

  it("returns the unified pilot snapshot for authenticated admin requests", async () => {
    const response = await GET(
      new Request("http://localhost:3000/api/admin/pilot", {
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
    expect(payload.snapshot.stages.length).toBeGreaterThanOrEqual(4);
    expect(payload.snapshot.nextActions.length).toBeGreaterThanOrEqual(3);
  });
});