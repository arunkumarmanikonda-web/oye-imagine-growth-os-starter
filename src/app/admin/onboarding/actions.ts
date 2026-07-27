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
import { savePilot } from "@/lib/admin/pilot-store";
import { saveWorkspaceOnboardingSnapshotLive } from "@/lib/admin/workspace-live";
import { getWorkspaceDisplayName } from "@/lib/admin/workspace-branding";

const pilotStatuses = new Set([
  "draft",
  "in_progress",
  "ready_for_review",
  "approved",
]);

function readText(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function readLines(formData: FormData, key: string): string[] {
  return readText(formData, key)
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function submitOnboardingEditorAction(formData: FormData) {
  let redirectTarget = buildEditorRedirect("/admin/onboarding", "saved");

  try {
    const intent = readEditorIntent(formData);
    if (intent === "publish") {
      assertPublishConfirmed(formData);
    }

    const patch = buildWorkspaceOnboardingPatchFromFormData(formData);
    await saveWorkspaceOnboardingSnapshotLive(patch);

    const statusInput = readText(formData, "pilotStatus");
    savePilot({
      workspaceDisplayName: getWorkspaceDisplayName(),
      brandName: readText(formData, "pilotBrandName"),
      website: readText(formData, "pilotWebsite"),
      industry: readText(formData, "pilotIndustry"),
      geo: readText(formData, "pilotGeo"),
      targetAudience: readText(formData, "pilotTargetAudience"),
      offer: readText(formData, "pilotOffer"),
      monthlyBudget: readText(formData, "pilotMonthlyBudget"),
      primaryChannels: readLines(formData, "pilotPrimaryChannels"),
      competitors: readLines(formData, "pilotCompetitors"),
      goals: readLines(formData, "pilotGoals"),
      successMetrics: readLines(formData, "pilotSuccessMetrics"),
      status: pilotStatuses.has(statusInput)
        ? (statusInput as "draft" | "in_progress" | "ready_for_review" | "approved")
        : "draft",
    });

    revalidatePath("/admin/onboarding");
    revalidatePath("/admin/pilot");
    revalidatePath("/api/admin/onboarding");
    revalidatePath("/api/admin/pilot");
    revalidatePath("/api/admin/pilot/status");

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