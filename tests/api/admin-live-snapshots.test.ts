import { beforeEach, describe, expect, it, vi } from "vitest";

const fromMock = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: () => ({
    from: fromMock,
  }),
}));

describe("Neejee live snapshot loaders", () => {
  beforeEach(() => {
    fromMock.mockReset();
  });

  it("falls back safely when Supabase reads fail", async () => {
    fromMock.mockReturnValue({
      select: () => ({
        limit: async () => ({ data: null, error: { message: "missing table" } }),
      }),
    });

    const { getNeejeeOnboardingSnapshotLive, getNeejeeBrandIntelligenceSnapshotLive } = await import(
      "@/lib/admin/neejee-live"
    );

    const onboarding = await getNeejeeOnboardingSnapshotLive();
    const brand = await getNeejeeBrandIntelligenceSnapshotLive();

    expect(onboarding.workspace.brand).toBe("Neejee");
    expect(brand.workspace.brand).toBe("Neejee");
    expect(brand.positioning.essence).toBe("FOUND. PERSONAL.");
  });

  it("merges Supabase overlay data when workspace records are present", async () => {
    fromMock.mockImplementation((table: string) => ({
      select: () => ({
        limit: async () => {
          if (table === "workspace_settings") {
            return {
              data: [
                {
                  workspace_slug: "neejee",
                  updated_at: "2026-07-25T16:50:00.000Z",
                  snapshot: {
                    workspace: {
                      brand: "Neejee",
                    },
                    readinessCards: [
                      { label: "Activation prep", score: 91, status: "ready" },
                      { label: "Integrations", score: 82, status: "ready" },
                    ],
                    services: [
                      { label: "Brand sprint" },
                      { label: "Marketplace ops" },
                    ],
                    integrations: [
                      { label: "WhatsApp", status: "ready" },
                    ],
                    positioning: {
                      essence: "FOUND. PERSONAL.",
                    },
                    identityCards: [
                      { title: "Founder-led" },
                      { title: "Quiet premium" },
                      { title: "Culturally rooted" },
                      { title: "Emotionally intelligent" },
                    ],
                    approvedLanguage: ["Warm", "Intentional"],
                    prohibitedLanguage: ["Discount-led"],
                    profileStatus: "ready",
                  },
                },
              ],
              error: null,
            };
          }

          return { data: [], error: null };
        },
      }),
    }));

    const { getNeejeePilotControlSnapshotLive } = await import("@/lib/admin/neejee-live");
    const snapshot = await getNeejeePilotControlSnapshotLive();

    expect(snapshot.workspace.brand).toBe("Neejee");
    expect(snapshot.signals.readinessScore).toBeGreaterThanOrEqual(80);
    expect(snapshot.signals.pendingIntegrations).toBe(0);
    expect(snapshot.stages.some((stage) => stage.href === "/admin/brand-intelligence")).toBe(true);
    expect(snapshot.workspace.updatedAt).toBe("2026-07-25T16:50:00.000Z");
  });
});