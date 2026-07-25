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
import { buildWorkspacePilotPatchFromFormData } from "@/lib/admin/workspace-editor-utils";
import { saveWorkspacePilotControlSnapshotLive } from "@/lib/admin/workspace-live";

export async function submitPilotEditorAction(formData: FormData) {
  let redirectTarget = buildEditorRedirect("/admin/pilot", "saved");

  try {
    const intent = readEditorIntent(formData);
    if (intent === "publish") {
      assertPublishConfirmed(formData);
    }

    const patch = buildWorkspacePilotPatchFromFormData(formData);
    await saveWorkspacePilotControlSnapshotLive(patch);

    revalidatePath("/admin/pilot");
    revalidatePath("/api/admin/pilot");

    redirectTarget = buildEditorRedirect(
      "/admin/pilot",
      intent === "publish" ? "published" : "saved"
    );
  } catch (error) {
    redirectTarget = buildEditorRedirect(
      "/admin/pilot",
      "error",
      toEditorErrorSlug(error)
    );
  }

  redirect(redirectTarget as Route);
}