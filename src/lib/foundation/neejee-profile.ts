export interface TenantBrandProfile {
  tenantSlug: string;
  workspaceSlug: string;
  brandSlug: string;
  brandName: string;
  displayName: string;
  website: string;
  industry: string;
  geo: string;
  targetAudience: string;
  offerSummary: string;
  monthlyBudget: string;
  status: "draft" | "in_progress" | "ready_for_review" | "approved";
  channels: string[];
  goals: string[];
  successMetrics: string[];
  competitors: string[];
  positioning: {
    essence: string;
    posture: string;
    tone: string;
  };
}

export const neejeeCanonicalBrandProfile: TenantBrandProfile = {
  tenantSlug: "neejee",
  workspaceSlug: "neejee-pilot",
  brandSlug: "neejee",
  brandName: "Neejee",
  displayName: "Neejee",
  website: "",
  industry: "Premium lifestyle / culturally rooted Indian craft",
  geo: "India",
  targetAudience: "",
  offerSummary: "",
  monthlyBudget: "",
  status: "draft",
  channels: ["seo", "google-ads", "meta-ads"],
  goals: ["Increase qualified leads", "Improve brand visibility"],
  successMetrics: ["Qualified leads", "CTR", "CPL"],
  competitors: [],
  positioning: {
    essence: "FOUND. PERSONAL.",
    posture: "Quiet luxury, intimate, culturally rooted Indian craft.",
    tone: "Premium, calm, assured, human-led.",
  },
};