export type SweepSurface = 'public' | 'client' | 'operator'
export type SweepSeverity = 'clean' | 'flagged'

export type SweepCandidate = {
  key: string
  surface: SweepSurface
  text: string
}

export type SweepFinding = {
  key: string
  surface: SweepSurface
  bannedPhrases: string[]
  severity: SweepSeverity
  sanitizedText: string
}

export type SweepState = {
  surface: SweepSurface
  findings: SweepFinding[]
  summary: {
    candidateCount: number
    cleanCount: number
    flaggedCount: number
  }
}

const forbiddenPhrases = [
  'prototype',
  'beta',
  'coming soon',
  'under construction',
  'fake readiness',
  'demo only'
] as const

const remediationMap: Record<(typeof forbiddenPhrases)[number], string> = {
  'prototype': 'foundation',
  'beta': 'controlled',
  'coming soon': 'planned rollout',
  'under construction': 'in rollout',
  'fake readiness': 'governed readiness',
  'demo only': 'governed preview'
}

const canonicalSweepRegistry: Record<SweepSurface, SweepCandidate[]> = {
  public: [
    {
      key: 'public-home-hero',
      surface: 'public',
      text: 'Oye !magine growth operating system for governed execution.'
    },
    {
      key: 'public-proof-strip',
      surface: 'public',
      text: 'Coming soon prototype proof strip for demo only.'
    }
  ],
  client: [
    {
      key: 'client-workspace-banner',
      surface: 'client',
      text: 'Client workspace status and support guidance.'
    },
    {
      key: 'client-guided-help',
      surface: 'client',
      text: 'Beta guided help for client approvals.'
    }
  ],
  operator: [
    {
      key: 'operator-control-header',
      surface: 'operator',
      text: 'Operator governance console and queue oversight.'
    },
    {
      key: 'operator-admin-panel',
      surface: 'operator',
      text: 'Admin panel under construction for governed actions.'
    }
  ]
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function getForbiddenReadinessPhrases() {
  return [...forbiddenPhrases]
}

export function detectForbiddenReadinessPhrases(text: string) {
  const lowered = text.toLowerCase()
  return forbiddenPhrases.filter((phrase) => lowered.includes(phrase))
}

export function sanitizePrototypeLanguage(text: string) {
  return forbiddenPhrases.reduce((result, phrase) => {
    const pattern = new RegExp(escapeRegExp(phrase), 'gi')
    return result.replace(pattern, remediationMap[phrase])
  }, text)
}

export function getAntiPrototypeSweepRegistry() {
  return {
    public: canonicalSweepRegistry.public.map((candidate) => ({ ...candidate })),
    client: canonicalSweepRegistry.client.map((candidate) => ({ ...candidate })),
    operator: canonicalSweepRegistry.operator.map((candidate) => ({ ...candidate }))
  }
}

export function inspectSweepCandidate(candidate: SweepCandidate): SweepFinding {
  const bannedPhrases = detectForbiddenReadinessPhrases(candidate.text)

  return {
    key: candidate.key,
    surface: candidate.surface,
    bannedPhrases,
    severity: bannedPhrases.length > 0 ? 'flagged' : 'clean',
    sanitizedText: sanitizePrototypeLanguage(candidate.text)
  }
}

export function buildSweepState(surface: SweepSurface): SweepState {
  const findings = canonicalSweepRegistry[surface].map(inspectSweepCandidate)

  return {
    surface,
    findings,
    summary: {
      candidateCount: findings.length,
      cleanCount: findings.filter((finding) => finding.severity === 'clean').length,
      flaggedCount: findings.filter((finding) => finding.severity === 'flagged').length
    }
  }
}

export function getAntiPrototypeSweepAudit() {
  return {
    forbiddenPhrases: getForbiddenReadinessPhrases(),
    registry: getAntiPrototypeSweepRegistry(),
    states: {
      public: buildSweepState('public'),
      client: buildSweepState('client'),
      operator: buildSweepState('operator')
    },
    proofScope: {
      functional: 'anti prototype sweep contract available',
      visible: 'pending actual copy cleanup across live surfaces',
      data: 'forbidden phrase registry and sweep candidates fixed',
      governance: 'remediation and severity rules available'
    }
  }
}