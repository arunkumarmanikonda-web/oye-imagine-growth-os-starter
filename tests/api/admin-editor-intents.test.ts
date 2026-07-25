import { describe, expect, it } from "vitest";

import {
  PUBLISH_CONFIRMATION_ERROR,
  assertPublishConfirmed,
  buildEditorRedirect,
  readEditorIntent,
  readPublishConfirmation,
} from "@/lib/admin/neejee-editor-intents";

describe("Neejee editor intent helpers", () => {
  it("defaults to save when no intent is provided", () => {
    const formData = new FormData();
    expect(readEditorIntent(formData)).toBe("save");
  });

  it("reads publish intent correctly", () => {
    const formData = new FormData();
    formData.set("intent", "publish");
    expect(readEditorIntent(formData)).toBe("publish");
  });

  it("accepts publish confirmation when confirmPublish=yes", () => {
    const formData = new FormData();
    formData.set("intent", "publish");
    formData.set("confirmPublish", "yes");

    expect(readPublishConfirmation(formData)).toBe(true);
    expect(() => assertPublishConfirmed(formData)).not.toThrow();
  });

  it("throws when publish confirmation is missing", () => {
    const formData = new FormData();
    formData.set("intent", "publish");

    expect(() => assertPublishConfirmed(formData)).toThrow(PUBLISH_CONFIRMATION_ERROR);
  });

  it("builds redirect params for save, publish, and error states", () => {
    expect(buildEditorRedirect("/admin/onboarding", "saved")).toBe("/admin/onboarding?saved=1");
    expect(buildEditorRedirect("/admin/onboarding", "published")).toBe("/admin/onboarding?published=1");
    expect(buildEditorRedirect("/admin/onboarding", "error", "publish_confirmation_required")).toBe(
      "/admin/onboarding?error=publish_confirmation_required"
    );
  });
});