"use server";

import { revalidatePath } from "next/cache";
import { saveNeejeeBrandIntelligenceSnapshotLive } from "@/lib/admin/neejee-live";
import { buildBrandIntelligencePatchFromFormData } from "@/lib/admin/neejee-editor-utils";

export async function saveBrandIntelligenceFormAction(formData: FormData) {
  const patch = buildBrandIntelligencePatchFromFormData(formData);
  await saveNeejeeBrandIntelligenceSnapshotLive(patch);
  revalidatePath("/admin/brand-intelligence");
  revalidatePath("/admin/pilot");
}