import { describe, expect, it } from 'vitest'

import { getMegaBatchAClosureAudit } from '../../src/lib/recovery/mega-batch-a-closure-audit'

describe('mega batch a closure audit', () => {
  it('proves canonical legal identity across the accepted public shell', () => {
    const audit = getMegaBatchAClosureAudit()

    expect(audit.legalIdentity.legalName).toBe('OYE IMAGINE PRIVATE LIMITED')
    expect(audit.legalIdentity.gstin).toBe('09AAECO6856D1Z8')
    expect(audit.legalIdentity.cin).toBe('U47190UP2025PTC220916')
  })

  it('proves the public shell removed prototype readiness residue', () => {
    const audit = getMegaBatchAClosureAudit()

    expect(audit.publicShell.navigationLabels).toEqual(['Home', 'Marketplace', 'Contact', 'Login'])
    expect(audit.publicShell.hasPrototypeResidue).toBe(false)
  })

  it('proves the access split is locked to client and operator entry points', () => {
    const audit = getMegaBatchAClosureAudit()

    expect(audit.accessSplit.loginPaths).toEqual(['/login/client', '/login/admin'])
    expect(audit.accessSplit.loginLabels).toEqual(['Client access', 'Admin workspace'])
  })

  it('proves the operator shell exposes the accepted dashboard and config contract', () => {
    const audit = getMegaBatchAClosureAudit()

    expect(audit.operatorShell.dashboardCardPaths).toEqual(['/admin/content', '/admin/config', '/login'])
    expect(audit.operatorShell.dashboardTrustLegalName).toBe('OYE IMAGINE PRIVATE LIMITED')
    expect(audit.operatorShell.contentStudioModuleCount).toBe(6)
    expect(audit.operatorShell.providerNames).toContain('Resend')
    expect(audit.operatorShell.supportChannelCount).toBe(3)
  })

  it('proves support and publishing governance snapshots are populated', () => {
    const audit = getMegaBatchAClosureAudit()

    expect(audit.supportGovernance.totalEvents).toBe(4)
    expect(audit.supportGovernance.openCount).toBe(3)
    expect(audit.supportGovernance.mailbox.email).toBe('hello@oyeimagine.com')

    expect(audit.publishingGovernance.totalWorkItems).toBe(6)
    expect(audit.publishingGovernance.previewReadyCount).toBe(6)
    expect(audit.publishingGovernance.rollbackReadyCount).toBe(6)
  })

  it('proves runtime governance protects the intended client and admin surfaces', () => {
    const audit = getMegaBatchAClosureAudit()

    expect(audit.runtimeGovernance.protectedPrefixes).toContain('/client')
    expect(audit.runtimeGovernance.protectedPrefixes).toContain('/admin')
    expect(audit.runtimeGovernance.protectedPrefixes).toContain('/admin/content')
    expect(audit.runtimeGovernance.protectedPrefixes).toContain('/admin/config')
    expect(audit.runtimeGovernance.protectedPrefixes).toContain('/admin/support')
    expect(audit.runtimeGovernance.protectedPrefixes).toContain('/admin/runtime')
    expect(audit.runtimeGovernance.publicEntryPoints).toContain('/login/client')
    expect(audit.runtimeGovernance.publicEntryPoints).toContain('/login/admin')
  })
})