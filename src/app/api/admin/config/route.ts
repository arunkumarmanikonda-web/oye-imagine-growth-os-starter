import { NextResponse } from 'next/server'
import {
  getLegalIdentitySummary,
  getOrganizationProfile,
  getSupportChannels,
  getSupportMailboxRecords,
  getSupportMailboxSummary,
} from '@/lib/recovery/company-profile'
import {
  getConfigCommandCenterCards,
  getProviderConfigProfiles,
  getProviderConfigSummary,
} from '@/lib/recovery/provider-config'
import { getNeejeeCanonicalProfile, getNeejeeTruthSignals } from '@/lib/recovery/neejee-canonical'

export async function GET() {
  return NextResponse.json({
    organizationProfile: getOrganizationProfile(),
    legalIdentitySummary: getLegalIdentitySummary(),
    supportChannels: getSupportChannels(),
    supportMailboxRecords: getSupportMailboxRecords(),
    supportMailboxSummary: getSupportMailboxSummary(),
    providerProfiles: getProviderConfigProfiles(),
    providerSummary: getProviderConfigSummary(),
    commandCenterCards: getConfigCommandCenterCards(),
    neejeeProfile: getNeejeeCanonicalProfile(),
    neejeeTruthSignals: getNeejeeTruthSignals(),
  })
}