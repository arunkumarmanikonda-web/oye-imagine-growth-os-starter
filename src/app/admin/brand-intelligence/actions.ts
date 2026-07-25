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
import { buildWorkspaceBrandIntelligencePatchFromFormData } from "@/lib/admin/workspace-editor-utils";
import { saveWorkspaceBrandIntelligenceSnapshotLive } from "@/lib/admin/workspace-live";

export async function submitBrandIntelligenceEditorAction(formData: FormData) {
  let redirectTarget = buildEditorRedirect("/admin/brand-intelligence", "saved");

  try {
    const intent = readEditorIntent(formData);
    if (intent === "publish") {
      assertPublishConfirmed(formData);
    }

    const patch = buildWorkspaceBrandIntelligencePatchFromFormData(formData);
    await saveWorkspaceBrandIntelligenceSnapshotLive(patch);

    revalidatePath("/admin/brand-intelligence");
    revalidatePath("/api/admin/brand-intelligence");

    redirectTarget = buildEditorRedirect(
      "/admin/brand-intelligence",
      intent === "publish" ? "published" : "saved"
    );
  } catch (error) {
    redirectTarget = buildEditorRedirect(
      "/admin/brand-intelligence",
      "error",
      toEditorErrorSlug(error)
    );
  }

  redirect(redirectTarget as Route);
}