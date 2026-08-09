import { describe, expect, it } from 'vitest'
import {
  buildGroundedExecutionSummary,
  evaluateGroundedOrchestration,
  type GroundingSource,
  type OrchestrationAgent,
  type OrchestrationRequest,
} from '../../src/lib/ai/multi-agent-orchestration-grounding'

describe('multi-agent orchestration and grounding', () => {
  const agents: OrchestrationAgent[] = [
    {
      id: 'retrieval-agent',
      label: 'Retrieval Agent',
      capabilities: ['retrieve', 'ground'],
      permittedRoles: ['admin', 'operator', 'client'],
    },
    {
      id: 'planner-agent',
      label: 'Planner Agent',
      capabilities: ['plan', 'route'],
      permittedRoles: ['admin', 'operator'],
    },
    {
      id: 'action-agent',
      label: 'Action Agent',
      capabilities: ['act'],
      permittedRoles: ['admin'],
    },
  ]

  const sources: GroundingSource[] = [
    {
      id: 'record-1',
      kind: 'record',
      label: 'Governed Record',
      trustScore: 0.98,
      freshnessMinutes: 15,
      permittedRoles: ['admin', 'operator'],
    },
    {
      id: 'policy-1',
      kind: 'policy',
      label: 'Execution Policy',
      trustScore: 0.99,
      freshnessMinutes: 20,
      permittedRoles: ['admin', 'operator', 'client'],
    },
    {
      id: 'doc-1',
      kind: 'document',
      label: 'Client Brief',
      trustScore: 0.92,
      freshnessMinutes: 30,
      permittedRoles: ['admin', 'operator', 'client'],
    },
  ]

  it('permits grounded orchestration when capabilities and sources are available', () => {
    const request: OrchestrationRequest = {
      objective: 'Coordinate grounded response',
      actorRole: 'operator',
      requiredCapabilities: ['retrieve', 'plan'],
      sourceIds: ['record-1', 'policy-1'],
    }

    const decision = evaluateGroundedOrchestration(request, agents, sources)

    expect(decision.allowed).toBe(true)
    expect(decision.assignedAgents).toHaveLength(2)
    expect(decision.missingCapabilities).toEqual([])
    expect(decision.inaccessibleSourceIds).toEqual([])
    expect(decision.staleSourceIds).toEqual([])
  })

  it('blocks orchestration when role cannot access a required source', () => {
    const request: OrchestrationRequest = {
      objective: 'Client tries restricted grounded action',
      actorRole: 'client',
      requiredCapabilities: ['retrieve'],
      sourceIds: ['record-1', 'policy-1'],
    }

    const decision = evaluateGroundedOrchestration(request, agents, sources)

    expect(decision.allowed).toBe(false)
    expect(decision.inaccessibleSourceIds).toEqual(['record-1'])
  })

  it('blocks orchestration when a required capability is missing', () => {
    const request: OrchestrationRequest = {
      objective: 'Need unsupported synthesis stage',
      actorRole: 'operator',
      requiredCapabilities: ['retrieve', 'synthesize'],
      sourceIds: ['policy-1'],
    }

    const decision = evaluateGroundedOrchestration(request, agents, sources)

    expect(decision.allowed).toBe(false)
    expect(decision.missingCapabilities).toContain('synthesize')
  })

  it('blocks orchestration when grounding evidence is stale', () => {
    const staleSources: GroundingSource[] = [
      {
        id: 'record-1',
        kind: 'record',
        label: 'Governed Record',
        trustScore: 0.98,
        freshnessMinutes: 900,
        permittedRoles: ['admin', 'operator'],
      },
    ]

    const request: OrchestrationRequest = {
      objective: 'Ground response from stale evidence',
      actorRole: 'operator',
      requiredCapabilities: ['retrieve'],
      sourceIds: ['record-1'],
    }

    const decision = evaluateGroundedOrchestration(
      request,
      agents,
      staleSources,
      240,
    )

    expect(decision.allowed).toBe(false)
    expect(decision.staleSourceIds).toEqual(['record-1'])
  })

  it('builds a readable ready summary for allowed orchestration', () => {
    const request: OrchestrationRequest = {
      objective: 'Coordinate grounded response',
      actorRole: 'operator',
      requiredCapabilities: ['retrieve', 'plan'],
      sourceIds: ['record-1', 'policy-1'],
    }

    const decision = evaluateGroundedOrchestration(request, agents, sources)
    const summary = buildGroundedExecutionSummary(decision)

    expect(summary).toContain('Grounded orchestration ready')
    expect(summary).toContain('retrieval-agent')
    expect(summary).toContain('planner-agent')
  })
})
