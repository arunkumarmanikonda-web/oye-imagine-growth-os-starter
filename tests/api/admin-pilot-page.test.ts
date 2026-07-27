import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";

import AdminPilotPage from "@/app/admin/pilot/page";
import { resetPilotStore, savePilot } from "@/lib/admin/pilot-store";

describe("admin pilot page", () => {
  it("renders persisted pilot summary values", () => {
    resetPilotStore();
    savePilot({
      brandName: "Neejee Clinics",
      website: "https://neejee.example",
      industry: "Healthcare",
      geo: "India + GCC",
      targetAudience: "Founders and clinic operators",
      offer: "Growth operating system",
      monthlyBudget: "250000",
      primaryChannels: ["seo", "google-ads"],
      competitors: ["Competitor One", "Competitor Two"],
      goals: ["Qualified leads", "Demo bookings"],
      successMetrics: ["CPL", "CAC"],
      status: "ready_for_review",
    });

    const html = renderToStaticMarkup(createElement(AdminPilotPage));

    expect(html).toContain("Oye Imagine pilot workspace");
    expect(html).toContain("Neejee Clinics");
    expect(html).toContain("https://neejee.example");
    expect(html).toContain("India + GCC");
    expect(html).toContain("Growth operating system");
    expect(html).toContain("ready_for_review");
    expect(html).toContain("Competitor One");
    expect(html).toContain("CPL");
  });
});