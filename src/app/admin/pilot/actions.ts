"use server";

import { revalidatePath } from "next/cache";
import { saveNeejeePilotControlSnapshotLive } from "@/lib/admin/neejee-live";
import { buildPilotPatchFromFormData } from "@/lib/admin/neejee-editor-utils";

export async function savePilotFormAction(formData: FormData) {
  const patch = buildPilotPatchFromFormData(formData);
  await saveNeejeePilotControlSnapshotLive(patch);
  revalidatePath("/admin/pilot");
}