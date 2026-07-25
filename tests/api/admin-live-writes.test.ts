import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const TEST_SECRET = "m13e-write-secret";
const fromMock = vi.fn();
const upsertMock = vi.fn();
const insertMock = vi.fn();

const originalEnv = {
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  ADMIN_SECRET: process.env.ADMIN_SECRET,
  ADMIN_API_PASSWORD: process.env.ADMIN_API_PASSWORD,
  NEXT_PUBLIC_ADMIN_PASSWORD: process.env.NEXT_PUBLIC_ADMIN_PASSWORD,
};

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: () => ({
    from: fromMock,
  }),
}));

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

describe("Neejee admin live write rails", () => {
  beforeEach(() => {
    vi.resetModules();
    fromMock.mockReset();
    upsertMock.mockReset();
    insertMock.mockReset();
    configureSupabaseMock();

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

  it("saves onboarding patches through the live helper", async () => {
    const { saveNeejeeOnboardingSnapshotLive } = await import("@/lib/admin/neejee-live");

    const snapshot = await saveNeejeeOnboardingSnapshotLive({
      workspace: {
        owner: "Ops Lead",
      },
    });

    expect(snapshot.workspace.owner).toBe("Ops Lead");
    expect(upsertMock).toHaveBeenCalled();
    expect(fromMock).toHaveBeenCalledWith("workspace_settings");
  });

  it("saves brand intelligence patches through the live helper", async () => {
    const { saveNeejeeBrandIntelligenceSnapshotLive } = await import("@/lib/admin/neejee-live");

    const snapshot = await saveNeejeeBrandIntelligenceSnapshotLive({
      profileStatus: "ready",
      approvedLanguage: ["Warm", "Intentional", "Founder-led"],
    });

    expect(snapshot.profileStatus).toBe("ready");
    expect(snapshot.approvedLanguage.length).toBeGreaterThanOrEqual(3);
    expect(upsertMock).toHaveBeenCalled();
  });

  it("saves pilot control patches through the live helper", async () => {
    const { saveNeejeePilotControlSnapshotLive } = await import("@/lib/admin/neejee-live");

    const snapshot = await saveNeejeePilotControlSnapshotLive({
      executiveBrief: ["Pilot approved for controlled activation."],
    });

    expect(snapshot.executiveBrief[0]).toContain("Pilot approved");
    expect(upsertMock).toHaveBeenCalled();
  });

  it("accepts onboarding PUT writes", async () => {
    const { PUT } = await import("@/app/api/admin/onboarding/route");

    const response = await PUT(
      new Request("http://localhost:3000/api/admin/onboarding", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-admin-secret": TEST_SECRET,
        },
        body: JSON.stringify({
          workspace: {
            owner: "Ops Lead",
          },
        }),
      }) as any
    );

    expect(response.status).toBe(200);

    const payload = await response.json();
    expect(payload.ok).toBe(true);
    expect(payload.snapshot.workspace.owner).toBe("Ops Lead");
  });

  it("accepts brand intelligence PUT writes", async () => {
    const { PUT } = await import("@/app/api/admin/brand-intelligence/route");

    const response = await PUT(
      new Request("http://localhost:3000/api/admin/brand-intelligence", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-admin-secret": TEST_SECRET,
        },
        body: JSON.stringify({
          profileStatus: "ready",
          approvedLanguage: ["Warm", "Intentional"],
        }),
      }) as any
    );

    expect(response.status).toBe(200);

    const payload = await response.json();
    expect(payload.ok).toBe(true);
    expect(payload.snapshot.profileStatus).toBe("ready");
  });

  it("accepts pilot PUT writes", async () => {
    const { PUT } = await import("@/app/api/admin/pilot/route");

    const response = await PUT(
      new Request("http://localhost:3000/api/admin/pilot", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-admin-secret": TEST_SECRET,
        },
        body: JSON.stringify({
          executiveBrief: ["Pilot approved for controlled activation."],
        }),
      }) as any
    );

    expect(response.status).toBe(200);

    const payload = await response.json();
    expect(payload.ok).toBe(true);
    expect(payload.snapshot.executiveBrief[0]).toContain("Pilot approved");
  });
});