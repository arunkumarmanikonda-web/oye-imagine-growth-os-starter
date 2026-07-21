import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export type AdminWorkspaceContext = {
  tenantId: string;
  tenantSlug: string;
  tenantDisplayName: string;
  brandId: string;
  brandName: string;
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string;
};

type TenantRow = {
  id: string;
  slug: string;
  legal_name: string | null;
  display_name: string | null;
};

type BrandRow = {
  id: string;
  tenant_id: string;
  name: string;
  website_url: string | null;
};

type WorkspaceRow = {
  id: string;
  tenant_id: string;
  brand_id: string;
  name: string;
  slug: string;
  created_at?: string | null;
};

function createServiceRoleClient() {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export async function getAdminContexts(): Promise<{
  active: AdminWorkspaceContext | null;
  options: AdminWorkspaceContext[];
}> {
  const cookieStore = await cookies();
  const selectedWorkspaceId = cookieStore.get("oye_admin_workspace_id")?.value ?? null;
  const supabase = createServiceRoleClient();

  const { data: workspaceRows, error: workspaceError } = await supabase
    .from("workspaces")
    .select("id, tenant_id, brand_id, name, slug, created_at")
    .order("created_at", { ascending: true });

  if (workspaceError) {
    throw new Error(workspaceError.message);
  }

  const workspaces = (workspaceRows ?? []) as WorkspaceRow[];

  if (workspaces.length === 0) {
    return { active: null, options: [] };
  }

  const tenantIds = Array.from(new Set(workspaces.map((row) => row.tenant_id)));
  const brandIds = Array.from(new Set(workspaces.map((row) => row.brand_id)));

  const { data: tenantRows, error: tenantError } = await supabase
    .from("tenants")
    .select("id, slug, legal_name, display_name")
    .in("id", tenantIds);

  if (tenantError) {
    throw new Error(tenantError.message);
  }

  const { data: brandRows, error: brandError } = await supabase
    .from("brands")
    .select("id, tenant_id, name, website_url")
    .in("id", brandIds);

  if (brandError) {
    throw new Error(brandError.message);
  }

  const tenantsById = new Map<string, TenantRow>(
    ((tenantRows ?? []) as TenantRow[]).map((row) => [row.id, row])
  );

  const brandsById = new Map<string, BrandRow>(
    ((brandRows ?? []) as BrandRow[]).map((row) => [row.id, row])
  );

  const options: AdminWorkspaceContext[] = workspaces
    .map((workspace) => {
      const tenant = tenantsById.get(workspace.tenant_id);
      const brand = brandsById.get(workspace.brand_id);

      if (!tenant || !brand) {
        return null;
      }

      return {
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        tenantDisplayName: tenant.display_name || tenant.legal_name || tenant.slug,
        brandId: brand.id,
        brandName: brand.name,
        workspaceId: workspace.id,
        workspaceName: workspace.name,
        workspaceSlug: workspace.slug,
      };
    })
    .filter((item): item is AdminWorkspaceContext => item !== null);

  if (options.length === 0) {
    return { active: null, options: [] };
  }

  const active =
    options.find((item) => item.workspaceId === selectedWorkspaceId) ?? options[0];

  return { active, options };
}