import type { ApiAccessContext } from '@/lib/auth/api-access'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { decryptSecret } from '@/lib/integrations/google'
import { googleAccessToken } from '@/lib/integrations/google'
import { googleAdsRuntimeConfig } from '@/lib/integrations/google-ads-runtime'
import { resolveOperationalTarget, type OperationalTarget } from '@/lib/integrations/operational-target'

export type ProviderQaChannel = 'google_ads' | 'facebook' | 'instagram' | 'linkedin' | 'youtube'
type ProviderKey = 'google' | 'meta' | 'linkedin'
type ReadinessState = 'connected' | 'authority_verified' | 'capabilities_verified' | 'ready' | 'degraded' | 'expired' | 'revoked'

type QaCheck = {
  key: string
  passed: boolean
  detail?: string | number | boolean | null
}

type QaEvidence = {
  provider: ProviderKey
  channel: ProviderQaChannel
  accountId: string
  externalResourceId: string
  checks: QaCheck[]
  warnings: string[]
  evidence: Record<string, unknown>
}

const QA_TTL_MS = 15 * 60_000
const CANARY_TTL_MS = 7 * 24 * 60 * 60_000
const SOCIAL_CANARY_CHANNELS = new Set<ProviderQaChannel>(['facebook', 'instagram', 'linkedin', 'youtube'])

function providerFor(channel: ProviderQaChannel): ProviderKey {
  if (channel === 'google_ads' || channel === 'youtube') return 'google'
  if (channel === 'linkedin') return 'linkedin'
  return 'meta'
}

function cleanError(error: unknown) {
  return error instanceof Error ? error.message.split(':')[0] : 'provider_qa_failed'
}

function normalizeCustomerId(value: string | undefined) {
  const id = String(value || '').replace(/\D/g, '')
  if (!id) throw new Error('google_ads_customer_required')
  return id
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : []
}

function requireWorkspace(target: OperationalTarget) {
  if (!target.workspaceId) throw new Error('provider_qa_workspace_required')
  return target.workspaceId
}

async function connectedAccount(target: OperationalTarget, provider: ProviderKey) {
  const workspaceId = requireWorkspace(target)
  const { data, error } = await createSupabaseAdminClient()
    .from('integration_accounts')
    .select('*')
    .eq('tenant_id', target.tenantId)
    .eq('workspace_id', workspaceId)
    .eq('provider', provider)
    .eq('status', 'connected')
    .order('last_verified_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(`provider_qa_account_read_failed:${error.message}`)
  if (!data) throw new Error(`${provider}_account_not_connected`)
  return data as any
}

async function accessToken(accountId: string) {
  const { data, error } = await createSupabaseAdminClient()
    .from('integration_secret_material')
    .select('encrypted_value')
    .eq('account_id', accountId)
    .eq('secret_kind', 'oauth_access_token')
    .maybeSingle()
  if (error || !data?.encrypted_value) throw new Error('provider_access_token_missing')
  return decryptSecret(String(data.encrypted_value))
}

async function providerJson(url: string, init?: RequestInit, code = 'provider_qa_request_failed') {
  const response = await fetch(url, init)
  const payload: any = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(`${code}:${payload?.error?.code || payload?.error?.status || payload?.status || response.status}`)
  return { response, payload }
}

function metaGraphUrl(version: string, path: string) {
  return `https://graph.facebook.com/${encodeURIComponent(version)}/${path.replace(/^\//, '')}`
}

async function qaMeta(target: OperationalTarget, channel: 'facebook' | 'instagram'): Promise<QaEvidence> {
  const account = await connectedAccount(target, 'meta')
  const token = await accessToken(account.id)
  const scopes = stringArray(account.scopes)
  const version = String(account.metadata?.apiVersion || '').trim()
  const pageId = String(account.metadata?.facebookPageId || account.external_account_id || '').replace(/\D/g, '')
  if (!version) throw new Error('meta_graph_api_version_missing')
  if (!pageId) throw new Error('meta_facebook_page_id_missing')

  const checks: QaCheck[] = []
  const requiredScopes = channel === 'instagram'
    ? ['pages_manage_posts', 'instagram_basic', 'instagram_content_publish']
    : ['pages_manage_posts']
  for (const scope of requiredScopes) checks.push({ key: `scope:${scope}`, passed: scopes.includes(scope) })
  if (requiredScopes.some(scope => !scopes.includes(scope))) throw new Error(`${channel}_publish_scope_missing`)

  const query = new URLSearchParams({ fields: 'id,name,instagram_business_account', access_token: token })
  const pageResult = await providerJson(`${metaGraphUrl(version, pageId)}?${query.toString()}`, undefined, 'meta_page_qa_failed')
  const page = pageResult.payload
  const pageIdentity = String(page.id || '') === pageId
  checks.push({ key: 'page_identity', passed: pageIdentity, detail: String(page.id || '') })
  if (!pageIdentity) throw new Error('meta_page_identity_mismatch')

  const linkedInstagramId = String(page.instagram_business_account?.id || '') || null
  let externalResourceId = pageId
  const evidence: Record<string, unknown> = {
    pageId,
    pageName: String(page.name || account.account_name || ''),
    grantedScopes: scopes,
  }
  if (channel === 'instagram') {
    const expectedInstagramId = String(account.metadata?.instagramUserId || '')
    if (!expectedInstagramId || expectedInstagramId !== linkedInstagramId) throw new Error('meta_instagram_identity_mismatch')
    const igQuery = new URLSearchParams({ fields: 'id,username,account_type', access_token: token })
    const igResult = await providerJson(`${metaGraphUrl(version, expectedInstagramId)}?${igQuery.toString()}`, undefined, 'instagram_identity_qa_failed')
    const instagramIdentity = String(igResult.payload?.id || '') === expectedInstagramId
    checks.push({ key: 'instagram_identity', passed: instagramIdentity, detail: String(igResult.payload?.username || '') })
    if (!instagramIdentity) throw new Error('meta_instagram_identity_mismatch')
    externalResourceId = expectedInstagramId
    evidence.instagramUserId = expectedInstagramId
    evidence.instagramUsername = String(igResult.payload?.username || '')
    evidence.instagramAccountType = String(igResult.payload?.account_type || '')
  } else {
    checks.push({ key: 'page_publish_scope', passed: true })
  }

  return {
    provider: 'meta',
    channel,
    accountId: account.id,
    externalResourceId,
    checks,
    warnings: [],
    evidence,
  }
}

function linkedinHeaders(token: string, version: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Linkedin-Version': version,
    'X-Restli-Protocol-Version': '2.0.0',
  }
}

async function qaLinkedIn(target: OperationalTarget): Promise<QaEvidence> {
  const account = await connectedAccount(target, 'linkedin')
  const token = await accessToken(account.id)
  const scopes = stringArray(account.scopes)
  const version = String(account.metadata?.apiVersion || '').trim()
  const organizationUrn = String(account.metadata?.organizationUrn || account.external_account_id || '').trim()
  const memberUrn = String(account.metadata?.memberUrn || '').trim()
  if (!/^20\d{4}$/.test(version)) throw new Error('linkedin_api_version_invalid')
  if (!/^urn:li:organization:\d+$/.test(organizationUrn)) throw new Error('linkedin_organization_urn_invalid')
  if (!/^urn:li:person:[A-Za-z0-9_-]+$/.test(memberUrn)) throw new Error('linkedin_member_urn_invalid')

  const checks: QaCheck[] = [
    { key: 'scope:w_organization_social', passed: scopes.includes('w_organization_social') },
    { key: 'scope:r_organization_admin', passed: scopes.includes('r_organization_admin') || scopes.includes('rw_organization_admin') },
  ]
  if (!checks.every(check => check.passed)) throw new Error('linkedin_required_scope_missing')

  const { payload } = await providerJson(
    'https://api.linkedin.com/rest/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED&count=100',
    { headers: linkedinHeaders(token, version) },
    'linkedin_organization_qa_failed',
  )
  const approved = (Array.isArray(payload.elements) ? payload.elements : []).some((acl: any) =>
    String(acl.organization || '').trim() === organizationUrn && String(acl.roleAssignee || '').trim() === memberUrn,
  )
  checks.push({ key: 'approved_administrator_authority', passed: approved })
  if (!approved) throw new Error('linkedin_organization_admin_authority_revoked')

  return {
    provider: 'linkedin',
    channel: 'linkedin',
    accountId: account.id,
    externalResourceId: organizationUrn,
    checks,
    warnings: [],
    evidence: { organizationUrn, memberUrn, grantedScopes: scopes, apiVersion: version },
  }
}

async function googleAdsRequest(target: OperationalTarget) {
  const account = await connectedAccount(target, 'google')
  const [{ accessToken: token, account: refreshed }, config] = await Promise.all([
    googleAccessToken(target.tenantId, requireWorkspace(target)),
    googleAdsRuntimeConfig(),
  ])
  if (refreshed.id !== account.id) throw new Error('google_account_identity_changed')
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'developer-token': config.developerToken,
  }
  if (config.loginCustomerId) headers['login-customer-id'] = config.loginCustomerId
  return { account, token, config, headers }
}

async function googleAdsSearch(target: OperationalTarget, customerId: string, query: string) {
  const request = await googleAdsRequest(target)
  const result = await providerJson(
    `https://googleads.googleapis.com/${request.config.apiVersion}/customers/${customerId}/googleAds:search`,
    { method: 'POST', headers: request.headers, body: JSON.stringify({ query }) },
    'google_ads_qa_read_failed',
  )
  return { ...request, payload: result.payload }
}

async function qaGoogleAds(target: OperationalTarget, rawCustomerId?: string): Promise<QaEvidence> {
  const customerId = normalizeCustomerId(rawCustomerId)
  const customerResult = await googleAdsSearch(
    target,
    customerId,
    'SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.time_zone, customer.status, customer.manager, customer.test_account FROM customer LIMIT 1',
  )
  const account = customerResult.account
  const scopes = stringArray(account.scopes)
  if (!scopes.includes('https://www.googleapis.com/auth/adwords')) throw new Error('google_ads_scope_missing')
  const customer = customerResult.payload?.results?.[0]?.customer
  if (!customer?.id) throw new Error('google_ads_customer_not_accessible')

  const checks: QaCheck[] = [
    { key: 'scope:adwords', passed: true },
    { key: 'customer_identity', passed: String(customer.id) === customerId, detail: String(customer.id) },
    { key: 'customer_enabled', passed: String(customer.status || '').toUpperCase() === 'ENABLED', detail: String(customer.status || '') },
    { key: 'advertiser_not_manager', passed: customer.manager !== true },
    { key: 'production_account', passed: customer.testAccount !== true },
  ]
  if (!checks[1].passed) throw new Error('google_ads_customer_identity_mismatch')
  if (!checks[2].passed) throw new Error(`google_ads_customer_not_enabled:${customer.status || 'unknown'}`)
  if (!checks[3].passed) throw new Error('google_ads_manager_account_not_publishable')
  if (!checks[4].passed) throw new Error('google_ads_test_account_not_publishable')

  const billingResult = await googleAdsSearch(
    target,
    customerId,
    'SELECT billing_setup.id, billing_setup.status, billing_setup.start_date_time, billing_setup.end_date_time FROM billing_setup ORDER BY billing_setup.start_date_time DESC LIMIT 20',
  )
  const billingRows = Array.isArray(billingResult.payload?.results) ? billingResult.payload.results : []
  const billingStatuses = billingRows.map((row: any) => String(row.billingSetup?.status || '').toUpperCase()).filter(Boolean)
  const approvedBilling = billingStatuses.includes('APPROVED')
  checks.push({ key: 'billing_setup_approved', passed: approvedBilling, detail: billingStatuses.join(',') || 'none' })
  if (!approvedBilling) throw new Error('google_ads_billing_not_approved')

  const validationName = `Oye readiness validate-only ${Date.now()}`
  const validate = await providerJson(
    `https://googleads.googleapis.com/${customerResult.config.apiVersion}/customers/${customerId}/campaignBudgets:mutate`,
    {
      method: 'POST',
      headers: customerResult.headers,
      body: JSON.stringify({
        operations: [{
          create: {
            name: validationName,
            amountMicros: '1000000',
            deliveryMethod: 'STANDARD',
            explicitlyShared: false,
          },
        }],
        validateOnly: true,
      }),
    },
    'google_ads_validate_only_failed',
  )
  checks.push({ key: 'validate_only_write_authority', passed: validate.response.ok })

  return {
    provider: 'google',
    channel: 'google_ads',
    accountId: account.id,
    externalResourceId: customerId,
    checks,
    warnings: [],
    evidence: {
      customerId,
      descriptiveName: String(customer.descriptiveName || ''),
      currencyCode: String(customer.currencyCode || '').toUpperCase(),
      timeZone: String(customer.timeZone || ''),
      customerStatus: String(customer.status || '').toUpperCase(),
      billingStatuses,
      validateOnly: true,
      apiVersion: customerResult.config.apiVersion,
      grantedScopes: scopes,
    },
  }
}

async function qaYouTube(target: OperationalTarget): Promise<QaEvidence> {
  const account = await connectedAccount(target, 'google')
  const scopes = stringArray(account.scopes)
  if (!scopes.includes('https://www.googleapis.com/auth/youtube.upload')) throw new Error('youtube_upload_scope_missing')
  if (!scopes.includes('https://www.googleapis.com/auth/youtube.readonly')) throw new Error('youtube_read_scope_missing')
  const refreshed = await googleAccessToken(target.tenantId, requireWorkspace(target))
  if (refreshed.account.id !== account.id) throw new Error('google_account_identity_changed')
  const { payload } = await providerJson(
    'https://www.googleapis.com/youtube/v3/channels?part=id,snippet&mine=true',
    { headers: { Authorization: `Bearer ${refreshed.accessToken}` } },
    'youtube_channel_qa_failed',
  )
  const channel = Array.isArray(payload.items) ? payload.items[0] : null
  if (!channel?.id) throw new Error('youtube_channel_missing')
  const channelId = String(channel.id)
  const expectedChannelId = String(account.metadata?.discovery?.youtubeChannelId || '')
  if (expectedChannelId && expectedChannelId !== channelId) throw new Error('youtube_channel_identity_changed')
  const checks: QaCheck[] = [
    { key: 'scope:youtube.readonly', passed: true },
    { key: 'scope:youtube.upload', passed: true },
    { key: 'authenticated_channel_identity', passed: true, detail: channelId },
  ]
  return {
    provider: 'google',
    channel: 'youtube',
    accountId: account.id,
    externalResourceId: channelId,
    checks,
    warnings: [],
    evidence: {
      channelId,
      channelTitle: String(channel.snippet?.title || ''),
      grantedScopes: scopes,
    },
  }
}

async function existingReadiness(target: OperationalTarget, channel: ProviderQaChannel) {
  const { data, error } = await createSupabaseAdminClient()
    .from('provider_channel_readiness')
    .select('*')
    .eq('tenant_id', target.tenantId)
    .eq('workspace_id', requireWorkspace(target))
    .eq('channel', channel)
    .maybeSingle()
  if (error) throw new Error(`provider_readiness_read_failed:${error.message}`)
  return data as any
}

function canaryFresh(row: any, accountId: string, externalResourceId: string) {
  if (!row?.last_canary_at || row.account_id !== accountId || row.external_resource_id !== externalResourceId) return false
  const timestamp = new Date(row.last_canary_at).getTime()
  return Number.isFinite(timestamp) && Date.now() - timestamp <= CANARY_TTL_MS
}

async function persistResult(
  access: ApiAccessContext,
  target: OperationalTarget,
  channel: ProviderQaChannel,
  result: QaEvidence | null,
  failure?: string,
) {
  const admin = createSupabaseAdminClient()
  const workspaceId = requireWorkspace(target)
  const now = new Date()
  const checkedAt = now.toISOString()
  const validUntil = new Date(now.getTime() + QA_TTL_MS).toISOString()
  const previous = await existingReadiness(target, channel)
  const provider = result?.provider || providerFor(channel)
  const accountId = result?.accountId || previous?.account_id || null
  const externalResourceId = result?.externalResourceId || previous?.external_resource_id || null
  const hardBlockers = failure ? [failure] : []
  const liveCanaryRequired = Boolean(result && SOCIAL_CANARY_CHANNELS.has(channel) && !canaryFresh(previous, result.accountId, result.externalResourceId))
  const readinessBlockers = [...hardBlockers, ...(liveCanaryRequired ? ['provider_live_canary_required'] : [])]

  const { data: run, error: runError } = await admin.from('provider_qa_runs').insert({
    tenant_id: target.tenantId,
    workspace_id: workspaceId,
    account_id: accountId,
    provider,
    channel,
    external_resource_id: externalResourceId,
    status: failure ? 'failed' : 'passed',
    checks: result?.checks || [],
    blockers: hardBlockers,
    warnings: result?.warnings || [],
    evidence: result?.evidence || {},
    checked_at: checkedAt,
    valid_until: failure ? checkedAt : validUntil,
    completed_at: checkedAt,
    created_by: `machine:${access.subject}`,
    updated_at: checkedAt,
  }).select('*').single()
  if (runError) throw new Error(`provider_qa_run_write_failed:${runError.message}`)

  let readiness: any = null
  if (accountId && externalResourceId) {
    const state: ReadinessState = failure
      ? (/revoked|invalid_token|token_refresh_failed|identity_changed/.test(failure) ? 'revoked' : 'degraded')
      : channel === 'google_ads' || !liveCanaryRequired
        ? 'ready'
        : 'capabilities_verified'
    const { data, error } = await admin.from('provider_channel_readiness').upsert({
      tenant_id: target.tenantId,
      workspace_id: workspaceId,
      account_id: accountId,
      provider,
      channel,
      external_resource_id: externalResourceId,
      state,
      qa_run_id: run.qa_run_id,
      blockers: readinessBlockers,
      warnings: result?.warnings || [],
      evidence: result?.evidence || {},
      checked_at: checkedAt,
      valid_until: failure ? checkedAt : validUntil,
      last_canary_at: previous?.account_id === accountId && previous?.external_resource_id === externalResourceId ? previous?.last_canary_at || null : null,
      last_canary_resource_id: previous?.account_id === accountId && previous?.external_resource_id === externalResourceId ? previous?.last_canary_resource_id || null : null,
      source: 'machine',
      updated_at: checkedAt,
    }, { onConflict: 'tenant_id,workspace_id,channel' }).select('*').single()
    if (error) throw new Error(`provider_readiness_write_failed:${error.message}`)
    readiness = data
  }
  return { target, run, readiness }
}

export async function runProviderQa(
  access: ApiAccessContext,
  input: { workspaceId?: string; channel: ProviderQaChannel; externalResourceId?: string },
) {
  const target = await resolveOperationalTarget(access, input.workspaceId)
  requireWorkspace(target)
  try {
    const result = input.channel === 'google_ads'
      ? await qaGoogleAds(target, input.externalResourceId)
      : input.channel === 'youtube'
        ? await qaYouTube(target)
        : input.channel === 'linkedin'
          ? await qaLinkedIn(target)
          : await qaMeta(target, input.channel)
    return persistResult(access, target, input.channel, result)
  } catch (error) {
    return persistResult(access, target, input.channel, null, cleanError(error))
  }
}

export async function listProviderReadiness(access: ApiAccessContext, workspaceId?: string) {
  const target = await resolveOperationalTarget(access, workspaceId)
  const operationalWorkspaceId = requireWorkspace(target)
  const admin = createSupabaseAdminClient()
  const [readiness, runs] = await Promise.all([
    admin.from('provider_channel_readiness').select('*').eq('tenant_id', target.tenantId).eq('workspace_id', operationalWorkspaceId).order('channel'),
    admin.from('provider_qa_runs').select('*').eq('tenant_id', target.tenantId).eq('workspace_id', operationalWorkspaceId).order('checked_at', { ascending: false }).limit(50),
  ])
  if (readiness.error) throw new Error(`provider_readiness_read_failed:${readiness.error.message}`)
  if (runs.error) throw new Error(`provider_qa_run_read_failed:${runs.error.message}`)
  return { target, readiness: readiness.data || [], recentRuns: runs.data || [] }
}

export async function recordProviderCanarySuccess(
  access: ApiAccessContext,
  input: { workspaceId?: string; channel: Exclude<ProviderQaChannel, 'google_ads'>; accountId: string; resourceId: string },
) {
  const target = await resolveOperationalTarget(access, input.workspaceId)
  const workspaceId = requireWorkspace(target)
  const admin = createSupabaseAdminClient()
  const { data: current, error } = await admin.from('provider_channel_readiness')
    .select('*')
    .eq('tenant_id', target.tenantId)
    .eq('workspace_id', workspaceId)
    .eq('channel', input.channel)
    .maybeSingle()
  if (error) throw new Error(`provider_readiness_read_failed:${error.message}`)
  if (!current || current.account_id !== input.accountId) throw new Error('provider_canary_readiness_missing')
  if (['revoked', 'degraded', 'expired'].includes(String(current.state))) throw new Error(`provider_canary_not_certifiable:${current.state}`)
  const now = new Date().toISOString()
  const validUntil = new Date(Date.now() + QA_TTL_MS).toISOString()
  const checks = [
    { key: 'provider_write_completed', passed: true },
    { key: 'provider_readback_verified', passed: true },
  ]
  const { data: run, error: runError } = await admin.from('provider_qa_runs').insert({
    tenant_id: target.tenantId,
    workspace_id: workspaceId,
    account_id: input.accountId,
    provider: current.provider,
    channel: input.channel,
    external_resource_id: current.external_resource_id,
    status: 'passed',
    checks,
    blockers: [],
    warnings: [],
    evidence: { ...(current.evidence || {}), canaryResourceId: input.resourceId, canaryVerifiedAt: now },
    checked_at: now,
    valid_until: validUntil,
    completed_at: now,
    created_by: `machine:canary:${access.subject}`,
    updated_at: now,
  }).select('*').single()
  if (runError) throw new Error(`provider_qa_run_write_failed:${runError.message}`)
  const { data: readiness, error: updateError } = await admin.from('provider_channel_readiness').update({
    state: 'ready',
    qa_run_id: run.qa_run_id,
    blockers: [],
    evidence: { ...(current.evidence || {}), canaryResourceId: input.resourceId, canaryVerifiedAt: now },
    checked_at: now,
    valid_until: validUntil,
    last_canary_at: now,
    last_canary_resource_id: input.resourceId,
    source: 'machine',
    updated_at: now,
  }).eq('readiness_id', current.readiness_id).select('*').single()
  if (updateError) throw new Error(`provider_readiness_write_failed:${updateError.message}`)
  return { run, readiness }
}

export async function providerQaGateBlockers(
  access: ApiAccessContext,
  input: { actionKey: string; workspaceId?: string; channel: string; payload?: Record<string, any> },
) {
  let channel: ProviderQaChannel | null = null
  let externalResourceId: string | undefined
  if (input.actionKey === 'campaign.launch') {
    channel = 'google_ads'
    externalResourceId = String(input.payload?.customerId || '') || undefined
  } else if (input.actionKey === 'social.publish' && ['facebook', 'instagram', 'linkedin', 'youtube'].includes(input.channel)) {
    channel = input.channel as ProviderQaChannel
  }
  if (!channel) return []
  const result = await runProviderQa(access, { workspaceId: input.workspaceId, channel, externalResourceId })
  if (!result.readiness) return [`machine_provider_qa_failed:${cleanError(result.run?.blockers?.[0] || 'readiness_missing')}`]
  const row: any = result.readiness
  const blockers: string[] = []
  if (row.state !== 'ready') blockers.push(`machine_provider_not_ready:${channel}:${row.state}`)
  if (new Date(row.valid_until).getTime() <= Date.now()) blockers.push(`machine_provider_readiness_expired:${channel}`)
  for (const blocker of stringArray(row.blockers)) blockers.push(`machine_provider_blocker:${blocker}`)
  return Array.from(new Set(blockers))
}
