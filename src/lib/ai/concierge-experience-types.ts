import type {
  ConciergeAnswer,
  ConciergeAudience,
  ConciergeResourceKind,
  ConciergeSurface,
  ConciergeWorkspaceSnapshot,
} from './concierge-retrieval-types'

export const CONCIERGE_EXPERIENCE_MODES = [
  'global_search',
  'ask_anything',
  'guided_answer',
  'artifact_jump',
] as const

export const CONCIERGE_ACTION_TONES = ['primary', 'secondary', 'support'] as const

export type ConciergeExperienceMode = (typeof CONCIERGE_EXPERIENCE_MODES)[number]
export type ConciergeActionTone = (typeof CONCIERGE_ACTION_TONES)[number]

export interface ConciergePromptPreset {
  id: string
  label: string
  description: string
  query: string
  audience: ConciergeAudience
  surface: ConciergeSurface
  intent: string
}

export interface ConciergeActionCard {
  id: string
  label: string
  description: string
  href: string
  action: string
  tone: ConciergeActionTone
}

export interface ConciergeSourceChip {
  label: string
  href: string
  kind: ConciergeResourceKind
}

export interface ConciergeNextStepCard {
  label: string
  description: string
}

export interface ConciergeGuidedAnswer {
  headline: string
  summary: string
  answer: ConciergeAnswer
  sourceChips: ConciergeSourceChip[]
  actionCards: ConciergeActionCard[]
  nextStepCards: ConciergeNextStepCard[]
}

export interface ConciergeExperienceShell {
  title: string
  subtitle: string
  placeholder: string
  modes: ConciergeExperienceMode[]
  promptPresets: ConciergePromptPreset[]
  emptyStateTitle: string
  emptyStateBody: string
}

export interface ConciergeExperiencePayload {
  surface: ConciergeSurface
  audience: ConciergeAudience
  shell: ConciergeExperienceShell
  snapshot: ConciergeWorkspaceSnapshot
  guidedAnswer: ConciergeGuidedAnswer
}