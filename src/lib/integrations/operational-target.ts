import type { ApiAccessContext } from '@/lib/auth/api-access'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export type OperationalTarget = { tenantId: string; brandId: string | null; workspaceId: string | null; tenantSlug: string | null; workspaceSlug: string | null }

function meta(access:ApiAccessContext,key:string){const value=access.membership.metadata?.[key];return typeof value==='string'&&value.trim()?value.trim():null}

export async function resolveOperationalTarget(access:ApiAccessContext,requestedWorkspaceId?:string|null):Promise<OperationalTarget>{
  const ownTenantId=meta(access,'operationalTenantId')
  const ownBrandId=meta(access,'operationalBrandId')
  const ownWorkspaceId=meta(access,'operationalWorkspaceId')
  const requested=requestedWorkspaceId?.trim()||null
  const isPlatformOwner=access.membership.role_key==='platform_owner'
  if(!requested){if(!ownTenantId)throw new Error('operational_tenant_missing');return{tenantId:ownTenantId,brandId:ownBrandId,workspaceId:ownWorkspaceId,tenantSlug:null,workspaceSlug:null}}
  if(!isPlatformOwner&&requested!==ownWorkspaceId)throw new Error('operational_workspace_denied')
  const admin=createSupabaseAdminClient();const{data,error}=await admin.from('workspaces').select('id,tenant_id,brand_id,slug').eq('id',requested).maybeSingle();if(error||!data)throw new Error('operational_workspace_not_found')
  if(!isPlatformOwner&&data.tenant_id!==ownTenantId)throw new Error('operational_tenant_denied')
  const{data:tenant}=await admin.from('tenants').select('slug').eq('id',data.tenant_id).maybeSingle()
  return{tenantId:data.tenant_id,brandId:data.brand_id||null,workspaceId:data.id,tenantSlug:tenant?.slug||null,workspaceSlug:data.slug||null}
}
