import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { resetPilotStore } from "@/lib/admin/pilot-store";

const TEST_SECRET = "m14a1-pilot-route-secret";
const fromMock = vi.fn();
const upsertMock = vi.fn();
const insertMock = vi.fn();

let pilotRoute: typeof import("@/app/api/admin/pilot/route");

const originalEnv = {
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  ADMIN_SECRET: process.env.ADMIN_SECRET,
  ADMIN_API_PASSWORD: process.env.ADMIN_API_PASSWORD,
  NEXT_PUBLIC_ADMIN_PASSWORD: process.env.NEXT_PUBLIC_ADMIN_PASSWORD,
};

function configureSupabaseMock() {
  fromMock.mockImplementation(() => ({
    select: () => ({
      limit: async () => ({ data: [], error: null }),
    }),
    upsert: upsertMock,
    insert: insertMock,
  }));

  upsertMock.mockResolvedValue({ error: null });
  insertMock.mockResolvedValue({ error: null });
}

describe("admin pilot route", () => {
  beforeEach(async () => {
    vi.resetModules();
    resetPilotStore();

    fromMock.mockReset();
    upsertMock.mockReset();
    insertMock.mockReset();
    configureSupabaseMock();

    vi.doMock("@/lib/admin-route", () => ({
      requireAdmin: vi.fn(() => null),
    }));

    vi.doMock("@/lib/supabase/admin", () => ({
      createSupabaseAdminClient: () => ({
        from: fromMock,
      }),
    }));

    pilotRoute = await import("@/app/api/admin/pilot/route");

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

  it("returns the unified pilot payload from authenticated GET", async () => {
    const response = await pilotRoute.GET(
      new NextRequest("http://localhost/api/admin/pilot", {
        headers: {
          "x-admin-secret": TEST_SECRET,
        },
      }),
    );

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.workspaceDisplayName).toBe("Oye Imagine");
    expect(data.snapshot.workspace.brand).toBe("Neejee");
    expect(data.pilot.id).toBe("neejee-pilot");
    expect(data.pilot.brandName).toBe("Neejee");
  });

  it("updates both live snapshot and pilot payload from authenticated PUT", async () => {
    const response = await pilotRoute.PUT(
      new NextRequest("http://localhost/api/admin/pilot", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-admin-secret": TEST_SECRET,
        },
        body: JSON.stringify({
          executiveBrief: ["Pilot approved for controlled activation."],
          pilot: {
            brandName: "Neejee Clinics",
            website: "https://neejee.example",
            status: "ready_for_review",
            primaryChannels: ["seo", "google-ads"],
          },
        }),
      }),
    );

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.snapshot.executiveBrief[0]).toContain("Pilot approved");
    expect(data.pilot.brandName).toBe("Neejee Clinics");
    expect(data.pilot.website).toBe("https://neejee.example");
    expect(data.pilot.status).toBe("ready_for_review");
    expect(data.pilot.primaryChannels).toEqual(["seo", "google-ads"]);
    expect(upsertMock).toHaveBeenCalled();
  });
});