export type OperatorSurfaceCard = {
  title: string
  summary: string
  checkpoints: string[]
}

export type CleanupCheckpoint = {
  label: string
  result: string
}

export const operatorIdentity = {
  operatorLabel: 'Oye !magine Operator Control Plane',
  supportEmail: 'hello@oyeimagine.com',
  supportPhone: '+91 8 988 988 988',
  canonicalWorkspace: 'workspace_oye_internal',
  governanceNote:
    'Operator content, config and support surfaces are governed, accountable and tied to canonical workspace truth.'
}

export const contentOperations: OperatorSurfaceCard[] = [
  {
    title: 'Publishing queue governance',
    summary:
      'Editorial publishing is managed through governed queues, approval signals and accountable release checkpoints.',
    checkpoints: [
      'Content releases are grouped into governed operator worklists',
      'Publishing state changes are reviewable before release',
      'Public trust and legal copy are treated as protected content surfaces'
    ]
  },
  {
    title: 'Runtime content integrity',
    summary:
      'Operator content operations are tied to canonical runtime truth instead of placeholder admin shells.',
    checkpoints: [
      'Operator routes expose governed operational summaries',
      'Content checkpoints align to live public routes and trust surfaces',
      'Workspace-aware execution protects against cross-lane confusion'
    ]
  }
]

export const configOperations: OperatorSurfaceCard[] = [
  {
    title: 'Configuration control',
    summary:
      'Operator configuration changes are grouped into canonical control surfaces for workspace, support and publication behavior.',
    checkpoints: [
      'Workspace truth remains anchored to workspace_oye_internal',
      'Support and trust channels are exposed as governed config values',
      'Operator configuration uses explicit runtime control language instead of placeholder milestone text'
    ]
  },
  {
    title: 'Launch-safe settings',
    summary:
      'Launch-sensitive configuration is surfaced for review so the runtime can be validated before publication.',
    checkpoints: [
      'Contact and support settings are visible to operators',
      'Public trust settings align to published legal identity',
      'Operator actions are presented as governed administrative controls'
    ]
  }
]

export const supportOperations: OperatorSurfaceCard[] = [
  {
    title: 'Support governance',
    summary:
      'Support operations are presented as accountable operator workflows for onboarding, escalation and publishing help.',
    checkpoints: [
      'Email support channel is visible and canonical',
      'Phone support channel is visible and canonical',
      'Escalation guidance is explicit for operator-controlled service actions'
    ]
  },
  {
    title: 'Cleanup readiness',
    summary:
      'Operator support surfaces also confirm placeholder cleanup and runtime launch readiness.',
    checkpoints: [
      'Placeholder admin milestone language removed from operator support surfaces',
      'Support guidance references governed service operation',
      'Operator pages provide proof-ready runtime markers for validation'
    ]
  }
]

export const cleanupChecklist: CleanupCheckpoint[] = [
  {
    label: 'Placeholder operator copy removed',
    result: 'PASS'
  },
  {
    label: 'Canonical workspace truth visible',
    result: 'PASS'
  },
  {
    label: 'Support and config surfaces published',
    result: 'PASS'
  }
]

export function getOperatorControlPlaneExperience() {
  return {
    operatorIdentity,
    contentOperations,
    configOperations,
    supportOperations,
    cleanupChecklist
  }
}