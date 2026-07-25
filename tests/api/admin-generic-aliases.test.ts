import { describe, expect, it } from "vitest";

import {
  getNeejeeOnboardingSnapshotLive,
  saveNeejeeOnboardingSnapshotLive,
  getNeejeeBrandIntelligenceSnapshotLive,
  saveNeejeeBrandIntelligenceSnapshotLive,
  getNeejeePilotControlSnapshotLive,
  saveNeejeePilotControlSnapshotLive,
  getOnboardingSnapshotLive,
  saveOnboardingSnapshotLive,
  getBrandIntelligenceSnapshotLive,
  saveBrandIntelligenceSnapshotLive,
  getPilotControlSnapshotLive,
  savePilotControlSnapshotLive,
} from "@/lib/admin/neejee-live";

import {
  buildOnboardingPatchFromFormData,
  buildBrandIntelligencePatchFromFormData,
  buildPilotPatchFromFormData,
  buildWorkspaceOnboardingPatch,
  buildWorkspaceBrandIntelligencePatch,
  buildWorkspacePilotPatch,
} from "@/lib/admin/neejee-editor-utils";

import {
  readEditorIntent,
  readPublishConfirmation,
  assertPublishConfirmed,
  buildEditorRedirect,
  toEditorErrorSlug,
  readWorkspaceEditorIntent,
  readWorkspacePublishConfirmation,
  assertWorkspacePublishConfirmed,
  buildWorkspaceEditorRedirect,
  toWorkspaceEditorErrorSlug,
} from "@/lib/admin/neejee-editor-intents";

describe("generic admin alias compatibility", () => {
  it("keeps live helpers backwards-compatible", () => {
    expect(getOnboardingSnapshotLive).toBe(getNeejeeOnboardingSnapshotLive);
    expect(saveOnboardingSnapshotLive).toBe(saveNeejeeOnboardingSnapshotLive);
    expect(getBrandIntelligenceSnapshotLive).toBe(getNeejeeBrandIntelligenceSnapshotLive);
    expect(saveBrandIntelligenceSnapshotLive).toBe(saveNeejeeBrandIntelligenceSnapshotLive);
    expect(getPilotControlSnapshotLive).toBe(getNeejeePilotControlSnapshotLive);
    expect(savePilotControlSnapshotLive).toBe(saveNeejeePilotControlSnapshotLive);
  });

  it("keeps editor patch builders backwards-compatible", () => {
    expect(buildWorkspaceOnboardingPatch).toBe(buildOnboardingPatchFromFormData);
    expect(buildWorkspaceBrandIntelligencePatch).toBe(buildBrandIntelligencePatchFromFormData);
    expect(buildWorkspacePilotPatch).toBe(buildPilotPatchFromFormData);
  });

  it("keeps editor intent helpers backwards-compatible", () => {
    expect(readWorkspaceEditorIntent).toBe(readEditorIntent);
    expect(readWorkspacePublishConfirmation).toBe(readPublishConfirmation);
    expect(assertWorkspacePublishConfirmed).toBe(assertPublishConfirmed);
    expect(buildWorkspaceEditorRedirect).toBe(buildEditorRedirect);
    expect(toWorkspaceEditorErrorSlug).toBe(toEditorErrorSlug);
  });
});