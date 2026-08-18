import type { ApiAccessContext } from '@/lib/auth/api-access'
import { googleAccessToken } from '@/lib/integrations/google'
import { googleAdsRuntimeConfig } from '@/lib/integrations/google-ads-runtime'
import { resolveOperationalTarget } from '@/lib/integrations/operational-target'

function customer(value: string) {
  const id = value.replace(/\D/g, '')
  if (!id) throw new Error('google_ads_customer_required')
  return id
}

export async function readGoogleAdsCustomer(
  access: ApiAccessContext,
  input: { workspaceId?: string; customerId: string },
) {
  const target = await resolveOperationalTarget(access, input.workspaceId)
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
  const id = customer(input.customerId)
  const response = await fetch(`https://googleads.googleapis.com/${config.apiVersion}/customers/${id}/googleAds:search`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: 'SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.time_zone, customer.status, customer.manager, customer.test_account FROM customer LIMIT 1',
    }),
  })
  const payload: any = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(`google_ads_customer_read_failed:${payload?.error?.status || response.status}`)
  const row = payload?.results?.[0]?.customer
  if (!row?.currencyCode) throw new Error('google_ads_customer_currency_missing')
  return {
    customerId: String(row.id || id),
    descriptiveName: String(row.descriptiveName || ''),
    currencyCode: String(row.currencyCode).toUpperCase(),
    timeZone: String(row.timeZone || ''),
    status: String(row.status || 'UNKNOWN').toUpperCase(),
    manager: row.manager === true,
    testAccount: row.testAccount === true,
  }
}