import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { getNeejeeOnboardingSnapshot } from "@/lib/admin/onboarding-seed";

let onboardingRoute: typeof import("@/app/api/admin/onboarding/route");

function makeRequest(url: string) {
  return new NextRequest(url, {
    method: "GET",
    headers: {
      "x-admin-secret": "test-admin-secret",
    },
  });
}

beforeEach(async () => {
  vi.resetModules();

  vi.doMock("@/lib/admin-route", () => ({
    requireAdmin: vi.fn(() => null),
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

  it("exposes critical blockers and decisions for activation governance", async () => {
    const response = await onboardingRoute.GET(
      makeRequest("http://localhost/api/admin/onboarding"),
    );

    const body = await response.json();

    expect(body.snapshot.blockers.some((item: { severity: string }) => item.severity === "critical")).toBe(true);
    expect(body.snapshot.decisions.length).toBeGreaterThanOrEqual(3);
  });
});