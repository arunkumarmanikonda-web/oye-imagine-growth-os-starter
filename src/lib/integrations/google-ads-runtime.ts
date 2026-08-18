import { resolveRuntimeProviderFields } from '@/lib/config-control/runtime-provider-config'

export async function googleAdsRuntimeConfig() {
  const resolution = await resolveRuntimeProviderFields({
    providerKey: 'google_oauth',
    fieldKeys: ['GOOGLE_ADS_DEVELOPER_TOKEN', 'GOOGLE_ADS_LOGIN_CUSTOMER_ID', 'GOOGLE_ADS_API_VERSION'],
  })
  const developerToken = resolution.values.GOOGLE_ADS_DEVELOPER_TOKEN?.trim()
  if (!developerToken) throw new Error('google_ads_developer_token_not_configured')
  return {
    developerToken,
    loginCustomerId: resolution.values.GOOGLE_ADS_LOGIN_CUSTOMER_ID?.replace(/\D/g, '') || null,
    apiVersion: resolution.values.GOOGLE_ADS_API_VERSION?.trim() || 'v25',
    sources: resolution.sources,
  }
}
