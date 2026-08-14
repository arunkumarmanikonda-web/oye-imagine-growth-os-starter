import { beforeEach, describe, expect, it } from 'vitest'
import {
  containsNeejeeDomainContamination,
  neejeeBrandTruth,
} from '@/lib/admin/neejee-brand-truth'
import { createDefaultPilotFixture } from '@/lib/admin/pilot-fixtures'
import { resetPilotStore } from '@/lib/admin/pilot-store'
import { generateStrategyBrief } from '@/lib/admin/strategy-generator'
import { generateLandingPageBrief } from '@/lib/admin/landing-page-generator'
import { generateGoogleAdsDraft } from '@/lib/admin/google-ads-generator'
import { generateEmailSequenceDraft } from '@/lib/admin/email-sequence-generator'
import { generateSmsDraft } from '@/lib/admin/sms-generator'
import { generateWhatsappDraft } from '@/lib/admin/whatsapp-generator'
import { generateCampaignSummaryDraft } from '@/lib/admin/campaign-summary-generator'
import { generateExecutionPlanDraft } from '@/lib/admin/execution-plan-generator'
import { generateExecutionStatusDraft } from '@/lib/admin/execution-status-generator'

const forbiddenLegacyFunnelPhrases = [
  'neejee clinics',
  'founder-led b2b growth team',
  'qualified pipeline',
  'book more qualified conversations',
  'book consultation',
  'treatment options',
  'hair transplant',
  'skin clinic',
  'dermatology clinic',
  'high-intent leads',
  'tailored draft for your funnel',
]

const forbiddenPrematureExecutionPhrases = [
  'launch paid traffic',
  'turn on follow-up messaging',
  'enable whatsapp follow-up for warm leads',
  'enable sms reminder follow-up',
]

function text(value: unknown) {
  return JSON.stringify(value).toLowerCase()
}

function expectNoLegacyNeejeeDomain(value: unknown) {
  expect(containsNeejeeDomainContamination(value)).toBe(false)
  const serialized = text(value)
  for (const phrase of forbiddenLegacyFunnelPhrases) {
    expect(serialized).not.toContain(phrase)
  }
}

function generateCompleteNeejeeDraftChain() {
  resetPilotStore(createDefaultPilotFixture())
  const pilotId = 'neejee-pilot'
  const strategy = generateStrategyBrief(pilotId)
  const landing = generateLandingPageBrief({ pilotId, forceRegenerate: true })
  const googleAds = generateGoogleAdsDraft({ pilotId, forceRegenerate: true })
  const email = generateEmailSequenceDraft(pilotId)
  const sms = generateSmsDraft(pilotId)
  const whatsapp = generateWhatsappDraft(pilotId)
  const summary = generateCampaignSummaryDraft(pilotId)
  const executionPlan = generateExecutionPlanDraft(pilotId)
  const executionStatus = generateExecutionStatusDraft(pilotId)

  return {
    pilot: createDefaultPilotFixture(),
    strategy,
    landing,
    googleAds,
    email,
    sms,
    whatsapp,
    summary,
    executionPlan,
    executionStatus,
  }
}

describe('Neejee canonical domain truth regression', () => {
  beforeEach(() => {
    resetPilotStore(createDefaultPilotFixture())
  })

  it('defines Neejee as provenance-led consumer craft discovery and commerce', () => {
    expect(neejeeBrandTruth.identity.tagline).toBe('Found. Personal.')
    expect(neejeeBrandTruth.identity.website).toBe('https://www.neejee.com')
    expect(neejeeBrandTruth.business.model.toLowerCase()).toContain('discovery and commerce')
    expect(neejeeBrandTruth.business.categoryPositioning.toLowerCase()).toContain('textiles and sarees')
    expect(neejeeBrandTruth.business.categoryPositioning.toLowerCase()).toContain('jewellery and accessories')
    expect(neejeeBrandTruth.business.categoryPositioning.toLowerCase()).toContain('home and craft objects')
    expect(neejeeBrandTruth.experience.ai.map((item) => item.name)).toEqual([
      'Mirror',
      'Space',
      'Concierge',
    ])
    expect(neejeeBrandTruth.growth.primaryMetrics).toContain('Purchases')
    expect(neejeeBrandTruth.growth.primaryMetrics).toContain('Revenue')
    expect(neejeeBrandTruth.growth.primaryMetrics).toContain('ROAS')
  })

  it('keeps the complete default Neejee generation chain free of legacy healthcare and B2B funnel defaults', () => {
    const artifacts = generateCompleteNeejeeDraftChain()

    for (const [name, artifact] of Object.entries(artifacts)) {
      try {
        expectNoLegacyNeejeeDomain(artifact)
      } catch (error) {
        throw new Error(`Neejee domain regression detected in ${name}: ${String(error)}`)
      }
    }
  })

  it('keeps execution planning fail-closed instead of silently activating paid or direct-message channels', () => {
    const { googleAds, summary, executionPlan, executionStatus } =
      generateCompleteNeejeeDraftChain()
    const serialized = text({ googleAds, summary, executionPlan, executionStatus })

    for (const phrase of forbiddenPrematureExecutionPhrases) {
      expect(serialized).not.toContain(phrase)
    }

    expect(text(googleAds)).toContain('draft')
    expect(text(executionPlan)).toContain('provider')
    expect(text(executionPlan)).toContain('blocked')
    expect(text(executionStatus)).toContain('external activation gated')
  })

  it('keeps time-sensitive website claims out of immutable campaign defaults', () => {
    const { strategy, landing, googleAds, email, sms, whatsapp } =
      generateCompleteNeejeeDraftChain()
    const serialized = text({ strategy, landing, googleAds, email, sms, whatsapp })

    expect(serialized).not.toContain('free shipping above')
    expect(serialized).not.toContain('seven-day returns')
    expect(serialized).not.toContain('240 artisan')
    expect(serialized).not.toContain('paid in advance')
  })
})
