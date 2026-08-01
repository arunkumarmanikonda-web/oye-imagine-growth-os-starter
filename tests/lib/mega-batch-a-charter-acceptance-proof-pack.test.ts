import { describe, expect, it } from 'vitest'
import {
  buildMegaBatchAAcceptanceProofPack,
  getMegaBatchAAcceptanceAudit,
  getMegaBatchAAcceptanceRegistry,
  summarizeAcceptanceLane
} from '../../src/lib/recovery/mega-batch-a-charter-acceptance-proof-pack'

describe('mega batch a charter acceptance proof pack foundation', () => {
  it('publishes a canonical coverage registry for A1 to A15', () => {
    const registry = getMegaBatchAAcceptanceRegistry()

    expect(registry).toHaveLength(15)
    expect(registry[0].subBatchId).toBe('A1')
    expect(registry[14].subBatchId).toBe('A15')
  })

  it('summarizes the functional lane as fully covered', () => {
    expect(summarizeAcceptanceLane('functional')).toEqual({
      lane: 'functional',
      coveredCount: 15,
      partialCount: 0,
      missingCount: 0,
      gateStatus: 'pass'
    })
  })

  it('summarizes the visible lane as still pending', () => {
    expect(summarizeAcceptanceLane('visible')).toEqual({
      lane: 'visible',
      coveredCount: 0,
      partialCount: 7,
      missingCount: 8,
      gateStatus: 'pending'
    })
  })

  it('summarizes the data lane as mostly covered with remaining partials', () => {
    expect(summarizeAcceptanceLane('data')).toEqual({
      lane: 'data',
      coveredCount: 11,
      partialCount: 4,
      missingCount: 0,
      gateStatus: 'pending'
    })
  })

  it('summarizes the governance lane as pending because partials remain', () => {
    expect(summarizeAcceptanceLane('governance')).toEqual({
      lane: 'governance',
      coveredCount: 2,
      partialCount: 13,
      missingCount: 0,
      gateStatus: 'pending'
    })
  })

  it('builds a proof pack with an unresolved charter gate', () => {
    const proofPack = buildMegaBatchAAcceptanceProofPack()

    expect(proofPack.laneSummaries).toHaveLength(4)
    expect(proofPack.charterGate.isComplete).toBe(false)
    expect(proofPack.charterGate.unresolvedGaps).toEqual([
      'live visible shell separation not fully evidenced',
      'actual route/page adoption not fully evidenced',
      'runtime-backed cms/config/support ui flows not fully evidenced',
      'final charter signoff still pending'
    ])
  })

  it('publishes an audit contract aligned to current proof gaps', () => {
    const audit = getMegaBatchAAcceptanceAudit()

    expect(audit.proofPack.charterGate.isComplete).toBe(false)
    expect(audit.proofScope).toEqual({
      functional: 'mega batch a proof-pack contract available',
      visible: 'pending full live-shell and copy adoption evidence',
      data: 'sub-batch proof coverage map fixed',
      governance: 'charter gate and unresolved gap ledger available'
    })
  })
})