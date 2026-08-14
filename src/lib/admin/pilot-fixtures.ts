import { getWorkspaceDisplayName } from "@/lib/admin/workspace-branding";
import { neejeeBrandTruth } from "@/lib/admin/neejee-brand-truth";
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
    brandName: neejeeBrandTruth.identity.displayName,
    website: neejeeBrandTruth.identity.website,
    industry: neejeeBrandTruth.business.categoryPositioning,
    geo: neejeeBrandTruth.business.primaryMarket,
    targetAudience: neejeeBrandTruth.audience.join("; "),
    offer: neejeeBrandTruth.business.model,
    monthlyBudget: "",
    primaryChannels: ["seo", "google-ads", "meta-ads"],
    competitors: [],
    goals: [...neejeeBrandTruth.growth.objectives],
    successMetrics: [...neejeeBrandTruth.growth.primaryMetrics],
    status: "draft",
    ...overrides,
  });
}

export const defaultNeejeePilotFixture = createDefaultPilotFixture();
