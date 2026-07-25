"use server";

import { revalidatePath } from "next/cache";
import { saveNeejeeOnboardingSnapshotLive } from "@/lib/admin/neejee-live";
import { buildOnboardingPatchFromFormData } from "@/lib/admin/neejee-editor-utils";

export async function saveOnboardingFormAction(formData: FormData) {
  const patch = buildOnboardingPatchFromFormData(formData);
  await saveNeejeeOnboardingSnapshotLive(patch);
  revalidatePath("/admin/onboarding");
  revalidatePath("/admin/pilot");
}