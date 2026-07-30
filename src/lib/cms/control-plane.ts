import { cmsSeedFaqs, cmsSeedPages, cmsSeedPeople, cmsSeedPromotions, cmsSeedSections } from "@/lib/foundation/cms-seed";
import { oyeImagineOrganizationProfile, oyeImagineSupportChannels } from "@/lib/foundation/organization-profile";

export type CmsManagedEntityType =
  | "page"
  | "section"
  | "promotion"
  | "person"
  | "faq"
  | "legal"
  | "support";

export type CmsMutationAction =
  | "create"
  | "update"
  | "delete"
  | "publish"
  | "unpublish"
  | "schedule"
  | "rollback";

export interface CmsRegistryCollection {
  entityType: CmsManagedEntityType;
  label: string;
  count: number;
  actions: CmsMutationAction[];
  description: string;
}

export interface CmsRegistrySummary {
  totalManagedItems: number;
  totalCollections: number;
  totalVisibleSurfaceFamilies: number;
  publishActions: CmsMutationAction[];
  collections: CmsRegistryCollection[];
}

export interface CmsMutationPlan {
  entityType: CmsManagedEntityType;
  slug: string;
  action: CmsMutationAction;
  requiresReview: boolean;
  status: "draft" | "ready";
  summary: string;
}

export interface CmsStudioSectionCard {
  title: string;
  description: string;
  entityType: CmsManagedEntityType;
  itemCount: number;
}

const defaultActions: CmsMutationAction[] = [
  "create",
  "update",
  "delete",
  "publish",
  "unpublish",
  "schedule",
  "rollback",
];

export function listCmsRegistryCollections(): CmsRegistryCollection[] {
  return [
    {
      entityType: "page",
      label: "Pages",
      count: cmsSeedPages.length,
      actions: defaultActions,
      description: "Homepage, marketplace, login, and dashboard page surfaces.",
    },
    {
      entityType: "section",
      label: "Sections",
      count: cmsSeedSections.length,
      actions: defaultActions,
      description: "Hero, leadership, experts, FAQ, CTA, and contact sections.",
    },
    {
      entityType: "promotion",
      label: "Promotions and offers",
      count: cmsSeedPromotions.length,
      actions: defaultActions,
      description: "Promotional banners, marketplace offers, and CTA units.",
    },
    {
      entityType: "person",
      label: "Leadership and experts",
      count: cmsSeedPeople.length,
      actions: defaultActions,
      description: "Leadership profiles, expert profiles, and support-facing people surfaces.",
    },
    {
      entityType: "faq",
      label: "FAQ",
      count: cmsSeedFaqs.length,
      actions: defaultActions,
      description: "Service, support, billing, and delivery FAQ content.",
    },
    {
      entityType: "legal",
      label: "Legal identity",
      count: oyeImagineOrganizationProfile.legalDocuments.length,
      actions: ["update", "publish", "rollback"],
      description: "Legal name, GST, CIN, and linked legal document surfaces.",
    },
    {
      entityType: "support",
      label: "Support channels",
      count: oyeImagineSupportChannels.length,
      actions: ["create", "update", "publish", "unpublish", "rollback"],
      description: "Support email, phone, and future channel control surfaces.",
    },
  ];
}

export function getCmsRegistrySummary(): CmsRegistrySummary {
  const collections = listCmsRegistryCollections();
  return {
    totalManagedItems: collections.reduce((sum, item) => sum + item.count, 0),
    totalCollections: collections.length,
    totalVisibleSurfaceFamilies: 7,
    publishActions: defaultActions,
    collections,
  };
}

export function buildCmsMutationPlan(
  entityType: CmsManagedEntityType,
  slug: string,
  action: CmsMutationAction,
): CmsMutationPlan {
  const reviewActions: CmsMutationAction[] = ["publish", "unpublish", "rollback", "delete"];
  const safeSlug = slug.trim().length > 0 ? slug.trim() : `${entityType}-draft`;

  return {
    entityType,
    slug: safeSlug,
    action,
    requiresReview: reviewActions.includes(action),
    status: action === "create" || action === "update" || action === "schedule" ? "draft" : "ready",
    summary: `${action} plan prepared for ${entityType} :: ${safeSlug}`,
  };
}

export function buildCmsStudioSectionCards(): CmsStudioSectionCard[] {
  return listCmsRegistryCollections().map((collection) => ({
    title: collection.label,
    description: collection.description,
    entityType: collection.entityType,
    itemCount: collection.count,
  }));
}