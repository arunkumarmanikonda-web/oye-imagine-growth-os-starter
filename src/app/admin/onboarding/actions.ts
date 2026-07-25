"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  assertPublishConfirmed,
  buildEditorRedirect,
  readEditorIntent,
  toEditorErrorSlug,
} from "@/lib/admin/workspace-editor-intents";
import { buildWorkspaceOnboardingPatchFromFormData } from "@/lib/admin/workspace-editor-utils";
import { saveWorkspaceOnboardingSnapshotLive } from "@/lib/admin/workspace-live";

export async function submitOnboardingEditorAction(formData: FormData) {
  let redirectTarget = buildEditorRedirect("/admin/onboarding", "saved");

  try {
    const intent = readEditorIntent(formData);
    if (intent === "publish") {
      assertPublishConfirmed(formData);
    }

    const patch = buildWorkspaceOnboardingPatchFromFormData(formData);
    await saveWorkspaceOnboardingSnapshotLive(patch);

    revalidatePath("/admin/onboarding");
    revalidatePath("/api/admin/onboarding");

    redirectTarget = buildEditorRedirect(
      "/admin/onboarding",
      intent === "publish" ? "published" : "saved"
    );
  } catch (error) {
    redirectTarget = buildEditorRedirect(
      "/admin/onboarding",
      "error",
      toEditorErrorSlug(error)
    );
  }

  redirect(redirectTarget as Route);
}