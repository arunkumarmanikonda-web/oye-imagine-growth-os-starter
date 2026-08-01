import {describe,it,expect} from 'vitest'
import {answerConciergeQuery} from '@/lib/ai/concierge-retrieval'
import {buildDemoAdminConciergeScope,buildDemoClientConciergeScope,buildDemoMarketplaceConciergeScope} from '@/lib/ai/concierge-retrieval-registry'

describe('foundation-concierge-permission-scope',()=>{
  it('blocks client access to admin/internal artifacts',()=>{
    const answer=answerConciergeQuery(buildDemoClientConciergeScope(),'margin health and secret config','help_panel')
    expect(answer.resultCount).toBe(0)
    expect(answer.deniedCount).toBeGreaterThan(0)
  })
  it('blocks marketplace access to client invoices and agreements',()=>{
    const answer=answerConciergeQuery(buildDemoMarketplaceConciergeScope(),'invoice overdue active agreement','help_panel')
    expect(answer.results.some(r=>r.kind==='invoice'||r.kind==='agreement')).toBe(false)
  })
  it('allows admin internal visibility without cross-tenant leakage',()=>{
    const admin=answerConciergeQuery(buildDemoAdminConciergeScope(),'margin health and other tenant invoice','help_panel')
    expect(admin.results.some(r=>r.id==='admin-margins')).toBe(true)
    expect(admin.results.some(r=>r.id==='other-tenant-invoice')).toBe(false)
  })
})