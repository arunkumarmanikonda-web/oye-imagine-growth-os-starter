import { getWorkspaceDisplayName } from "@/lib/admin/workspace-branding";
import {
  createPilotRecord,
  type NeejeePilotInput,
  type NeejeePilotRecord,
} from "@/lib/admin/pilot-schema";

export function createDefaultPilotFixture(
  overrides: NeejeePilotInput = {},
): NeejeePilotRecord {
  return createPilotRecord({
    id: "neejee-pilot",
    workspaceDisplayName: getWorkspaceDisplayName(),
    brandName: "Neejee",
    website: "",
    industry: "Healthcare",
    geo: "India",
    targetAudience: "",
    offer: "",
    monthlyBudget: "",
    primaryChannels: ["seo", "google-ads", "meta-ads"],
    competitors: [],
    goals: ["Increase qualified leads", "Improve brand visibility"],
    successMetrics: ["Qualified leads", "CTR", "CPL"],
    status: "draft",
    ...overrides,
  });
}

export const defaultNeejeePilotFixture = createDefaultPilotFixture();