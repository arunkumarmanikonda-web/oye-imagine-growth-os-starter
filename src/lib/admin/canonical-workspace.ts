import type { AuthSession } from "@/lib/auth/session";
import { neejeeCanonicalBrandProfile } from "@/lib/foundation/neejee-profile";
import { oyeImagineOrganizationProfile } from "@/lib/foundation/organization-profile";

export interface CanonicalWorkspaceContext {
  workspaceSlug: string;
  tenantSlug: string;
  brandSlug: string;
  brandName: string;
  lane: "client" | "admin";
  source: "session" | "fallback";
}

export function resolveCanonicalWorkspaceContext(
  session: Pick<AuthSession, "lane" | "workspaceSlug" | "tenantSlug" | "brandSlug"> & {
    isAuthenticated?: boolean;
  },
): CanonicalWorkspaceContext {
  const lane = session.lane === "client" ? "client" : "admin";

  if (lane === "client") {
    return {
      workspaceSlug: session.workspaceSlug ?? neejeeCanonicalBrandProfile.workspaceSlug,
      tenantSlug: session.tenantSlug ?? neejeeCanonicalBrandProfile.tenantSlug,
      brandSlug: session.brandSlug ?? neejeeCanonicalBrandProfile.brandSlug,
      brandName: neejeeCanonicalBrandProfile.brandName,
      lane,
      source:
        session.workspaceSlug || session.tenantSlug || session.brandSlug ? "session" : "fallback",
    };
  }

  return {
    workspaceSlug: session.workspaceSlug ?? "oye-imagine-admin",
    tenantSlug: session.tenantSlug ?? oyeImagineOrganizationProfile.slug,
    brandSlug: session.brandSlug ?? oyeImagineOrganizationProfile.slug,
    brandName: oyeImagineOrganizationProfile.tradeName,
    lane,
    source:
      session.workspaceSlug || session.tenantSlug || session.brandSlug ? "session" : "fallback",
  };
}

export function canonicalWorkspaceSupportsNeejeeProof(
  context: CanonicalWorkspaceContext,
): boolean {
  if (context.lane === 'client') {
    return context.workspaceSlug === 'neejee-pilot' && context.brandName === 'Neejee';
  }

  return context.workspaceSlug === 'oye-imagine-admin' || context.source === 'session';
}
