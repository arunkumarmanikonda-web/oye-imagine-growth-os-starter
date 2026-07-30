import { describe, expect, it } from 'vitest'
import {
  getLegalIdentitySummary,
  getOrganizationProfile,
  getSupportChannels,
  getSupportMailboxSummary,
} from '@/lib/recovery/company-profile'

describe('foundation-recovery-company-profile', () => {
  it('exposes canonical legal identity for Oye !magine', () => {
    const legal = getLegalIdentitySummary()

    expect(legal.legalName).toBe('OYE IMAGINE PRIVATE LIMITED')
    expect(legal.cin).toBe('U47190UP2025PTC220916')
    expect(legal.pan).toBe('AAECO6856D')
    expect(legal.tan).toBe('MRTO02898A')
    expect(legal.gstin).toBe('09AAECO6856D1Z8')
  })

  it('exposes support contact identity and mailbox foundation', () => {
    const profile = getOrganizationProfile()
    const channels = getSupportChannels()
    const mailboxSummary = getSupportMailboxSummary()

    expect(profile.contactProfile.supportEmail).toBe('hello@oyeimagine.com')
    expect(profile.contactProfile.supportPhone).toBe('+91 8 988 988 988')
    expect(channels.some((channel) => channel.provider === 'Resend')).toBe(true)
    expect(mailboxSummary.totalMessages).toBeGreaterThan(0)
  })
})