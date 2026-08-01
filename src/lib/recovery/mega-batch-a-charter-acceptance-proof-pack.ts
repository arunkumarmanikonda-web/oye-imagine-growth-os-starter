export type ProofLane = 'functional' | 'visible' | 'data' | 'governance'
export type ProofStatus = 'covered' | 'partial' | 'missing'

export type SubBatchProofCoverage = {
  subBatchId: string
  title: string
  proofCoverage: Record<ProofLane, ProofStatus>
}

export type AcceptanceLaneSummary = {
  lane: ProofLane
  coveredCount: number
  partialCount: number
  missingCount: number
  gateStatus: 'pass' | 'pending'
}

export type MegaBatchAAcceptanceProofPack = {
  coverages: SubBatchProofCoverage[]
  laneSummaries: AcceptanceLaneSummary[]
  charterGate: {
    isComplete: boolean
    unresolvedGaps: string[]
  }
}

const megaBatchACoverages: SubBatchProofCoverage[] = [
  {
    subBatchId: 'A1',
    title: 'Route-family separation foundation',
    proofCoverage: { functional: 'covered', visible: 'partial', data: 'partial', governance: 'partial' }
  },
  {
    subBatchId: 'A2',
    title: 'Premium public experience foundation',
    proofCoverage: { functional: 'covered', visible: 'partial', data: 'partial', governance: 'partial' }
  },
  {
    subBatchId: 'A3',
    title: 'Separate client and admin login foundation',
    proofCoverage: { functional: 'covered', visible: 'partial', data: 'partial', governance: 'partial' }
  },
  {
    subBatchId: 'A4',
    title: 'Session auth foundation',
    proofCoverage: { functional: 'covered', visible: 'missing', data: 'partial', governance: 'partial' }
  },
  {
    subBatchId: 'A5',
    title: 'Workspace truth closure foundation',
    proofCoverage: { functional: 'covered', visible: 'missing', data: 'covered', governance: 'partial' }
  },
  {
    subBatchId: 'A6',
    title: 'Neejee canonical truth closure foundation',
    proofCoverage: { functional: 'covered', visible: 'missing', data: 'covered', governance: 'partial' }
  },
  {
    subBatchId: 'A7',
    title: 'Legal identity trust-surface foundation',
    proofCoverage: { functional: 'covered', visible: 'partial', data: 'covered', governance: 'partial' }
  },
  {
    subBatchId: 'A8',
    title: 'CMS controller closure foundation',
    proofCoverage: { functional: 'covered', visible: 'missing', data: 'covered', governance: 'partial' }
  },
  {
    subBatchId: 'A9',
    title: 'Publishing system closure foundation',
    proofCoverage: { functional: 'covered', visible: 'missing', data: 'covered', governance: 'partial' }
  },
  {
    subBatchId: 'A10',
    title: 'Admin studio closure foundation',
    proofCoverage: { functional: 'covered', visible: 'missing', data: 'covered', governance: 'partial' }
  },
  {
    subBatchId: 'A11',
    title: 'AI assistance closure foundation',
    proofCoverage: { functional: 'covered', visible: 'missing', data: 'covered', governance: 'partial' }
  },
  {
    subBatchId: 'A12',
    title: 'Config plane closure foundation',
    proofCoverage: { functional: 'covered', visible: 'missing', data: 'covered', governance: 'partial' }
  },
  {
    subBatchId: 'A13',
    title: 'Support contact closure foundation',
    proofCoverage: { functional: 'covered', visible: 'partial', data: 'covered', governance: 'partial' }
  },
  {
    subBatchId: 'A14',
    title: 'Anti prototype sweep closure foundation',
    proofCoverage: { functional: 'covered', visible: 'partial', data: 'covered', governance: 'covered' }
  },
  {
    subBatchId: 'A15',
    title: 'Charter acceptance proof-pack foundation',
    proofCoverage: { functional: 'covered', visible: 'partial', data: 'covered', governance: 'covered' }
  }
]

function cloneCoverage(coverage: SubBatchProofCoverage): SubBatchProofCoverage {
  return {
    ...coverage,
    proofCoverage: { ...coverage.proofCoverage }
  }
}

export function getMegaBatchAAcceptanceRegistry() {
  return megaBatchACoverages.map(cloneCoverage)
}

export function summarizeAcceptanceLane(lane: ProofLane): AcceptanceLaneSummary {
  const coverages = getMegaBatchAAcceptanceRegistry()
  const statuses = coverages.map((coverage) => coverage.proofCoverage[lane])

  const coveredCount = statuses.filter((status) => status === 'covered').length
  const partialCount = statuses.filter((status) => status === 'partial').length
  const missingCount = statuses.filter((status) => status === 'missing').length

  return {
    lane,
    coveredCount,
    partialCount,
    missingCount,
    gateStatus: missingCount === 0 && partialCount === 0 ? 'pass' : 'pending'
  }
}

export function buildMegaBatchAAcceptanceProofPack(): MegaBatchAAcceptanceProofPack {
  const coverages = getMegaBatchAAcceptanceRegistry()
  const laneSummaries: AcceptanceLaneSummary[] = [
    summarizeAcceptanceLane('functional'),
    summarizeAcceptanceLane('visible'),
    summarizeAcceptanceLane('data'),
    summarizeAcceptanceLane('governance')
  ]

  const unresolvedGaps = [
    'live visible shell separation not fully evidenced',
    'actual route/page adoption not fully evidenced',
    'runtime-backed cms/config/support ui flows not fully evidenced',
    'final charter signoff still pending'
  ]

  return {
    coverages,
    laneSummaries,
    charterGate: {
      isComplete: laneSummaries.every((summary) => summary.gateStatus === 'pass') && unresolvedGaps.length === 0,
      unresolvedGaps
    }
  }
}

export function getMegaBatchAAcceptanceAudit() {
  const proofPack = buildMegaBatchAAcceptanceProofPack()

  return {
    proofPack,
    proofScope: {
      functional: 'mega batch a proof-pack contract available',
      visible: 'pending full live-shell and copy adoption evidence',
      data: 'sub-batch proof coverage map fixed',
      governance: 'charter gate and unresolved gap ledger available'
    }
  }
}