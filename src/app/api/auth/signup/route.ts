import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 42) || 'brand'
}

function signupRedirect(request: NextRequest, params: Record<string, string>) {
  const url = new URL('/signup', request.url)
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))
  return NextResponse.redirect(url)
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const fullName = String(formData.get('fullName') ?? '').trim()
  const companyName = String(formData.get('companyName') ?? '').trim()
  const brandName = String(formData.get('brandName') ?? companyName).trim()
  const website = String(formData.get('website') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const acceptedTerms = String(formData.get('terms') ?? '') === 'on'

  if (!fullName || !companyName || !brandName || !email || password.length < 8 || !acceptedTerms) {
    return signupRedirect(request, { error: 'invalid_signup' })
  }

  const supabase = await createSupabaseServerClient()
  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, company_name: companyName } },
  })

  if (signupError || !signupData.user?.id) return signupRedirect(request, { error: 'account_creation_failed' })

  const admin = createSupabaseAdminClient()
  const userId = signupData.user.id
  let operationalTenantId: string | null = null
  let stableBrandId: string | null = null
  let stableWorkspaceId: string | null = null

  async function rollbackProvisioning() {
    if (stableWorkspaceId) await admin.from('core_workspaces').delete().eq('workspace_id', stableWorkspaceId)
    if (stableBrandId) await admin.from('core_brands').delete().eq('brand_id', stableBrandId)
    if (operationalTenantId) await admin.from('tenants').delete().eq('id', operationalTenantId)
    await admin.auth.admin.deleteUser(userId)
  }

  const suffix = crypto.randomUUID().replace(/-/g, '').slice(0, 8)
  const baseSlug = slugify(brandName)
  const tenantSlug = `${baseSlug}-${suffix}`

  const { data: tenant, error: tenantError } = await admin
    .from('tenants')
    .insert({ slug: tenantSlug, legal_name: companyName, display_name: brandName })
    .select('id,slug')
    .single()

  if (tenantError || !tenant?.id) {
    await rollbackProvisioning()
    return signupRedirect(request, { error: 'workspace_provision_failed' })
  }
  operationalTenantId = tenant.id

  const { data: brand, error: brandError } = await admin
    .from('brands')
    .insert({ tenant_id: tenant.id, name: brandName, website_url: website || null })
    .select('id')
    .single()

  if (brandError || !brand?.id) {
    await rollbackProvisioning()
    return signupRedirect(request, { error: 'workspace_provision_failed' })
  }

  const workspaceSlug = `${baseSlug}-growth`
  const { data: workspace, error: workspaceError } = await admin
    .from('workspaces')
    .insert({ tenant_id: tenant.id, brand_id: brand.id, name: `${brandName} Growth Workspace`, slug: workspaceSlug })
    .select('id')
    .single()

  if (workspaceError || !workspace?.id) {
    await rollbackProvisioning()
    return signupRedirect(request, { error: 'workspace_provision_failed' })
  }

  const stableTenantId = `tenant_${tenantSlug.replace(/-/g, '_')}`
  stableBrandId = `brand_${tenantSlug.replace(/-/g, '_')}`
  stableWorkspaceId = `workspace_${tenantSlug.replace(/-/g, '_')}_primary`

  const { error: coreBrandError } = await admin.from('core_brands').insert({
    brand_id: stableBrandId,
    tenant_id: stableTenantId,
    display_name: brandName,
    legal_entity_name: companyName,
    website_url: website || null,
    status: 'active',
    metadata: {
      operationalTenantId: tenant.id,
      operationalBrandId: brand.id,
      createdBy: 'self_service_signup',
    },
  })

  if (coreBrandError) {
    await rollbackProvisioning()
    return signupRedirect(request, { error: 'workspace_provision_failed' })
  }

  const { error: coreWorkspaceError } = await admin.from('core_workspaces').insert({
    workspace_id: stableWorkspaceId,
    tenant_id: stableTenantId,
    brand_id: stableBrandId,
    autonomy_level: 1,
    status: 'active',
    metadata: {
      operationalTenantId: tenant.id,
      operationalBrandId: brand.id,
      operationalWorkspaceId: workspace.id,
      edition: 'starter',
      onboardingState: 'started',
    },
  })

  if (coreWorkspaceError) {
    await rollbackProvisioning()
    return signupRedirect(request, { error: 'workspace_provision_failed' })
  }

  const { error: membershipError } = await admin.from('core_tenant_memberships').insert({
    membership_id: `membership_${userId}`,
    tenant_id: stableTenantId,
    user_id: userId,
    role_key: 'tenant_admin',
    brand_id: stableBrandId,
    workspace_id: stableWorkspaceId,
    status: 'active',
    authority_limits: { selfServe: true },
    metadata: {
      operationalTenantId: tenant.id,
      operationalBrandId: brand.id,
      operationalWorkspaceId: workspace.id,
      fullName,
      companyName,
      brandName,
      website: website || null,
      onboardingState: 'started',
      edition: 'starter',
    },
  })

  if (membershipError) {
    await rollbackProvisioning()
    return signupRedirect(request, { error: 'workspace_provision_failed' })
  }

  const { data: flags, error: flagsError } = await admin
    .from('core_feature_flags')
    .select('flag_key,default_state')

  if (flagsError) {
    await rollbackProvisioning()
    return signupRedirect(request, { error: 'workspace_provision_failed' })
  }

  const entitlements = (flags ?? []).map((flag) => ({
    entitlement_id: `entitlement_${tenantSlug}_${String(flag.flag_key).replace(/[^a-z0-9]+/gi, '_')}`,
    tenant_id: stableTenantId,
    flag_key: flag.flag_key,
    brand_id: stableBrandId,
    workspace_id: stableWorkspaceId,
    state: flag.default_state,
    config: { edition: 'starter', source: 'self_service_signup' },
    is_active: true,
  }))

  if (entitlements.length) {
    const { error: entitlementError } = await admin.from('core_tenant_feature_entitlements').insert(entitlements)
    if (entitlementError) {
      await rollbackProvisioning()
      return signupRedirect(request, { error: 'workspace_provision_failed' })
    }
  }

  if (!signupData.session) return signupRedirect(request, { success: 'check_email' })
  return NextResponse.redirect(new URL('/workspace', request.url))
}
