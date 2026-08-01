export type AiAudience = 'public' | 'client' | 'operator'
export type AiCapability = 'answer' | 'suggest' | 'summarize' | 'escalate'

export type AiAssistanceCard = {
  key: string
  audience: AiAudience
  title: string
  summary: string
  capabilities: AiCapability[]
  requiresHumanApproval: boolean
  explanation: string
}

export type AiAssistanceState = {
  audience: AiAudience
  cards: AiAssistanceCard[]
  summary: {
    cardCount: number
    approvalRequiredCount: number
    capabilityCount: number
  }
}

const canonicalAiRegistry: Record<AiAudience, AiAssistanceCard[]> = {
  public: [
    {
      key: 'public-brand-guide',
      audience: 'public',
      title: 'Public brand guide',
      summary: 'Explains Oye !magine positioning and public experience guidance.',
      capabilities: ['answer', 'summarize'],
      requiresHumanApproval: false,
      explanation: 'Public AI must explain brand, trust and experience without taking governed actions.'
    },
    {
      key: 'public-contact-routing',
      audience: 'public',
      title: 'Public contact routing',
      summary: 'Suggests the right next contact or support path.',
      capabilities: ['suggest', 'escalate'],
      requiresHumanApproval: true,
      explanation: 'Escalations that imply follow-up or human handling must stay approval-aware.'
    }
  ],
  client: [
    {
      key: 'client-workspace-guide',
      audience: 'client',
      title: 'Client workspace guide',
      summary: 'Explains workspace status, commercial context and support routes.',
      capabilities: ['answer', 'summarize'],
      requiresHumanApproval: false,
      explanation: 'Client AI should explain workspace truth and summarize governed context safely.'
    },
    {
      key: 'client-next-best-action',
      audience: 'client',
      title: 'Client next-best action',
      summary: 'Suggests next steps for approvals, uploads and requests.',
      capabilities: ['suggest', 'escalate'],
      requiresHumanApproval: true,
      explanation: 'Client-facing escalations or assisted actions require explicit approval gates.'
    }
  ],
  operator: [
    {
      key: 'operator-control-assist',
      audience: 'operator',
      title: 'Operator control assist',
      summary: 'Summarizes queues, explains governance state and recommends operator next steps.',
      capabilities: ['answer', 'suggest', 'summarize'],
      requiresHumanApproval: false,
      explanation: 'Operator AI can explain and summarize governed system state for authorized users.'
    },
    {
      key: 'operator-governed-action',
      audience: 'operator',
      title: 'Operator governed action',
      summary: 'Supports escalation and action planning for operator-controlled workflows.',
      capabilities: ['suggest', 'escalate'],
      requiresHumanApproval: true,
      explanation: 'Operator actions that could change governed state must remain approval-gated.'
    }
  ]
}

function cloneAiCard(card: AiAssistanceCard): AiAssistanceCard {
  return {
    ...card,
    capabilities: [...card.capabilities]
  }
}

export function getAiAssistanceRegistry() {
  return {
    public: canonicalAiRegistry.public.map(cloneAiCard),
    client: canonicalAiRegistry.client.map(cloneAiCard),
    operator: canonicalAiRegistry.operator.map(cloneAiCard)
  }
}

export function getAiCardsForAudience(audience: AiAudience) {
  return canonicalAiRegistry[audience].map(cloneAiCard)
}

export function canUseCapability(card: AiAssistanceCard, capability: AiCapability) {
  return card.capabilities.includes(capability)
}

export function buildAiAssistanceState(audience: AiAudience): AiAssistanceState {
  const cards = getAiCardsForAudience(audience)
  const uniqueCapabilities = Array.from(new Set(cards.flatMap((card) => card.capabilities)))

  return {
    audience,
    cards,
    summary: {
      cardCount: cards.length,
      approvalRequiredCount: cards.filter((card) => card.requiresHumanApproval).length,
      capabilityCount: uniqueCapabilities.length
    }
  }
}

export function getAiAssistanceAudit() {
  return {
    registry: getAiAssistanceRegistry(),
    states: {
      public: buildAiAssistanceState('public'),
      client: buildAiAssistanceState('client'),
      operator: buildAiAssistanceState('operator')
    },
    proofScope: {
      functional: 'audience-aware ai assistance contract available',
      visible: 'pending actual ai assistant UI adoption',
      data: 'canonical assistance cards and capability mappings fixed',
      governance: 'approval and escalation rules available'
    }
  }
}