import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const { getLandingPageBriefMock, generateLandingPageBriefMock } = vi.hoisted(() => ({
  getLandingPageBriefMock: vi.fn(),
  generateLandingPageBriefMock: vi.fn(),
}));

vi.mock("@/lib/admin/landing-page-store", () => ({
  getLandingPageBrief: getLandingPageBriefMock,
}));

vi.mock("@/lib/admin/landing-page-generator", () => ({
  generateLandingPageBrief: generateLandingPageBriefMock,
}));

vi.mock("@/app/admin/landing-page/[pilotId]/regenerate-button", () => ({
  RegenerateButton: ({ pilotId }: { pilotId: string }) => {
    return `Regenerate landing page:${pilotId}`;
  },
}));

import AdminLandingPageDetail from "@/app/admin/landing-page/[pilotId]/page";

describe("admin landing page detail page", () => {
  it("renders a persisted landing page brief", async () => {
    getLandingPageBriefMock.mockReturnValue({
      pilotId: "neejee-pilot",
      workspaceDisplayName: "Oye Imagine",
      brandName: "Neejee Clinics",
      status: "draft",
      positioningStatement: "A trusted path from visit to consultation.",
      audienceSummary: "High-intent search traffic, Warm referral leads",
      objective: "Convert consultation demand.",
      hero: {
        headline: "Book a confident next step with Neejee Clinics",
        subheadline: "Turn high-intent visitors into consultation bookings.",
        primaryCta: "Book a consultation",
      },
      seo: {
        title: "Neejee Clinics | Hair Transplant Consultation",
        description: "Landing page brief for Neejee Clinics.",
        keywords: ["Neejee Clinics", "Hair Transplant"],
      },
      ctas: [
        {
          label: "Book a consultation",
          href: "/contact",
          variant: "primary",
        },
      ],
      sections: [
        {
          id: "problem",
          title: "Why Hair Transplant decisions stall",
          description: "Neejee Clinics needs a landing page that reduces uncertainty.",
          bullets: ["Clear fit", "Trust signals"],
        },
      ],
      proofPoints: [
        {
          label: "Trust-first UX",
          value: "Balances clarity and conversion focus.",
        },
      ],
      assets: [
        {
          label: "Primary logo",
          type: "logo",
          url: "/logo.svg",
        },
      ],
      generatedFrom: {
        strategyStatus: "approved",
        strategyUpdatedAt: "2026-07-27T12:30:00.000Z",
        pilotUpdatedAt: "2026-07-27T12:00:00.000Z",
      },
    });

    const element = await AdminLandingPageDetail({
      params: Promise.resolve({
        pilotId: "neejee-pilot",
      }),
    });

    const html = renderToStaticMarkup(element);

    expect(html).toContain("Book a confident next step with Neejee Clinics");
    expect(html).toContain("A trusted path from visit to consultation.");
    expect(html).toContain("Why Hair Transplant decisions stall");
    expect(html).toContain("Regenerate landing page:neejee-pilot");
    expect(generateLandingPageBriefMock).not.toHaveBeenCalled();
  });

  it("generates a landing page brief when store data is absent or mismatched", async () => {
    getLandingPageBriefMock.mockReturnValue({
      pilotId: "different-pilot",
    });

    generateLandingPageBriefMock.mockReturnValue({
      pilotId: "neejee-pilot",
      workspaceDisplayName: "Oye Imagine",
      brandName: "Neejee Clinics",
      status: "draft",
      hero: {
        headline: "Generated landing page headline",
        subheadline: "Generated landing page subheadline",
        primaryCta: "Book a consultation",
      },
      sections: [],
      ctas: [],
      proofPoints: [],
      assets: [],
      generatedFrom: {},
      seo: {},
    });

    const element = await AdminLandingPageDetail({
      params: Promise.resolve({
        pilotId: "neejee-pilot",
      }),
    });

    const html = renderToStaticMarkup(element);

    expect(html).toContain("Generated landing page headline");
    expect(generateLandingPageBriefMock).toHaveBeenCalledWith({
      pilotId: "neejee-pilot",
      forceRegenerate: true,
    });
  });
});