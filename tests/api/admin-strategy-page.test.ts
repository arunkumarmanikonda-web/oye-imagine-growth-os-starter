import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it } from "vitest";

import AdminStrategyBriefPage from "@/app/admin/strategy/[pilotId]/page";
import { resetPilotStore } from "@/lib/admin/pilot-store";
import { resetStrategyBriefStore } from "@/lib/admin/strategy-store";

describe("admin strategy brief page", () => {
  beforeEach(() => {
    resetPilotStore({
      id: "neejee-pilot",
      workspaceDisplayName: "Oye Imagine",
      brandName: "Neejee Clinics",
      website: "https://neejee.example",
      industry: "Healthcare",
      geo: "India + GCC",
      targetAudience: "Founders and clinic operators",
      offer: "Growth operating system",
      monthlyBudget: "250000",
      primaryChannels: ["seo", "google-ads", "meta-ads"],
      competitors: ["Competitor One", "Competitor Two"],
      goals: ["Qualified leads", "Demo bookings"],
      successMetrics: ["CPL", "Consultation rate"],
      status: "in_progress",
    });

    resetStrategyBriefStore();
  });

  it("renders the generated strategy brief values", async () => {
    const element = await AdminStrategyBriefPage({
      params: Promise.resolve({ pilotId: "neejee-pilot" }),
    });

    const html = renderToStaticMarkup(element);

    expect(html).toContain("Neejee Clinics strategy brief");
    expect(html).toContain("Strategy status");
    expect(html).toContain("generated");
    expect(html).toContain("Messaging pillars");
    expect(html).toContain("Audience segments");
    expect(html).toContain("Channel recommendations");
    expect(html).toContain("SEO");
    expect(html).toContain("Google Ads");
    expect(html).toContain("Meta Ads");
    expect(html).toContain("Regenerate strategy");
    expect(html).toContain("Success metrics");
    expect(html).toContain("CPL");
  });
});