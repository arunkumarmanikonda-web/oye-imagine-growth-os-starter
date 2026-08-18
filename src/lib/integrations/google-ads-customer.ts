import type { ApiAccessContext } from '@/lib/auth/api-access'
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

export async function readGoogleAdsCustomer(
  access: ApiAccessContext,
  input: { workspaceId?: string; customerId: string },
) {
  const target = await resolveOperationalTarget(access, input.workspaceId)
  const { accessToken } = await googleAccessToken(target.tenantId, target.workspaceId)
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN?.trim()
  if (!developerToken) throw new Error('google_ads_developer_token_not_configured')
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'developer-token': developerToken,
  }
  if (process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID) headers['login-customer-id'] = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID.replace(/-/g, '')
  const id = customer(input.customerId)
  const response = await fetch(`https://googleads.googleapis.com/${version()}/customers/${id}/googleAds:search`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query: 'SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.time_zone FROM customer LIMIT 1' }),
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
  }
}
