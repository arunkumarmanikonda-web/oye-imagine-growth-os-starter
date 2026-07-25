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
import { buildPilotPatchFromFormData } from "@/lib/admin/neejee-editor-utils";
import { saveNeejeePilotControlSnapshotLive } from "@/lib/admin/neejee-live";

export async function submitPilotEditorAction(formData: FormData) {
  let redirectTarget = buildEditorRedirect("/admin/pilot", "saved");

  try {
    const intent = readEditorIntent(formData);
    if (intent === "publish") {
      assertPublishConfirmed(formData);
    }

    const patch = buildPilotPatchFromFormData(formData);
    await saveNeejeePilotControlSnapshotLive(patch);

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