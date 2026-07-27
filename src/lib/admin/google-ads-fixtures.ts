import {
  createGoogleAdsCampaignDraftRecord,
  type GoogleAdsCampaignDraftRecord,
} from "@/lib/admin/google-ads-schema";

export function createDefaultGoogleAdsCampaignDraftFixture(): GoogleAdsCampaignDraftRecord {
  return createGoogleAdsCampaignDraftRecord({
    pilotId: "neejee-pilot",
    workspaceId: "oye-imagine",
    workspaceDisplayName: process.env.NEXT_PUBLIC_WORKSPACE_DISPLAY_NAME ?? "Oye Imagine",
    brandName: "Neejee Clinics",
    objective: "Generate qualified hair transplant and skin clinic consultation demand.",
    landingPageUrl: "/landing/neejee-pilot",
    geoTargets: ["Bengaluru", "Whitefield", "Indiranagar"],
    budgetDailyUsd: 45,
    keywordClusters: [
      {
        theme: "Hair transplant high intent",
        keywords: [
          "best hair transplant clinic",
          "hair transplant consultation",
          "hair transplant near me",
        ],
      },
      {
        theme: "Skin clinic consultations",
        keywords: [
          "skin clinic consultation",
          "dermatology clinic near me",
          "best skin clinic bengaluru",
        ],
      },
    ],
    adCopy: [
      {
        headline1: "Neejee Clinics Consultation",
        headline2: "Book Trusted Specialist Care",
        description1: "High-intent search campaign focused on consultation conversions.",
        description2: "Clear next step, strong proof, and low-friction booking flow.",
      },
      {
        headline1: "Hair & Skin Specialists",
        headline2: "Talk To The Neejee Team",
        description1: "Target motivated prospects comparing treatment options.",
        description2: "Drive bookings with trust-first messaging and direct CTAs.",
      },
    ],
    sitelinks: [
      "Book Consultation",
      "Treatment Options",
      "Success Stories",
      "Pricing and FAQs",
    ],
  });
}