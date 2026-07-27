import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { getNeejeeOnboardingSnapshot } from "@/lib/admin/onboarding-seed";
import { resetPilotStore } from "@/lib/admin/pilot-store";

const fromMock = vi.fn();
const upsertMock = vi.fn();
const insertMock = vi.fn();

let onboardingRoute: typeof import("@/app/api/admin/onboarding/route");

function makeRequest(url: string) {
  return new NextRequest(url, {
    method: "GET",
    headers: {
      "x-admin-secret": "test-admin-secret",
    },
  });
}

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

  onboardingRoute = await import("@/app/api/admin/onboarding/route");
});

describe("admin onboarding seed snapshot", () => {
  it("returns a Neejee pilot snapshot with expected structure", () => {
    const snapshot = getNeejeeOnboardingSnapshot();

    expect(snapshot.workspace.slug).toBe("neejee-pilot");
    expect(snapshot.workspace.brand).toBe("Neejee");
    expect(snapshot.workspace.stage).toBe("Activation preparation");
    expect(snapshot.workspace.autonomyLevel).toContain("Level 2");
    expect(snapshot.readiness.length).toBeGreaterThanOrEqual(8);
    expect(snapshot.services.length).toBeGreaterThanOrEqual(8);
    expect(snapshot.integrations.length).toBeGreaterThanOrEqual(8);
    expect(snapshot.timeline.length).toBeGreaterThanOrEqual(6);
    expect(snapshot.blockers.length).toBeGreaterThanOrEqual(2);
    expect(snapshot.brandContext.length).toBeGreaterThanOrEqual(3);
    expect(snapshot.tasks.length).toBeGreaterThanOrEqual(3);
    expect(snapshot.decisions.length).toBeGreaterThanOrEqual(3);
  });

  it("includes blocked finance and paid-media readiness signals", () => {
    const snapshot = getNeejeeOnboardingSnapshot();

    const billing = snapshot.readiness.find((item) => item.slug === "billing-readiness");
    const paidMedia = snapshot.readiness.find((item) => item.slug === "paid-media-readiness");

    expect(billing?.state).toBe("blocked");
    expect(paidMedia?.state).toBe("blocked");
  });
});

describe("admin onboarding route", () => {
  it("returns the onboarding snapshot payload", async () => {
    const response = await onboardingRoute.GET(
      makeRequest("http://localhost/api/admin/onboarding"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");

    const body = await response.json();

    expect(body.ok).toBe(true);
    expect(body.snapshot.workspace.brand).toBe("Neejee");
    expect(body.snapshot.workspace.stage).toBe("Activation preparation");
    expect(body.snapshot.readiness.some((item: { slug: string }) => item.slug === "brand-profile")).toBe(true);
    expect(body.snapshot.integrations.some((item: { slug: string }) => item.slug === "ga4")).toBe(true);
  });

  it("returns pilot payload alongside the onboarding snapshot", async () => {
    const response = await onboardingRoute.GET(
      makeRequest("http://localhost/api/admin/onboarding"),
    );

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.pilot.id).toBe("neejee-pilot");
    expect(body.pilot.brandName).toBe("Neejee");
    expect(body.pilot.status).toBe("draft");
  });

  it("accepts onboarding snapshot and pilot writes together", async () => {
    const response = await onboardingRoute.PUT(
      new NextRequest("http://localhost/api/admin/onboarding", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-admin-secret": "test-admin-secret",
        },
        body: JSON.stringify({
          snapshot: {
            workspace: {
              owner: "Ops Lead",
            },
          },
          pilot: {
            brandName: "Neejee Clinics",
            website: "https://neejee.example",
            primaryChannels: ["seo", "google-ads"],
            goals: ["Qualified leads"],
            successMetrics: ["CPL"],
            status: "in_progress",
          },
        }),
      }),
    );

    expect(response.status).toBe(200);

    const body = await response.json();

    expect(body.ok).toBe(true);
    expect(body.snapshot.workspace.owner).toBe("Ops Lead");
    expect(body.pilot.brandName).toBe("Neejee Clinics");
    expect(body.pilot.website).toBe("https://neejee.example");
    expect(body.pilot.status).toBe("in_progress");
    expect(body.pilot.primaryChannels).toEqual(["seo", "google-ads"]);
    expect(upsertMock).toHaveBeenCalled();
  });

  it("exposes critical blockers and decisions for activation governance", async () => {
    const response = await onboardingRoute.GET(
      makeRequest("http://localhost/api/admin/onboarding"),
    );

    const body = await response.json();

    expect(body.snapshot.blockers.some((item: { severity: string }) => item.severity === "critical")).toBe(true);
    expect(body.snapshot.decisions.length).toBeGreaterThanOrEqual(3);
  });
});