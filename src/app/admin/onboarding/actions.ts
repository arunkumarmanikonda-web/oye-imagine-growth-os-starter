"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  assertPublishConfirmed,
  buildEditorRedirect,
  readEditorIntent,
  toEditorErrorSlug,
} from "@/lib/admin/neejee-editor-intents";
import { buildOnboardingPatchFromFormData } from "@/lib/admin/neejee-editor-utils";
import { saveNeejeeOnboardingSnapshotLive } from "@/lib/admin/neejee-live";

export async function submitOnboardingEditorAction(formData: FormData) {
  let redirectTarget = buildEditorRedirect("/admin/onboarding", "saved");

  try {
    const intent = readEditorIntent(formData);
    if (intent === "publish") {
      assertPublishConfirmed(formData);
    }

    const patch = buildOnboardingPatchFromFormData(formData);
    await saveNeejeeOnboardingSnapshotLive(patch);

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