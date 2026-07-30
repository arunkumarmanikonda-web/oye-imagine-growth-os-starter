import {describe,it,expect} from 'vitest'
import {answerConciergeQuery,buildConciergeWorkspaceSnapshot} from '@/lib/ai/concierge-retrieval'
import {buildDemoClientConciergeScope} from '@/lib/ai/concierge-retrieval-registry'

describe('foundation-concierge-retrieval-engine',()=>{
  it('returns finance and reporting artifacts with citations and shortcuts',()=>{
    const scope=buildDemoClientConciergeScope()
    const answer=answerConciergeQuery(scope,'where is my overdue invoice, ledger balance and report','client_dashboard')
    expect(answer.permissionScoped).toBe(true)
    expect(answer.resultCount).toBeGreaterThan(1)
    expect(answer.results.some(r=>r.id==='invoice-july')).toBe(true)
    expect(answer.results.some(r=>r.id==='report-july'||r.id==='ledger-july')).toBe(true)
    expect(answer.citations.length).toBeGreaterThan(0)
    expect(answer.shortcuts.length).toBeGreaterThan(0)
    const snap=buildConciergeWorkspaceSnapshot(scope,'client_dashboard')
    expect(snap.overdueInvoices).toBeGreaterThan(0)
  })
})