export type SupportAudience = 'public' | 'client' | 'operator'
export type SupportChannel = 'email' | 'phone' | 'portal' | 'admin_queue'

export type SupportContactCard = {
  key: string
  audience: SupportAudience
  channel: SupportChannel
  label: string
  destination: string
  responseSla: string
  escalationTarget: string
  governanceBound: boolean
}

export type SupportContactState = {
  audience: SupportAudience
  cards: SupportContactCard[]
  summary: {
    cardCount: number
    governanceBoundCount: number
    escalatedCount: number
  }
}

const canonicalSupportRegistry: Record<SupportAudience, SupportContactCard[]> = {
  public: [
    {
      key: 'public-email',
      audience: 'public',
      channel: 'email',
      label: 'Public email support',
      destination: 'hello@oyeimagine.com',
      responseSla: 'Next business day',
      escalationTarget: 'operator-support-desk',
      governanceBound: true
    },
    {
      key: 'public-phone',
      audience: 'public',
      channel: 'phone',
      label: 'Public phone support',
      destination: '+91 8 988 988 988',
      responseSla: 'Same business day',
      escalationTarget: 'operator-support-desk',
      governanceBound: true
    }
  ],
  client: [
    {
      key: 'client-portal',
      audience: 'client',
      channel: 'portal',
      label: 'Client portal support',
      destination: '/client/support',
      responseSla: 'Within 4 business hours',
      escalationTarget: 'client-escalation-desk',
      governanceBound: true
    },
    {
      key: 'client-email',
      audience: 'client',
      channel: 'email',
      label: 'Client priority email',
      destination: 'hello@oyeimagine.com',
      responseSla: 'Within 1 business hour',
      escalationTarget: 'account-operator',
      governanceBound: true
    }
  ],
  operator: [
    {
      key: 'operator-admin-queue',
      audience: 'operator',
      channel: 'admin_queue',
      label: 'Operator admin queue',
      destination: '/admin/support',
      responseSla: 'Immediate triage',
      escalationTarget: 'super-admin-governance',
      governanceBound: true
    },
    {
      key: 'operator-escalation-phone',
      audience: 'operator',
      channel: 'phone',
      label: 'Operator escalation phone',
      destination: '+91 8 988 988 988',
      responseSla: 'Immediate',
      escalationTarget: 'super-admin-governance',
      governanceBound: true
    }
  ]
}

function cloneSupportCard(card: SupportContactCard): SupportContactCard {
  return { ...card }
}

export function getSupportContactRegistry() {
  return {
    public: canonicalSupportRegistry.public.map(cloneSupportCard),
    client: canonicalSupportRegistry.client.map(cloneSupportCard),
    operator: canonicalSupportRegistry.operator.map(cloneSupportCard)
  }
}

export function getSupportContactsForAudience(audience: SupportAudience) {
  return canonicalSupportRegistry[audience].map(cloneSupportCard)
}

export function requiresEscalation(card: SupportContactCard) {
  return card.escalationTarget.trim().length > 0
}

export function buildSupportContactState(audience: SupportAudience): SupportContactState {
  const cards = getSupportContactsForAudience(audience)

  return {
    audience,
    cards,
    summary: {
      cardCount: cards.length,
      governanceBoundCount: cards.filter((card) => card.governanceBound).length,
      escalatedCount: cards.filter((card) => requiresEscalation(card)).length
    }
  }
}

export function getSupportContactAudit() {
  return {
    registry: getSupportContactRegistry(),
    states: {
      public: buildSupportContactState('public'),
      client: buildSupportContactState('client'),
      operator: buildSupportContactState('operator')
    },
    proofScope: {
      functional: 'audience-aware support contact contract available',
      visible: 'pending actual support ui adoption',
      data: 'canonical support channels and destinations fixed',
      governance: 'escalation and sla rules available'
    }
  }
}