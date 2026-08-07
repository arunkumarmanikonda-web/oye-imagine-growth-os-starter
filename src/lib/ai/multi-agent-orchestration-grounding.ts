export type GroundingSourceKind = 'record' | 'document' | 'metric' | 'event' | 'policy'

export interface GroundingSource {
  id: string
  kind: GroundingSourceKind
  label: string
  uri?: string
  freshnessMinutes?: number
  trustScore: number
  permittedRoles: string[]
}

export interface OrchestrationAgent {
  id: string
  label: string
  capabilities: string[]
  permittedRoles: string[]
}

export interface OrchestrationRequest {
  objective: string
  actorRole: string
  requiredCapabilities: string[]
  sourceIds: string[]
  maxAgents?: number
}

export interface OrchestrationAssignment {
  step: number
  agentId: string
  capability: string
  sourceIds: string[]
}

export interface GroundingDecision {
  allowed: boolean
  assignedAgents: OrchestrationAssignment[]
  missingCapabilities: string[]
  inaccessibleSourceIds: string[]
  staleSourceIds: string[]
  evidenceLabels: string[]
  rationale: string[]
}

export function filterSourcesForRole(
  sources: GroundingSource[],
  actorRole: string,
): GroundingSource[] {
  return sources.filter((source) => source.permittedRoles.includes(actorRole))
}

export function findInaccessibleSourceIds(
  requestedSourceIds: string[],
  sources: GroundingSource[],
  actorRole: string,
): string[] {
  const accessible = new Set(
    filterSourcesForRole(sources, actorRole).map((source) => source.id),
  )

  return requestedSourceIds.filter((id) => !accessible.has(id))
}

export function findStaleSourceIds(
  requestedSourceIds: string[],
  sources: GroundingSource[],
  freshnessThresholdMinutes: number,
): string[] {
  const requested = sources.filter((source) => requestedSourceIds.includes(source.id))

  return requested
    .filter(
      (source) =>
        typeof source.freshnessMinutes === 'number' &&
        source.freshnessMinutes > freshnessThresholdMinutes,
    )
    .map((source) => source.id)
}

export function buildAgentAssignments(
  request: OrchestrationRequest,
  agents: OrchestrationAgent[],
): {
  assignments: OrchestrationAssignment[]
  missingCapabilities: string[]
} {
  const assignments: OrchestrationAssignment[] = []
  const missingCapabilities: string[] = []
  const maxAgents = request.maxAgents ?? request.requiredCapabilities.length

  for (const capability of request.requiredCapabilities) {
    const agent = agents.find(
      (candidate) =>
        candidate.capabilities.includes(capability) &&
        candidate.permittedRoles.includes(request.actorRole) &&
        !assignments.some((assignment) => assignment.agentId === candidate.id),
    )

    if (!agent) {
      missingCapabilities.push(capability)
      continue
    }

    assignments.push({
      step: assignments.length + 1,
      agentId: agent.id,
      capability,
      sourceIds: request.sourceIds,
    })

    if (assignments.length >= maxAgents) {
      break
    }
  }

  const coveredCapabilities = new Set(
    assignments.map((assignment) => assignment.capability),
  )

  for (const capability of request.requiredCapabilities) {
    if (!coveredCapabilities.has(capability) && !missingCapabilities.includes(capability)) {
      missingCapabilities.push(capability)
    }
  }

  return { assignments, missingCapabilities }
}

export function evaluateGroundedOrchestration(
  request: OrchestrationRequest,
  agents: OrchestrationAgent[],
  sources: GroundingSource[],
  freshnessThresholdMinutes = 240,
): GroundingDecision {
  const inaccessibleSourceIds = findInaccessibleSourceIds(
    request.sourceIds,
    sources,
    request.actorRole,
  )

  const staleSourceIds =
    inaccessibleSourceIds.length === 0
      ? findStaleSourceIds(request.sourceIds, sources, freshnessThresholdMinutes)
      : []

  const { assignments, missingCapabilities } = buildAgentAssignments(request, agents)

  const evidenceLabels = sources
    .filter((source) => request.sourceIds.includes(source.id))
    .map((source) => source.label)

  const rationale: string[] = []

  if (assignments.length > 0) {
    rationale.push(
      `Assigned ${assignments.length} agent step(s) for objective: ${request.objective}.`,
    )
  }

  if (missingCapabilities.length > 0) {
    rationale.push(`Missing capabilities: ${missingCapabilities.join(', ')}.`)
  }

  if (inaccessibleSourceIds.length > 0) {
    rationale.push(`Blocked by inaccessible sources: ${inaccessibleSourceIds.join(', ')}.`)
  }

  if (staleSourceIds.length > 0) {
    rationale.push(`Blocked by stale sources: ${staleSourceIds.join(', ')}.`)
  }

  const allowed =
    assignments.length > 0 &&
    missingCapabilities.length === 0 &&
    inaccessibleSourceIds.length === 0 &&
    staleSourceIds.length === 0

  if (allowed) {
    rationale.push('Grounded multi-agent orchestration is permitted.')
  }

  return {
    allowed,
    assignedAgents: assignments,
    missingCapabilities,
    inaccessibleSourceIds,
    staleSourceIds,
    evidenceLabels,
    rationale,
  }
}

export function buildGroundedExecutionSummary(
  decision: GroundingDecision,
): string {
  if (!decision.allowed) {
    return [
      'Grounded orchestration blocked.',
      decision.missingCapabilities.length > 0
        ? `Missing capabilities: ${decision.missingCapabilities.join(', ')}.`
        : '',
      decision.inaccessibleSourceIds.length > 0
        ? `Inaccessible sources: ${decision.inaccessibleSourceIds.join(', ')}.`
        : '',
      decision.staleSourceIds.length > 0
        ? `Stale sources: ${decision.staleSourceIds.join(', ')}.`
        : '',
    ]
      .filter((value) => value.length > 0)
      .join(' ')
  }

  const agentSteps = decision.assignedAgents
    .map(
      (assignment) =>
        `step ${assignment.step} via ${assignment.agentId} (${assignment.capability})`,
    )
    .join('; ')

  return `Grounded orchestration ready with ${agentSteps}. Evidence: ${decision.evidenceLabels.join(', ')}.`
}
