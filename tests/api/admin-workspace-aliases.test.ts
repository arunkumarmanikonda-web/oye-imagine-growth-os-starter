import { describe, expect, it } from "vitest";

import {
  buildWorkspaceOnboardingPatchFromFormData,
  buildWorkspaceBrandIntelligencePatchFromFormData,
  buildWorkspacePilotPatchFromFormData,
  listToMultiline,
} from "@/lib/admin/workspace-editor-utils";
import {
  buildEditorRedirect,
  readEditorIntent,
} from "@/lib/admin/workspace-editor-intents";
import {
  getWorkspaceOnboardingSnapshotLive,
  getWorkspaceBrandIntelligenceSnapshotLive,
  getWorkspacePilotControlSnapshotLive,
  saveWorkspaceOnboardingSnapshotLive,
  saveWorkspaceBrandIntelligenceSnapshotLive,
  saveWorkspacePilotControlSnapshotLive,
} from "@/lib/admin/workspace-live";

describe("workspace admin alias surface", () => {
  it("exposes generic workspace live helpers", () => {
    expect(typeof getWorkspaceOnboardingSnapshotLive).toBe("function");
    expect(typeof getWorkspaceBrandIntelligenceSnapshotLive).toBe("function");
    expect(typeof getWorkspacePilotControlSnapshotLive).toBe("function");
    expect(typeof saveWorkspaceOnboardingSnapshotLive).toBe("function");
    expect(typeof saveWorkspaceBrandIntelligenceSnapshotLive).toBe("function");
    expect(typeof saveWorkspacePilotControlSnapshotLive).toBe("function");
  });

  it("builds generic editor patches through alias utils", () => {
    const onboarding = new FormData();
    onboarding.set("owner", "Ops");
    onboarding.set("blockers", "Legal`nCatalog");
    expect(buildWorkspaceOnboardingPatchFromFormData(onboarding).blockers.length).toBe(2);

    const brand = new FormData();
    brand.set("profileStatus", "ready");
    brand.set("essence", "FOUND. PERSONAL.");
    brand.set("approvedLanguage", "Warm`nIntentional");
    expect(buildWorkspaceBrandIntelligencePatchFromFormData(brand).approvedLanguage.length).toBe(2);

    const pilot = new FormData();
    pilot.set("owner", "Leadership");
    pilot.set("executiveBrief", "Pilot approved`nControlled rollout");
    expect(buildWorkspacePilotPatchFromFormData(pilot).executiveBrief.length).toBe(2);
  });

  it("re-exports generic editor intent helpers", () => {
    const formData = new FormData();
    expect(readEditorIntent(formData)).toBe("save");
    expect(buildEditorRedirect("/admin/onboarding", "saved")).toBe("/admin/onboarding?saved=1");
    expect(listToMultiline([{ title: "One" }, { title: "Two" }])).toBe("One\nTwo");
  });
});