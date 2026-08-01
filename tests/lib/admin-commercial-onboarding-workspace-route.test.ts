import { describe, expect, it } from 'vitest'
import { GET } from '../../src/app/api/admin/commercial/onboarding-workspace/route'

describe('admin commercial onboarding workspace route', () => {
  it('returns a ready workspace when onboarding, KYC, and commercial controls are complete', async () => {
    const request = new Request(
      'http://localhost/api/admin/commercial/onboarding-workspace?' +
        [
          'tenantId=tenant_neejee',
          'intakeId=intake_neejee_1',
          'companyName=Neejee',
          'legalName=Neejee%20Retail%20Private%20Limited',
          'websiteUrl=neejee.com',
          'industry=Jewellery',
          'country=IN',
          'service=brand_strategy',
          'service=seo',
          'service=google_ads',
          'lane=growth_strategy',
          'lane=performance_marketing',
          'clientTradeName=Neejee',
          'clientPrimaryContactName=Commercial%20Lead',
          'clientPrimaryContactEmail=finance%40neejee.example',
          'clientGstin=29ABCDE1234F1Z5',
          'businessEmail=finance%40neejee.example',
          'domainVerified=true',
          'businessEmailVerified=true',
          'authorizedRepresentativeName=Commercial%20Lead',
          'authorizedRepresentativeEmail=finance%40neejee.example',
          'authorizedRepresentativeVerified=true',
          'billingIdentityConfirmed=true',
          'billingModel=monthly_retainer',
          'baseFeeInr=125000',
          'paymentTerm=net_15',
          'contractSigned=true',
          'esignProviderReady=true',
          'subscriptionActive=true',
          'invoiceProfileReady=true',
          'paymentMethodReady=true',
          'approvalPolicyReady=true',
          'strategyGenerated=true',
          'strategyApproved=true',
          'invoiceStatus=paid',
          'approvalOpenCount=0',
          'auditCoverage=0.9',
          'mediaBalanceAmount=50000',
          'currency=INR',
        ].join('&'),
    )

    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.workspace.kycVerification.status).toBe('verified')
    expect(body.workspace.agreementBlueprint.clientProfile.gstin).toBe('29ABCDE1234F1Z5')
    expect(body.workspace.readyForCommercialReview).toBe(true)
    expect(body.derived.commercialReviewStatus).toBe('ready')
    expect(body.derived.activationStatus).toBe('ready')
    expect(body.derived.continuityReady).toBe(true)
    expect(body.derived.kycStatus).toBe('verified')
    expect(body.derived.kycMissingChecks).toEqual([])
    expect(body.derived.agreementClientGstin).toBe('29ABCDE1234F1Z5')
    expect(body.derived.agreementClientGstinReady).toBe(true)
    expect(body.derived.missingOnboardingFields).toEqual([])
  })

  it('returns blockers when onboarding or KYC controls are incomplete', async () => {
    const request = new Request(
      'http://localhost/api/admin/commercial/onboarding-workspace?' +
        [
          'tenantId=tenant_neejee',
          'intakeId=intake_neejee_2',
          'companyName=Neejee',
          'websiteUrl=neejee.com',
          'industry=Jewellery',
          'lane=growth_strategy',
          'billingModel=monthly_retainer',
          'paymentTerm=net_15',
          'approvalOpenCount=2',
          'auditCoverage=0.4',
          'currency=INR',
        ].join('&'),
    )

    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.workspace.readyForCommercialReview).toBe(false)
    expect(body.workspace.kycVerification.status).toBe('pending')
    expect(body.workspace.agreementBlueprint.clientProfile.gstin).toBe('pending_client_tax_profile')
    expect(body.derived.commercialReviewStatus).toBe('blocked')
    expect(body.derived.activationStatus).toBe('blocked')
    expect(body.derived.continuityReady).toBe(false)
    expect(body.derived.missingOnboardingFields).toContain('legalName')
    expect(body.derived.kycStatus).toBe('pending')
    expect(body.derived.kycMissingChecks).toContain('clientGstin')
    expect(body.derived.kycMissingChecks).toContain('billing identity')
    expect(body.derived.agreementClientGstin).toBe('pending_client_tax_profile')
    expect(body.derived.agreementClientGstinReady).toBe(false)
    expect(body.derived.continuityBlockers).toContain('Onboarding information is incomplete')
  })
})
