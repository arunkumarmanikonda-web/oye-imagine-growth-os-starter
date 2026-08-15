import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { validateNewPassword } from '@/lib/auth/password-policy'
import { createClientActivation } from '@/lib/commercial/activation-runtime'
import type { BillingCadence } from '@/lib/commercial/client-activation-journey'

const LEGAL_VERSION = '2026-08-15'

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 42) || 'brand'
}

function signupRedirect(request: NextRequest, params: Record<string, string>) {
  const url = new URL('/signup', request.url)
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))
  return NextResponse.redirect(url, 303)
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
  const termsVersion = String(formData.get('termsVersion') ?? '')
  const privacyVersion = String(formData.get('privacyVersion') ?? '')
  const acceptedAt = new Date().toISOString()
  const requestedPlan = String(formData.get('plan') ?? 'starter').trim().toLowerCase()
  const billingCadence: BillingCadence = formData.get('billingCadence') === 'annual' ? 'annual' : 'monthly'

  if (
    !fullName ||
    !companyName ||
    !brandName ||
    !email ||
    !acceptedTerms ||
    termsVersion !== LEGAL_VERSION ||
    privacyVersion !== LEGAL_VERSION ||
    !validateNewPassword(password).valid
  ) {
    return signupRedirect(request, { error: 'invalid_signup', plan: requestedPlan })
  }

  const admin = createSupabaseAdminClient()
  const { data: plan, error: planError } = await admin
    .from('commercial_public_plan_catalog')
    .select('plan_key,included_modules,status,public,price_mode')
    .eq('plan_key', requestedPlan)
    .eq('status', 'published')
    .eq('public', true)
    .maybeSingle()

  if (planError || !plan || !['starter','growth','commerce','agency'].includes(plan.plan_key)) {
    return signupRedirect(request, { error: 'invalid_signup' })
  }

  const selectedModules = Array.isArray(plan.included_modules)
    ? plan.included_modules.filter((value: unknown): value is string => typeof value === 'string')
    : []

  const supabase = await createSupabaseServerClient()
  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        company_name: companyName,
        legal_acceptance: {
          terms_version: termsVersion,
          privacy_version: privacyVersion,
          accepted_at: acceptedAt,
          source: 'self_service_signup',
        },
      },
    },
  })

  if (signupError || !signupData.user?.id) return signupRedirect(request, { error: 'account_creation_failed', plan: requestedPlan })

  const userId = signupData.user.id
  let operationalTenantId: string | null = null
  let stableBrandId: string | null = null
  let stableWorkspaceId: string | null = null
  let activationJourneyId: string | null = null

  async function rollbackProvisioning() {
    if (activationJourneyId) await admin.from('commercial_client_activation_journeys').delete().eq('journey_id', activationJourneyId)
    await admin.from('core_tenant_feature_entitlements').delete().eq('tenant_id', stableWorkspaceId ? stableWorkspaceId.replace(/^workspace_/, 'tenant_').replace(/_primary$/, '') : '__none__')
    await admin.from('core_tenant_memberships').delete().eq('user_id', userId)
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
  if (tenantError || !tenant?.id) { await rollbackProvisioning(); return signupRedirect(request, { error: 'workspace_provision_failed', plan: requestedPlan }) }
  operationalTenantId = tenant.id

  const { data: brand, error: brandError } = await admin
    .from('brands')
    .insert({ tenant_id: tenant.id, name: brandName, website_url: website || null })
    .select('id')
    .single()
  if (brandError || !brand?.id) { await rollbackProvisioning(); return signupRedirect(request, { error: 'workspace_provision_failed', plan: requestedPlan }) }

  const workspaceSlug = `${baseSlug}-growth`
  const { data: workspace, error: workspaceError } = await admin
    .from('workspaces')
    .insert({ tenant_id: tenant.id, brand_id: brand.id, name: `${brandName} Growth Workspace`, slug: workspaceSlug })
    .select('id')
    .single()
  if (workspaceError || !workspace?.id) { await rollbackProvisioning(); return signupRedirect(request, { error: 'workspace_provision_failed', plan: requestedPlan }) }

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
    metadata: { operationalTenantId: tenant.id, operationalBrandId: brand.id, createdBy: 'self_service_signup', selectedPlan: plan.plan_key },
  })
  if (coreBrandError) { await rollbackProvisioning(); return signupRedirect(request, { error: 'workspace_provision_failed', plan: requestedPlan }) }

  const { error: coreWorkspaceError } = await admin.from('core_workspaces').insert({
    workspace_id: stableWorkspaceId,
    tenant_id: stableTenantId,
    brand_id: stableBrandId,
    autonomy_level: 0,
    status: 'active',
    metadata: {
      operationalTenantId: tenant.id,
      operationalBrandId: brand.id,
      operationalWorkspaceId: workspace.id,
      edition: plan.plan_key,
      onboardingState: 'brand_learning',
      activationState: 'brand_learning',
      modulesEnabled: false,
    },
  })
  if (coreWorkspaceError) { await rollbackProvisioning(); return signupRedirect(request, { error: 'workspace_provision_failed', plan: requestedPlan }) }

  const { data: roleDefinition } = await admin.from('core_role_definitions').select('metadata').eq('role_key', 'tenant_admin').maybeSingle()
  const roleMetadata = roleDefinition?.metadata && typeof roleDefinition.metadata === 'object' ? roleDefinition.metadata : {}
  const { error: membershipError } = await admin.from('core_tenant_memberships').insert({
    membership_id: `membership_${userId}`,
    tenant_id: stableTenantId,
    user_id: userId,
    role_key: 'tenant_admin',
    brand_id: stableBrandId,
    workspace_id: stableWorkspaceId,
    status: 'active',
    authority_limits: { selfServe: true, commerciallyGated: true },
    metadata: {
      ...roleMetadata,
      operationalTenantId: tenant.id,
      operationalBrandId: brand.id,
      operationalWorkspaceId: workspace.id,
      fullName,
      companyName,
      brandName,
      website: website || null,
      onboardingState: 'brand_learning',
      activationState: 'brand_learning',
      modulesEnabled: false,
      edition: plan.plan_key,
      billingCadence,
      legalAcceptance: {
        termsVersion,
        privacyVersion,
        acceptedAt,
        source: 'self_service_signup',
      },
    },
  })
  if (membershipError) { await rollbackProvisioning(); return signupRedirect(request, { error: 'workspace_provision_failed', plan: requestedPlan }) }

  const { error: consentError } = await admin.from('privacy_consent_events').insert({
    consent_event_id: crypto.randomUUID(),
    tenant_id: tenant.id,
    workspace_id: workspace.id,
    subject_key: userId,
    channel: 'web',
    purpose: 'platform_terms_and_privacy_notice',
    decision: 'granted',
    notice_version: LEGAL_VERSION,
    source: 'self_service_signup',
    lawful_basis: 'contract_and_notice_acknowledgement',
    actor_id: userId,
    metadata: { termsVersion, privacyVersion, email },
    occurred_at: acceptedAt,
  })
  if (consentError) { await rollbackProvisioning(); return signupRedirect(request, { error: 'workspace_provision_failed', plan: requestedPlan }) }

  const { data: flags, error: flagsError } = await admin.from('core_feature_flags').select('flag_key')
  if (flagsError) { await rollbackProvisioning(); return signupRedirect(request, { error: 'workspace_provision_failed', plan: requestedPlan }) }

  const allowedModuleSet = new Set(selectedModules)
  const entitlements = (flags ?? []).map((flag) => ({
    entitlement_id: `entitlement_${tenantSlug}_${String(flag.flag_key).replace(/[^a-z0-9]+/gi, '_')}`,
    tenant_id: stableTenantId,
    flag_key: flag.flag_key,
    brand_id: stableBrandId,
    workspace_id: stableWorkspaceId,
    state: 'gated',
    config: { edition: plan.plan_key, source: 'self_service_signup', activationRequired: true, includedByPlan: allowedModuleSet.has(String(flag.flag_key).split('.')[0]) },
    is_active: true,
  }))
  if (entitlements.length) {
    const { error: entitlementError } = await admin.from('core_tenant_feature_entitlements').insert(entitlements)
    if (entitlementError) { await rollbackProvisioning(); return signupRedirect(request, { error: 'workspace_provision_failed', plan: requestedPlan }) }
  }

  try {
    const activation = await createClientActivation({
      tenantId: stableTenantId,
      workspaceId: stableWorkspaceId,
      userId,
      selectedPlan: plan.plan_key,
      selectedModules,
      billingCadence,
    })
    activationJourneyId = activation.journey_id
  } catch {
    await rollbackProvisioning()
    return signupRedirect(request, { error: 'workspace_provision_failed', plan: requestedPlan })
  }

  if (!signupData.session) return signupRedirect(request, { success: 'check_email', plan: plan.plan_key })
  return NextResponse.redirect(new URL('/onboarding/activation', request.url), 303)
}
