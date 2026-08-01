import { describe, expect, it } from 'vitest'
import {
  buildSweepState,
  detectForbiddenReadinessPhrases,
  getAntiPrototypeSweepAudit,
  getAntiPrototypeSweepRegistry,
  getForbiddenReadinessPhrases,
  inspectSweepCandidate,
  sanitizePrototypeLanguage
} from '../../src/lib/recovery/anti-prototype-sweep-closure-foundation'

describe('mega batch a anti prototype sweep closure foundation', () => {
  it('publishes a canonical forbidden phrase registry', () => {
    expect(getForbiddenReadinessPhrases()).toEqual([
      'prototype',
      'beta',
      'coming soon',
      'under construction',
      'fake readiness',
      'demo only'
    ])
  })

  it('publishes a canonical sweep registry for all three surfaces', () => {
    const registry = getAntiPrototypeSweepRegistry()

    expect(Object.keys(registry)).toEqual(['public', 'client', 'operator'])
    expect(registry.public).toHaveLength(2)
    expect(registry.client).toHaveLength(2)
    expect(registry.operator).toHaveLength(2)
  })

  it('detects forbidden readiness language in arbitrary text', () => {
    expect(
      detectForbiddenReadinessPhrases('Prototype launch in beta and coming soon.')
    ).toEqual(['prototype', 'beta', 'coming soon'])
  })

  it('sanitizes forbidden readiness language with governed replacements', () => {
    const sanitized = sanitizePrototypeLanguage('Coming soon prototype demo only.')

    expect(sanitized.toLowerCase()).not.toContain('coming soon')
    expect(sanitized.toLowerCase()).not.toContain('prototype')
    expect(sanitized.toLowerCase()).not.toContain('demo only')
    expect(sanitized).toContain('planned rollout')
    expect(sanitized).toContain('foundation')
    expect(sanitized).toContain('governed preview')
  })

  it('inspects candidates and marks flagged severity correctly', () => {
    const finding = inspectSweepCandidate({
      key: 'sample',
      surface: 'public',
      text: 'Beta prototype under construction'
    })

    expect(finding.severity).toBe('flagged')
    expect(finding.bannedPhrases).toEqual(['prototype', 'beta', 'under construction'])
  })

  it('builds per-surface sweep states with clean and flagged counts', () => {
    expect(buildSweepState('public').summary).toEqual({
      candidateCount: 2,
      cleanCount: 1,
      flaggedCount: 1
    })

    expect(buildSweepState('client').summary).toEqual({
      candidateCount: 2,
      cleanCount: 1,
      flaggedCount: 1
    })

    expect(buildSweepState('operator').summary).toEqual({
      candidateCount: 2,
      cleanCount: 1,
      flaggedCount: 1
    })
  })

  it('publishes an audit contract aligned to current proof gaps', () => {
    const audit = getAntiPrototypeSweepAudit()

    expect(audit.states.public.summary.flaggedCount).toBe(1)
    expect(audit.states.client.summary.flaggedCount).toBe(1)
    expect(audit.states.operator.summary.flaggedCount).toBe(1)
    expect(audit.proofScope).toEqual({
      functional: 'anti prototype sweep contract available',
      visible: 'pending actual copy cleanup across live surfaces',
      data: 'forbidden phrase registry and sweep candidates fixed',
      governance: 'remediation and severity rules available'
    })
  })
})