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

function campaignDate(value: string, field: string) {
  const normalized = value.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) throw new Error(`google_ads_${field}_invalid`)
  const parsed = new Date(`${normalized}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== normalized) throw new Error(`google_ads_${field}_invalid`)
  return normalized
}

function campaignWindow(startDate: string, endDate: string) {
  const start = campaignDate(startDate, 'start_date')
  const end = campaignDate(endDate, 'end_date')
  if (end < start) throw new Error('google_ads_campaign_window_invalid')
  return {
    startDate: start,
    endDate: end,
    startDateTime: `${start} 00:00:00`,
    endDateTime: `${end} 23:59:59`,
  }
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

export async function createBoundedSearchCampaign(
  access: ApiAccessContext,
  input: {
    workspaceId?: string
    approvalId: string
    customerId: string
    name: string
    totalBudgetMicros: number
    startDate: string
    endDate: string
  },
) {
  const { target } = await approved(access, input.workspaceId, input.approvalId, 'google_ads_campaign')
  const customerId = customer(input.customerId)
  const name = input.name.trim()
  if (!name) throw new Error('google_ads_campaign_name_required')
  const totalBudgetMicros = Math.trunc(input.totalBudgetMicros)
  if (!Number.isSafeInteger(totalBudgetMicros) || totalBudgetMicros <= 0) throw new Error('google_ads_total_budget_invalid')
  const window = campaignWindow(input.startDate, input.endDate)
  const suffix = Date.now()

  const budget = await mutate(target.tenantId, target.workspaceId, customerId, 'campaignBudgets', {
    operations: [{ create: {
      name: `${name} total budget ${suffix}`,
      period: 'CUSTOM_PERIOD',
      totalAmountMicros: String(totalBudgetMicros),
      deliveryMethod: 'STANDARD',
      explicitlyShared: false,
    } }],
  })
  const budgetResource = budget?.results?.[0]?.resourceName
  if (!budgetResource) throw new Error('google_ads_budget_resource_missing')

  const campaign = await mutate(target.tenantId, target.workspaceId, customerId, 'campaigns', {
    operations: [{ create: {
      name,
      status: 'PAUSED',
      advertisingChannelType: 'SEARCH',
      campaignBudget: budgetResource,
      startDateTime: window.startDateTime,
      endDateTime: window.endDateTime,
      maximizeClicks: {},
      networkSettings: { targetGoogleSearch: true, targetSearchNetwork: true, targetContentNetwork: false, targetPartnerSearchNetwork: false },
    } }],
  })
  const resourceName = campaign?.results?.[0]?.resourceName
  if (!resourceName) throw new Error('google_ads_campaign_resource_missing')

  await recordResource(access, {
    workspaceId: input.workspaceId,
    customerId,
    resourceType: 'campaign',
    resourceName,
    displayName: name,
    write: true,
    metadata: {
      approvalId: input.approvalId,
      budgetResource,
      budgetMode: 'CUSTOM_PERIOD_TOTAL',
      totalBudgetMicros,
      startDate: window.startDate,
      endDate: window.endDate,
      createdStatus: 'PAUSED',
    },
  })

  const verified = await readCampaign(access, { workspaceId: input.workspaceId, customerId, resourceName })
  if (String(verified?.campaign?.status || '').toUpperCase() !== 'PAUSED') throw new Error('google_ads_paused_verification_failed')
  return { resourceName, budgetResource, status: 'PAUSED', totalBudgetMicros, window, verified }
}

export async function setCampaignStatus(
  access: ApiAccessContext,
  input: { workspaceId?: string; approvalId: string; customerId: string; resourceName: string; status: 'ENABLED' | 'PAUSED' },
) {
  await approved(access, input.workspaceId, input.approvalId, 'google_ads_campaign')
  await mutate((await resolveOperationalTarget(access, input.workspaceId)).tenantId, (await resolveOperationalTarget(access, input.workspaceId)).workspaceId, input.customerId, 'campaigns', {
    operations: [{ update: { resourceName: input.resourceName, status: input.status }, updateMask: 'status' }],
  })
  const verified = await readCampaign(access, { workspaceId: input.workspaceId, customerId: input.customerId, resourceName: input.resourceName })
  if (String(verified?.campaign?.status || '').toUpperCase() !== input.status) throw new Error('google_ads_status_verification_failed')
  return verified
}

export async function createAndEnableBoundedSearchCampaign(
  access: ApiAccessContext,
  input: {
    workspaceId?: string
    approvalId: string
    customerId: string
    name: string
    totalBudgetMicros: number
    startDate: string
    endDate: string
  },
) {
  const created = await createBoundedSearchCampaign(access, input)
  const enabled = await setCampaignStatus(access, {
    workspaceId: input.workspaceId,
    approvalId: input.approvalId,
    customerId: input.customerId,
    resourceName: created.resourceName,
    status: 'ENABLED',
  })
  return { ...created, status: 'ENABLED', enabled }
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
    body: JSON.stringify({ query: `SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type, campaign.start_date_time, campaign.end_date_time, campaign_budget.amount_micros, campaign_budget.total_amount_micros, campaign_budget.period FROM campaign WHERE campaign.id = ${campaignId} LIMIT 1` }),
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
