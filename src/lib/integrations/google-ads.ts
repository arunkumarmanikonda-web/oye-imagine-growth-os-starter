import type { ApiAccessContext } from '@/lib/auth/api-access'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { googleAccessToken } from '@/lib/integrations/google'
import { resolveOperationalTarget } from '@/lib/integrations/operational-target'

function version() {
  return process.env.GOOGLE_ADS_API_VERSION || 'v25'
}

function customer(value: string) {
  const id = value.replace(/\D/g, '')
  if (!id) throw new Error('google_ads_customer_required')
  return id
}

async function headers(tenantId: string, workspaceId?: string | null) {
  const { accessToken } = await googleAccessToken(tenantId, workspaceId)
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN?.trim()
  if (!developerToken) throw new Error('google_ads_developer_token_not_configured')
  const h: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'developer-token': developerToken,
  }
  if (process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID) h['login-customer-id'] = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID.replace(/-/g, '')
  return h
}

async function approved(access: ApiAccessContext, workspaceId: string | undefined, approvalId: string, resourceType: string) {
  if (!approvalId.trim()) throw new Error('approved_request_required')
  const target = await resolveOperationalTarget(access, workspaceId)
  const admin = createSupabaseAdminClient()
  const { data, error } = await admin
    .from('commercial_approval_requests')
    .select('*')
    .eq('approval_id', approvalId)
    .eq('tenant_id', target.tenantId)
    .eq('status', 'approved')
    .maybeSingle()
  if (error || !data) throw new Error('approved_request_required')
  const payload = (data.payload || {}) as Record<string, unknown>
  const scopedResource = typeof payload.resourceType === 'string' ? payload.resourceType : typeof payload.externalAction === 'string' ? payload.externalAction : null
  if (data.approval_type !== resourceType && scopedResource !== resourceType) throw new Error('approval_resource_mismatch')
  return { approval: data, target }
}

async function recordResource(
  access: ApiAccessContext,
  input: {
    workspaceId?: string
    customerId: string
    resourceType: string
    resourceName: string
    displayName?: string
    metadata?: Record<string, unknown>
    write?: boolean
  },
) {
  const target = await resolveOperationalTarget(access, input.workspaceId)
  const admin = createSupabaseAdminClient()
  let accountQuery = admin.from('integration_accounts').select('id').eq('tenant_id', target.tenantId).eq('provider', 'google').eq('status', 'connected')
  if (target.workspaceId) accountQuery = accountQuery.eq('workspace_id', target.workspaceId)
  const account = await accountQuery.order('created_at', { ascending: false }).limit(1).maybeSingle()
  const accountId = account.data?.id || null
  const { data, error } = await admin.from('provider_resource_links').upsert({
    tenant_id: target.tenantId,
    workspace_id: target.workspaceId,
    account_id: accountId,
    provider: 'google_ads',
    resource_type: input.resourceType,
    external_resource_id: input.resourceName,
    external_parent_id: input.customerId,
    display_name: input.displayName || input.resourceName,
    status: 'active',
    metadata: input.metadata || {},
    last_read_at: input.write ? null : new Date().toISOString(),
    last_write_at: input.write ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'tenant_id,provider,resource_type,external_resource_id' }).select('*').single()
  if (error) throw new Error(`google_ads_resource_write_failed:${error.message}`)
  return data
}

async function mutate(tenantId: string, workspaceId: string | null, customerId: string, resource: string, body: unknown) {
  const response = await fetch(`https://googleads.googleapis.com/${version()}/customers/${customer(customerId)}/${resource}:mutate`, {
    method: 'POST',
    headers: await headers(tenantId, workspaceId),
    body: JSON.stringify(body),
  })
  const payload: any = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(`google_ads_mutate_failed:${payload?.error?.status || response.status}`)
  return payload
}

export async function createPausedSearchCampaign(
  access: ApiAccessContext,
  input: { workspaceId?: string; approvalId: string; customerId: string; name: string; dailyBudgetMicros: number },
) {
  const { target } = await approved(access, input.workspaceId, input.approvalId, 'google_ads_campaign')
  const customerId = customer(input.customerId)
  const name = input.name.trim()
  if (!name) throw new Error('google_ads_campaign_name_required')
  const micros = Math.max(1_000_000, Math.trunc(input.dailyBudgetMicros))
  const suffix = Date.now()
  const budget = await mutate(target.tenantId, target.workspaceId, customerId, 'campaignBudgets', {
    operations: [{ create: { name: `${name} budget ${suffix}`, amountMicros: String(micros), deliveryMethod: 'STANDARD', explicitlyShared: false } }],
  })
  const budgetResource = budget?.results?.[0]?.resourceName
  if (!budgetResource) throw new Error('google_ads_budget_resource_missing')
  const campaign = await mutate(target.tenantId, target.workspaceId, customerId, 'campaigns', {
    operations: [{ create: {
      name,
      status: 'PAUSED',
      advertisingChannelType: 'SEARCH',
      campaignBudget: budgetResource,
      maximizeClicks: {},
      networkSettings: { targetGoogleSearch: true, targetSearchNetwork: true, targetContentNetwork: false, targetPartnerSearchNetwork: false },
    } }],
  })
  const resourceName = campaign?.results?.[0]?.resourceName
  if (!resourceName) throw new Error('google_ads_campaign_resource_missing')
  const link = await recordResource(access, {
    workspaceId: input.workspaceId,
    customerId,
    resourceType: 'campaign',
    resourceName,
    displayName: name,
    write: true,
    metadata: { approvalId: input.approvalId, budgetResource, dailyBudgetMicros: micros, createdStatus: 'PAUSED' },
  })
  return { resourceName, budgetResource, status: 'PAUSED', link }
}

export async function updateOrPauseCampaign(
  access: ApiAccessContext,
  input: { workspaceId?: string; approvalId: string; customerId: string; resourceName: string; name?: string; pause?: boolean },
) {
  const { target } = await approved(access, input.workspaceId, input.approvalId, 'google_ads_campaign')
  const update: Record<string, unknown> = { resourceName: input.resourceName }
  const fields: string[] = []
  if (input.name?.trim()) {
    update.name = input.name.trim()
    fields.push('name')
  }
  if (input.pause !== false) {
    update.status = 'PAUSED'
    fields.push('status')
  }
  if (!fields.length) throw new Error('google_ads_update_empty')
  await mutate(target.tenantId, target.workspaceId, input.customerId, 'campaigns', { operations: [{ update, updateMask: fields.join(',') }] })
  await recordResource(access, {
    workspaceId: input.workspaceId,
    customerId: customer(input.customerId),
    resourceType: 'campaign',
    resourceName: input.resourceName,
    displayName: input.name,
    write: true,
    metadata: { approvalId: input.approvalId, lastMutation: fields },
  })
  return readCampaign(access, { workspaceId: input.workspaceId, customerId: input.customerId, resourceName: input.resourceName })
}

export async function readCampaign(
  access: ApiAccessContext,
  input: { workspaceId?: string; customerId: string; resourceName: string },
) {
  const target = await resolveOperationalTarget(access, input.workspaceId)
  const campaignId = input.resourceName.split('/').pop()?.replace(/\D/g, '')
  if (!campaignId) throw new Error('google_ads_campaign_resource_invalid')
  const response = await fetch(`https://googleads.googleapis.com/${version()}/customers/${customer(input.customerId)}/googleAds:search`, {
    method: 'POST',
    headers: await headers(target.tenantId, target.workspaceId),
    body: JSON.stringify({ query: `SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type, campaign_budget.amount_micros FROM campaign WHERE campaign.id = ${campaignId} LIMIT 1` }),
  })
  const payload: any = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(`google_ads_read_failed:${payload?.error?.status || response.status}`)
  const row = payload?.results?.[0] || null
  if (row?.campaign?.resourceName) {
    await recordResource(access, {
      workspaceId: input.workspaceId,
      customerId: customer(input.customerId),
      resourceType: 'campaign',
      resourceName: row.campaign.resourceName,
      displayName: row.campaign.name,
      metadata: { status: row.campaign.status },
      write: false,
    })
  }
  return row
}
