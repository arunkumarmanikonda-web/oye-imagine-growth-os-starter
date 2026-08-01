import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import AdminCommercialOnboardingWorkspacePage from '../../src/app/admin/commercial/onboarding-workspace/page'

describe('admin commercial onboarding workspace page', () => {
  it('renders a ready commercial review state', async () => {
    const element = await AdminCommercialOnboardingWorkspacePage({
      searchParams: Promise.resolve({
        tenantId: 'tenant_neejee',
        intakeId: 'intake_neejee_1',
        companyName: 'Neejee',
        legalName: 'Neejee Retail Private Limited',
        websiteUrl: 'neejee.com',
        industry: 'Jewellery',
        country: ['IN'],
        service: ['brand_strategy', 'seo', 'google_ads'],
        lane: ['growth_strategy', 'performance_marketing'],
        clientTradeName: 'Neejee',
        clientPrimaryContactName: 'Commercial Lead',
        clientPrimaryContactEmail: 'finance@neejee.example',
        clientGstin: '29ABCDE1234F1Z5',
        businessEmail: 'finance@neejee.example',
        domainVerified: 'true',
        businessEmailVerified: 'true',
        authorizedRepresentativeName: 'Commercial Lead',
        authorizedRepresentativeEmail: 'finance@neejee.example',
        authorizedRepresentativeVerified: 'true',
        billingIdentityConfirmed: 'true',
        billingModel: 'monthly_retainer',
        baseFeeInr: '125000',
        paymentTerm: 'net_15',
        contractSigned: 'true',
        esignProviderReady: 'true',
        subscriptionActive: 'true',
        invoiceProfileReady: 'true',
        paymentMethodReady: 'true',
        approvalPolicyReady: 'true',
        strategyGenerated: 'true',
        strategyApproved: 'true',
        invoiceStatus: 'paid',
        approvalOpenCount: '0',
        auditCoverage: '0.9',
        mediaBalanceAmount: '50000',
        currency: 'INR',
      }),
    })

    const html = renderToStaticMarkup(element)

    expect(html).toContain('Mega Batch B1')
    expect(html).toContain('Neejee')
    expect(html).toContain('Commercial review ready')
    expect(html).toContain('KYC verified')
    expect(html).toContain('Activation ready')
    expect(html).toContain('Continuity ready')
    expect(html).toContain('KYC verification')
    expect(html).toContain('Client GSTIN')
    expect(html).toContain('29ABCDE1234F1Z5')
    expect(html).toContain('None')
  })

  it('renders missing fields and blockers for a blocked workspace', async () => {
    const element = await AdminCommercialOnboardingWorkspacePage({
      searchParams: Promise.resolve({
        tenantId: 'tenant_neejee',
        intakeId: 'intake_neejee_2',
        companyName: 'Neejee',
        websiteUrl: 'neejee.com',
        industry: 'Jewellery',
        lane: ['growth_strategy'],
        billingModel: 'monthly_retainer',
        paymentTerm: 'net_15',
        approvalOpenCount: '2',
        auditCoverage: '0.4',
        currency: 'INR',
      }),
    })

    const html = renderToStaticMarkup(element)

    expect(html).toContain('Commercial review blocked')
    expect(html).toContain('KYC pending')
    expect(html).toContain('Continuity blocked')
    expect(html).toContain('Missing fields')
    expect(html).toContain('Client GSTIN')
    expect(html).toContain('legalName')
    expect(html).toContain('clientGstin')
    expect(html).toContain('billing identity')
    expect(html).toContain('Onboarding information is incomplete')
  })
})
