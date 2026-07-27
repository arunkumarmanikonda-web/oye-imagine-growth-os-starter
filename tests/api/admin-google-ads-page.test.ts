import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const { getGoogleAdsDraftMock, generateGoogleAdsDraftMock } = vi.hoisted(() => ({
  getGoogleAdsDraftMock: vi.fn(),
  generateGoogleAdsDraftMock: vi.fn(),
}));

vi.mock("@/lib/admin/google-ads-store", () => ({
  getGoogleAdsDraft: getGoogleAdsDraftMock,
}));

vi.mock("@/lib/admin/google-ads-generator", () => ({
  generateGoogleAdsDraft: generateGoogleAdsDraftMock,
}));

vi.mock("@/app/admin/google-ads/[pilotId]/regenerate-button", () => ({
  RegenerateButton: ({ pilotId }: { pilotId: string }) => {
    return `Regenerate Google Ads:${pilotId}`;
  },
}));

import AdminGoogleAdsDetailPage from "@/app/admin/google-ads/[pilotId]/page";

describe("admin google ads detail page", () => {
  it("renders a persisted Google Ads draft", async () => {
    getGoogleAdsDraftMock.mockReturnValue({
      pilotId: "neejee-pilot",
      workspaceDisplayName: "Oye Imagine",
      brandName: "Neejee Clinics",
      status: "draft",
      objective: "Generate qualified consultation demand.",
      landingPageUrl: "/landing/neejee-pilot",
      budgetDailyUsd: 45,
      geoTargets: ["Bengaluru", "Whitefield"],
      sitelinks: ["Book Consultation", "Treatment Options"],
      keywordClusters: [
        {
          theme: "Hair transplant high intent",
          keywords: ["best hair transplant clinic", "hair transplant consultation"],
        },
      ],
      adCopy: [
        {
          headline1: "Neejee Clinics Hair Transplant",
          headline2: "Book Trusted Specialist Care",
          description1: "Target high-intent demand.",
          description2: "Strong proof and clear value.",
        },
      ],
    });

    const element = await AdminGoogleAdsDetailPage({
      params: Promise.resolve({
        pilotId: "neejee-pilot",
      }),
    });

    const html = renderToStaticMarkup(element);

    expect(html).toContain("Neejee Clinics Google Ads campaign");
    expect(html).toContain("Generate qualified consultation demand.");
    expect(html).toContain("Hair transplant high intent");
    expect(html).toContain("Regenerate Google Ads:neejee-pilot");
    expect(generateGoogleAdsDraftMock).not.toHaveBeenCalled();
  });

  it("generates a Google Ads draft when store data is absent or mismatched", async () => {
    getGoogleAdsDraftMock.mockReturnValue({
      pilotId: "different-pilot",
    });

    generateGoogleAdsDraftMock.mockReturnValue({
      pilotId: "neejee-pilot",
      workspaceDisplayName: "Oye Imagine",
      brandName: "Neejee Clinics",
      status: "draft",
      objective: "Generated Google Ads objective.",
      landingPageUrl: "/landing/neejee-pilot",
      budgetDailyUsd: 45,
      geoTargets: [],
      sitelinks: [],
      keywordClusters: [],
      adCopy: [],
    });

    const element = await AdminGoogleAdsDetailPage({
      params: Promise.resolve({
        pilotId: "neejee-pilot",
      }),
    });

    const html = renderToStaticMarkup(element);

    expect(html).toContain("Generated Google Ads objective.");
    expect(generateGoogleAdsDraftMock).toHaveBeenCalledWith({
      pilotId: "neejee-pilot",
      forceRegenerate: true,
    });
  });
});