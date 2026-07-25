import { describe, expect, it } from "vitest";
import {
  buildBrandIntelligencePatchFromFormData,
  buildOnboardingPatchFromFormData,
  buildPilotPatchFromFormData,
} from "@/lib/admin/neejee-editor-utils";

describe("Neejee editor patch builders", () => {
  it("builds onboarding patches from form data", () => {
    const formData = new FormData();
    formData.set("owner", "Ops Lead");
    formData.set("stageSummary", "Activation moving forward.");
    formData.set("blockers", "Legal approval`nCatalog QA");
    formData.set("tasks", "Finalize kickoff`nConfirm WhatsApp");
    formData.set("services", "Brand sprint`nMarketplace ops");
    formData.set("integrations", "WhatsApp`nMeta");

    const patch = buildOnboardingPatchFromFormData(formData);

    expect(patch.workspace.owner).toBe("Ops Lead");
    expect(patch.blockers.length).toBe(2);
    expect(patch.tasks.length).toBe(2);
    expect(patch.services.length).toBe(2);
    expect(patch.integrations.length).toBe(2);
  });

  it("builds brand intelligence patches from form data", () => {
    const formData = new FormData();
    formData.set("profileStatus", "ready");
    formData.set("essence", "FOUND. PERSONAL.");
    formData.set("approvedLanguage", "Warm`nIntentional");
    formData.set("prohibitedLanguage", "Discount-led");
    formData.set("audienceArchetypes", "Founder-led buyer`nIntentional gifter");

    const patch = buildBrandIntelligencePatchFromFormData(formData);

    expect(patch.profileStatus).toBe("ready");
    expect(patch.positioning.essence).toBe("FOUND. PERSONAL.");
    expect(patch.approvedLanguage.length).toBe(2);
    expect(patch.audienceArchetypes.length).toBe(2);
  });

  it("builds pilot patches from form data", () => {
    const formData = new FormData();
    formData.set("owner", "Leadership ops");
    formData.set("executiveBrief", "Pilot approved`nRollout remains controlled");
    formData.set("nextActionLabel", "Open review");
    formData.set("nextActionDetail", "Move to controlled launch review.");
    formData.set("nextActionHref", "/admin/summary");

    const patch = buildPilotPatchFromFormData(formData);

    expect(patch.workspace.owner).toBe("Leadership ops");
    expect(patch.executiveBrief.length).toBe(2);
    expect(patch.nextActions[0].href).toBe("/admin/summary");
  });
});