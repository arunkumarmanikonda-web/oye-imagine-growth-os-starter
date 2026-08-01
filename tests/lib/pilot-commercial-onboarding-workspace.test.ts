import { describe, expect, it } from 'vitest'
import { buildCommercialOnboardingWorkspace } from '../../src/lib/pilot/commercial-onboarding-workspace'

describe('pilot commercial onboarding workspace', () => {
  it('builds a review-ready workspace when onboarding, KYC, and commercial inputs are complete', () => {
    const workspace = buildCommercialOnboardingWorkspace({
      intakeId: 'intake_neejee_1',
      tenantId: 'tenant_neejee',
      companyName: 'Neejee',
      legalName: 'Neejee Retail Private Limited',
      websiteUrl: 'neejee.com',
      industry: 'Jewellery',
      countriesServed: ['IN'],
      servicesRequested: ['brand_strategy', 'seo', 'google_ads'],
      clientTradeName: 'Neejee',
      clientPrimaryContactName: 'Commercial Lead',
      clientPrimaryContactEmail: 'finance@neejee.example',
      clientGstin: '29ABCDE1234F1Z5',
      businessEmail: 'finance@neejee.example',
      domainVerified: true,
      businessEmailVerified: true,
      authorizedRepresentativeName: 'Commercial Lead',
      authorizedRepresentativeEmail: 'finance@neejee.example',
      authorizedRepresentativeVerified: true,
      billingIdentityConfirmed: true,
      requestedLanes: ['growth_strategy', 'performance_marketing'],
      billingModel: 'monthly_retainer',
      baseFeeInr: 125000,
      paymentTerm: 'net_15',
      contractSigned: true,
      esignProviderReady: true,
      subscriptionActive: true,
      invoiceProfileReady: true,
      paymentMethodReady: true,
      approvalPolicyReady: true,
      strategyGenerated: true,
      strategyApproved: true,
      invoiceStatus: 'paid',
      approvalOpenCount: 0,
      auditCoverage: 0.9,
      mediaBalanceAmount: 50000,
      currency: 'INR',
    })

    expect(workspace.onboardingProgress.readyForReview).toBe(true)
    expect(workspace.kycVerification.status).toBe('verified')
    expect(workspace.readyForCommercialReview).toBe(true)
    expect(workspace.agreementBlueprint.status).toBe('intake_ready')
    expect(workspace.agreementBlueprint.clientProfile.gstin).toBe('29ABCDE1234F1Z5')
    expect(workspace.agreementBlueprint.requestedLanes).toEqual([
      'growth_strategy',
      'performance_marketing',
    ])
    expect(workspace.activationSummary.status).toBe('ready')
    expect(workspace.continuitySummary.readyForActivation).toBe(true)
  })

  it('keeps the workspace blocked when onboarding or KYC controls are incomplete', () => {
    const workspace = buildCommercialOnboardingWorkspace({
      intakeId: 'intake_neejee_2',
      tenantId: 'tenant_neejee',
      companyName: 'Neejee',
      websiteUrl: 'neejee.com',
      industry: 'Jewellery',
      countriesServed: [],
      servicesRequested: [],
      requestedLanes: ['growth_strategy'],
      billingModel: 'monthly_retainer',
      paymentTerm: 'net_15',
      contractSigned: false,
      esignProviderReady: false,
      subscriptionActive: false,
      paymentMethodReady: false,
      approvalPolicyReady: false,
      strategyGenerated: false,
      strategyApproved: false,
      invoiceStatus: 'not_issued',
      approvalOpenCount: 2,
      auditCoverage: 0.4,
      mediaBalanceAmount: 0,
      currency: 'INR',
    })

    expect(workspace.onboardingProgress.readyForReview).toBe(false)
    expect(workspace.onboardingProgress.missingFields).toContain('legalName')
    expect(workspace.kycVerification.status).toBe('pending')
    expect(workspace.kycVerification.missingChecks).toContain('clientGstin')
    expect(workspace.kycVerification.missingChecks).toContain('billing identity')
    expect(workspace.agreementBlueprint.clientProfile.gstin).toBe('pending_client_tax_profile')
    expect(workspace.activationSummary.status).toBe('blocked')
    expect(workspace.continuitySummary.readyForActivation).toBe(false)
    expect(workspace.continuitySummary.blockers).toContain('Onboarding information is incomplete')
  })
})
