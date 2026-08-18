import crypto from 'node:crypto'
import type { ApiAccessContext } from '@/lib/auth/api-access'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { googleAccessToken } from '@/lib/integrations/google'
import { googleAdsRuntimeConfig } from '@/lib/integrations/google-ads-runtime'
import { resolveOperationalTarget } from '@/lib/integrations/operational-target'

function hash(value: unknown) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

function isoDate(value: string, field: string) {
  const result = String(value || '').trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result)) throw new Error(`${field}_invalid`)
  const parsed = new Date(`${result}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== result) throw new Error(`${field}_invalid`)
  return result
}

async function connectedAccount(target: any) {
  const admin = createSupabaseAdminClient()
  let query = admin.from('integration_accounts').select('*').eq('tenant_id', target.tenantId).eq('provider', 'google').eq('status', 'connected')
  if (target.workspaceId) query = query.eq('workspace_id', target.workspaceId)
  const { data } = await query.order('created_at', { ascending: false }).limit(1).maybeSingle()
  if (!data) throw new Error('google_connection_missing')
  return data
}

async function start(target: any, provider: string, syncType: string, resource?: string) {
  const admin = createSupabaseAdminClient()
  const account = provider === 'commerce' ? null : await connectedAccount(target)
  const { data, error } = await admin.from('integration_sync_runs').insert({
    tenant_id: target.tenantId,
    workspace_id: target.workspaceId,
    account_id: account?.id || null,
    provider,
    sync_type: syncType,
    resource_id: resource || null,
    status: 'running',
    started_at: new Date().toISOString(),
  }).select('*').single()
  if (error) throw new Error(`sync_create_failed:${error.message}`)
  return { run: data, account }
}

async function finish(id: string, status: 'succeeded' | 'failed' | 'partial', read: number, written: number, code?: string) {
  const admin = createSupabaseAdminClient()
  await admin.from('integration_sync_runs').update({
    status,
    rows_read: read,
    rows_written: written,
    safe_error_code: code || null,
    freshness_at: status === 'succeeded' ? new Date().toISOString() : null,
    completed_at: new Date().toISOString(),
  }).eq('sync_run_id', id)
}

async function writeFact(input: {
  target: any
  provider: string
  accountId?: string | null
  resourceType: string
  externalId?: string | null
  date: string
  payload: any
  factType: string
  metrics: any
  dimensions?: any
  currency?: string | null
  runId: string
}) {
  const admin = createSupabaseAdminClient()
  const sourceHash = hash({ p: input.provider, r: input.externalId, d: input.date, v: input.payload })
  const { data: raw, error } = await admin.from('raw_growth_events').upsert({
    tenant_id: input.target.tenantId,
    workspace_id: input.target.workspaceId,
    provider: input.provider,
    account_id: input.accountId || null,
    resource_type: input.resourceType,
    external_resource_id: input.externalId || null,
    report_date: input.date,
    source_payload: input.payload,
    source_hash: sourceHash,
    sync_run_id: input.runId,
  }, { onConflict: 'tenant_id,provider,source_hash' }).select('raw_event_id').single()
  if (error) throw new Error(`raw_growth_write_failed:${error.message}`)
  const { error: factError } = await admin.from('growth_facts').insert({
    tenant_id: input.target.tenantId,
    workspace_id: input.target.workspaceId,
    provider: input.provider,
    fact_type: input.factType,
    external_resource_id: input.externalId || null,
    metric_date: input.date,
    dimensions: input.dimensions || {},
    metrics: input.metrics,
    currency: input.currency || null,
    source_raw_event_id: raw.raw_event_id,
    attribution_model: 'source_reported',
    attribution_version: 'v1',
    lineage: { syncRunId: input.runId, sourceHash },
  })
  if (factError) throw new Error(`growth_fact_write_failed:${factError.message}`)
}

export async function syncGoogleAdsTarget(access: ApiAccessContext, input: { workspaceId?: string; customerId: string; startDate: string; endDate: string }) {
  const target = await resolveOperationalTarget(access, input.workspaceId)
  const customer = input.customerId.replace(/\D/g, '')
  if (!customer) throw new Error('google_ads_customer_required')
  const startDate = isoDate(input.startDate, 'google_ads_start_date')
  const endDate = isoDate(input.endDate, 'google_ads_end_date')
  if (endDate < startDate) throw new Error('google_ads_date_range_invalid')
  const { run, account } = await start(target, 'google_ads', 'campaign_daily', customer)
  let read = 0
  let written = 0
  try {
    const [{ accessToken }, config] = await Promise.all([
      googleAccessToken(target.tenantId, target.workspaceId),
      googleAdsRuntimeConfig(),
    ])
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'developer-token': config.developerToken,
    }
    if (config.loginCustomerId) headers['login-customer-id'] = config.loginCustomerId
    const query = `SELECT segments.date, campaign.id, campaign.name, campaign.status, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, metrics.conversions_value FROM campaign WHERE segments.date BETWEEN '${startDate}' AND '${endDate}' ORDER BY segments.date`
    const response = await fetch(`https://googleads.googleapis.com/${config.apiVersion}/customers/${customer}/googleAds:search`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, pageSize: 10000 }),
    })
    const payload: any = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(`google_ads_sync_failed:${payload?.error?.status || response.status}`)
    const rows = payload.results || []
    read = rows.length
    for (const row of rows) {
      const date = row.segments?.date
      if (!date) continue
      await writeFact({
        target,
        provider: 'google_ads',
        accountId: account.id,
        resourceType: 'campaign',
        externalId: String(row.campaign?.id || ''),
        date,
        payload: row,
        factType: 'paid_media_campaign_daily',
        metrics: {
          impressions: Number(row.metrics?.impressions || 0),
          clicks: Number(row.metrics?.clicks || 0),
          cost: Number(row.metrics?.costMicros || 0) / 1e6,
          conversions: Number(row.metrics?.conversions || 0),
          conversionValue: Number(row.metrics?.conversionsValue || 0),
        },
        dimensions: { campaignName: row.campaign?.name, status: row.campaign?.status, customerId: customer },
        runId: run.sync_run_id,
      })
      written += 1
    }
    await finish(run.sync_run_id, 'succeeded', read, written)
    return { target, syncRunId: run.sync_run_id, rowsRead: read, rowsWritten: written }
  } catch (error) {
    await finish(run.sync_run_id, 'failed', read, written, error instanceof Error ? error.message.split(':')[0] : 'sync_failed')
    throw error
  }
}

export async function syncGa4Target(access: ApiAccessContext, input: { workspaceId?: string; propertyId: string; startDate: string; endDate: string }) {
  const target = await resolveOperationalTarget(access, input.workspaceId)
  const startDate = isoDate(input.startDate, 'ga4_start_date')
  const endDate = isoDate(input.endDate, 'ga4_end_date')
  const { run, account } = await start(target, 'ga4', 'property_daily', input.propertyId)
  let read = 0
  let written = 0
  try {
    const { accessToken } = await googleAccessToken(target.tenantId, target.workspaceId)
    const property = input.propertyId.replace(/^properties\//, '')
    if (!/^\d+$/.test(property)) throw new Error('ga4_property_invalid')
    const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${property}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ dateRanges: [{ startDate, endDate }], dimensions: [{ name: 'date' }], metrics: [{ name: 'sessions' }, { name: 'engagedSessions' }, { name: 'keyEvents' }, { name: 'totalRevenue' }], limit: '10000' }),
    })
    const payload: any = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(`ga4_sync_failed:${payload?.error?.status || response.status}`)
    const rows = payload.rows || []
    read = rows.length
    for (const row of rows) {
      const raw = String(row.dimensionValues?.[0]?.value || '')
      if (raw.length !== 8) continue
      const date = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
      const values = row.metricValues || []
      await writeFact({ target, provider: 'ga4', accountId: account.id, resourceType: 'property', externalId: `properties/${property}`, date, payload: row, factType: 'web_analytics_daily', metrics: { sessions: Number(values[0]?.value || 0), engagedSessions: Number(values[1]?.value || 0), keyEvents: Number(values[2]?.value || 0), totalRevenue: Number(values[3]?.value || 0) }, dimensions: { propertyId: `properties/${property}` }, runId: run.sync_run_id })
      written += 1
    }
    await finish(run.sync_run_id, 'succeeded', read, written)
    return { target, syncRunId: run.sync_run_id, rowsRead: read, rowsWritten: written }
  } catch (error) {
    await finish(run.sync_run_id, 'failed', read, written, error instanceof Error ? error.message.split(':')[0] : 'sync_failed')
    throw error
  }
}

export async function syncGscTarget(access: ApiAccessContext, input: { workspaceId?: string; siteUrl: string; startDate: string; endDate: string }) {
  const target = await resolveOperationalTarget(access, input.workspaceId)
  const startDate = isoDate(input.startDate, 'gsc_start_date')
  const endDate = isoDate(input.endDate, 'gsc_end_date')
  const { run, account } = await start(target, 'gsc', 'search_analytics', input.siteUrl)
  let read = 0
  let written = 0
  try {
    const { accessToken } = await googleAccessToken(target.tenantId, target.workspaceId)
    const response = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(input.siteUrl)}/searchAnalytics/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate, dimensions: ['date', 'query', 'page'], rowLimit: 25000 }),
    })
    const payload: any = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(`gsc_sync_failed:${payload?.error?.code || response.status}`)
    const rows = payload.rows || []
    read = rows.length
    for (const row of rows) {
      const [date, query, page] = row.keys || []
      if (!date) continue
      await writeFact({ target, provider: 'gsc', accountId: account.id, resourceType: 'site', externalId: input.siteUrl, date, payload: row, factType: 'organic_search_query_daily', metrics: { clicks: Number(row.clicks || 0), impressions: Number(row.impressions || 0), ctr: Number(row.ctr || 0), position: Number(row.position || 0) }, dimensions: { query, page, siteUrl: input.siteUrl }, runId: run.sync_run_id })
      written += 1
    }
    await finish(run.sync_run_id, 'succeeded', read, written)
    return { target, syncRunId: run.sync_run_id, rowsRead: read, rowsWritten: written }
  } catch (error) {
    await finish(run.sync_run_id, 'failed', read, written, error instanceof Error ? error.message.split(':')[0] : 'sync_failed')
    throw error
  }
}

export async function ingestCommerceTarget(access: ApiAccessContext, input: { workspaceId?: string; sourceSystem?: string; orders: any[] }) {
  const target = await resolveOperationalTarget(access, input.workspaceId)
  const admin = createSupabaseAdminClient()
  let written = 0
  for (const order of input.orders || []) {
    const externalOrderId = String(order.externalOrderId || order.id || '').trim()
    if (!externalOrderId) continue
    const gross = Number(order.grossRevenue ?? order.total ?? 0)
    const discount = Number(order.discountAmount ?? 0)
    const refund = Number(order.refundAmount ?? 0)
    const net = Number(order.netRevenue ?? gross - discount - refund)
    const payload = { tenant_id: target.tenantId, workspace_id: target.workspaceId, source_system: input.sourceSystem || 'neejee', external_order_id: externalOrderId, order_timestamp: new Date(order.orderTimestamp || order.createdAt || Date.now()).toISOString(), currency: String(order.currency || 'INR'), gross_revenue: gross, discount_amount: discount, refund_amount: refund, net_revenue: net, status: String(order.status || 'unknown'), customer_ref: order.customerRef ? String(order.customerRef) : null, utm: order.utm || {}, source_payload: order, source_hash: hash(order), updated_at: new Date().toISOString() }
    const { error } = await admin.from('commerce_orders_ingested').upsert(payload, { onConflict: 'tenant_id,source_system,external_order_id' })
    if (error) throw new Error(`commerce_order_write_failed:${error.message}`)
    written += 1
  }
  return { target, rowsWritten: written }
}

export async function growthHealthTarget(access: ApiAccessContext, workspaceId?: string) {
  const target = await resolveOperationalTarget(access, workspaceId)
  const admin = createSupabaseAdminClient()
  const now = Date.now()
  const sources: any[] = []
  for (const provider of ['google_ads', 'ga4', 'gsc']) {
    const { data } = await admin.from('integration_sync_runs').select('status,freshness_at,safe_error_code').eq('tenant_id', target.tenantId).eq('workspace_id', target.workspaceId).eq('provider', provider).order('created_at', { ascending: false }).limit(1).maybeSingle()
    const freshness = data?.freshness_at ? new Date(data.freshness_at).getTime() : 0
    const ageHours = freshness ? (now - freshness) / 3600000 : null
    sources.push({ provider, state: !data ? 'no_data' : data.status === 'failed' ? 'error' : ageHours != null && ageHours > 48 ? 'stale' : 'fresh', freshnessAt: data?.freshness_at || null, ageHours, safeErrorCode: data?.safe_error_code || null })
  }
  const { data: orders } = await admin.from('commerce_orders_ingested').select('ingested_at').eq('tenant_id', target.tenantId).eq('workspace_id', target.workspaceId).order('ingested_at', { ascending: false }).limit(1).maybeSingle()
  sources.push({ provider: 'commerce', state: orders ? 'fresh' : 'no_data', freshnessAt: orders?.ingested_at || null })
  return { target, sources }
}

function coreIds(target: any) {
  return target.tenantSlug === 'neejee' ? { tenantId: 'tenant_neejee', brandId: 'brand_neejee', workspaceId: 'workspace_neejee' } : { tenantId: 'tenant_oye_internal', brandId: 'brand_oye_imagine', workspaceId: 'workspace_oye_internal' }
}

export async function guardedRecommendationTarget(access: ApiAccessContext, input: { workspaceId?: string; startDate: string; endDate: string }) {
  const target = await resolveOperationalTarget(access, input.workspaceId)
  const admin = createSupabaseAdminClient()
  const { data: facts, error } = await admin.from('growth_facts').select('provider,metrics').eq('tenant_id', target.tenantId).eq('workspace_id', target.workspaceId).gte('metric_date', input.startDate).lte('metric_date', input.endDate)
  if (error) throw new Error(`recommendation_fact_read_failed:${error.message}`)
  const ads = (facts || []).filter((fact: any) => fact.provider === 'google_ads')
  const spend = ads.reduce((sum: number, fact: any) => sum + Number(fact.metrics?.cost || 0), 0)
  const conversionValue = ads.reduce((sum: number, fact: any) => sum + Number(fact.metrics?.conversionValue || 0), 0)
  const { data: orders } = await admin.from('commerce_orders_ingested').select('net_revenue').eq('tenant_id', target.tenantId).eq('workspace_id', target.workspaceId).gte('order_timestamp', `${input.startDate}T00:00:00Z`).lte('order_timestamp', `${input.endDate}T23:59:59Z`)
  const revenue = Math.max(conversionValue, (orders || []).reduce((sum: number, order: any) => sum + Number(order.net_revenue || 0), 0))
  const roas = spend > 0 ? revenue / spend : null
  let recommendation = 'Hold budget until additional evidence is available.'
  let priority = 'medium'
  if (roas != null && roas >= 4) recommendation = 'Consider a controlled budget increase of up to 10% after human approval and provider/balance checks.'
  else if (roas != null && roas < 1.5) {
    recommendation = 'Reduce or pause underperforming spend after campaign-level diagnosis and human approval.'
    priority = 'high'
  } else if (roas != null) recommendation = 'Hold budget and test creative/query improvements before changing spend.'
  const ids = coreIds(target)
  const recommendationId = `opt_${crypto.randomUUID()}`
  await admin.from('optimization_recommendations').insert({ optimization_recommendation_id: recommendationId, tenant_id: ids.tenantId, brand_id: ids.brandId, workspace_id: ids.workspaceId, channel: 'google_ads', priority, recommendation_type: 'budget_guardrail', rationale: `Observed spend ${spend.toFixed(2)}; observed revenue ${revenue.toFixed(2)}; ROAS ${roas == null ? 'n/a' : roas.toFixed(2)}.`, expected_impact: 'Requires human approval; no provider mutation is performed by this recommendation.', owner: 'growth_operator', status: 'open' })
  return { target, recommendationId, spend, observedRevenue: revenue, roas, recommendation, approvalRequired: true, providerMutationPerformed: false }
}
