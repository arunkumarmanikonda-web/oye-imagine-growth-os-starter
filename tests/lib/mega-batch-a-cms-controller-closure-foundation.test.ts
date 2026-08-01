import { describe, expect, it } from 'vitest'
import {
  buildCmsControllerState,
  getCanonicalCmsRegistry,
  getCmsContentForSurface,
  getCmsControllerAudit
} from '../../src/lib/recovery/cms-controller-closure-foundation'

describe('mega batch a cms controller closure foundation', () => {
  it('publishes a canonical cms registry for all three surfaces', () => {
    const registry = getCanonicalCmsRegistry()

    expect(Object.keys(registry)).toEqual(['public', 'client', 'operator'])
    expect(registry.public[0].key).toBe('homepage-hero')
    expect(registry.client[0].key).toBe('client-dashboard-intro')
    expect(registry.operator[0].key).toBe('operator-control-tower')
  })

  it('returns canonical content for a requested surface', () => {
    const clientContent = getCmsContentForSurface('client')

    expect(clientContent).toHaveLength(2)
    expect(clientContent.every((record) => record.surface === 'client')).toBe(true)
    expect(clientContent.map((record) => record.key)).toEqual([
      'client-dashboard-intro',
      'client-support-panel'
    ])
  })

  it('builds a public controller state without fallback records', () => {
    const state = buildCmsControllerState('public')

    expect(state.surface).toBe('public')
    expect(state.fallbackSources).toEqual([])
    expect(state.publishSummary).toEqual({
      publishedCount: 1,
      draftCount: 1,
      fallbackCount: 0
    })
  })

  it('builds client and operator controller states with public fallback awareness', () => {
    const clientState = buildCmsControllerState('client')
    const operatorState = buildCmsControllerState('operator')

    expect(clientState.fallbackSources).toEqual(['homepage-hero', 'homepage-proof'])
    expect(operatorState.fallbackSources).toEqual(['homepage-hero', 'homepage-proof'])
    expect(clientState.publishSummary.fallbackCount).toBe(2)
    expect(operatorState.publishSummary.fallbackCount).toBe(2)
  })

  it('preserves canonical publish states for native records and marks fallbacks explicitly', () => {
    const clientState = buildCmsControllerState('client')
    const nativeRecord = clientState.resolvedContent.find((record) => record.key === 'client-dashboard-intro')
    const fallbackRecord = clientState.resolvedContent.find((record) => record.key === 'homepage-hero')

    expect(nativeRecord?.publishState).toBe('published')
    expect(fallbackRecord?.publishState).toBe('fallback')
    expect(fallbackRecord?.surface).toBe('client')
  })

  it('publishes an audit contract aligned to current proof gaps', () => {
    const audit = getCmsControllerAudit()

    expect(audit.states.public.publishSummary).toEqual({
      publishedCount: 1,
      draftCount: 1,
      fallbackCount: 0
    })
    expect(audit.proofScope).toEqual({
      functional: 'surface-aware cms controller contract available',
      visible: 'pending actual UI adoption',
      data: 'canonical content keys and publication states fixed',
      governance: 'fallback and publication rules available'
    })
  })
})