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
    website: "https://neejee.com",
    industry: "Indian ethnic fashion, jewellery, accessories and craft-led e-commerce",
    geo: "India",
    targetAudience:
      "Shoppers seeking curated Indian ethnic fashion, jewellery, accessories and craft-led products online",
    offer:
      "Curated Indian craft-led fashion, jewellery and accessories with a premium digital shopping experience",
    monthlyBudget: "",
    primaryChannels: ["seo", "google-ads", "meta-ads"],
    competitors: [],
    goals: [
      "Increase qualified ecommerce traffic",
      "Grow product discovery and online sales",
      "Improve repeatable customer acquisition efficiency",
    ],
    successMetrics: ["Purchases", "Revenue", "ROAS", "CTR", "CPA"],
    status: "draft",
    ...overrides,
  });
}

export const defaultNeejeePilotFixture = createDefaultPilotFixture();
