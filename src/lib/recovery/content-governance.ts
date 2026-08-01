import {
  getContentControllerPanels,
  getContentStudioSnapshot,
  listFeaturedPeopleProfiles,
  listPublishedFaqEntries,
  listPublishedPromotions,
} from './content-controller'

export const IMMUTABLE_IDENTITY_FIELDS = [
  'legalName',
  'cin',
  'pan',
  'tan',
  'gstin',
  'principalPlaceOfBusiness',
  'supportEmail',
  'supportPhone',
] as const

export const EDITABLE_SURFACE_TARGETS = [
  {
    targetId: 'hero-main',
    label: 'Homepage hero',
    route: '/',
    sectionKind: 'hero',
    editableFields: ['title', 'summary', 'primaryCtaLabel', 'primaryCtaHref'],
    audience: 'public',
  },
  {
    targetId: 'trust-ribbon',
    label: 'Homepage trust ribbon',
    route: '/',
    sectionKind: 'metrics',
    editableFields: ['title', 'summary'],
    audience: 'public',
  },
  {
    targetId: 'config-spine',
    label: 'Homepage control-surface feature card',
    route: '/',
    sectionKind: 'feature_grid',
    editableFields: ['title', 'summary'],
    audience: 'public',
  },
  {
    targetId: 'commercial-clarity',
    label: 'Homepage commercial clarity feature card',
    route: '/',
    sectionKind: 'feature_grid',
    editableFields: ['title', 'summary'],
    audience: 'public',
  },
  {
    targetId: 'ai-concierge',
    label: 'Homepage AI concierge feature card',
    route: '/',
    sectionKind: 'feature_grid',
    editableFields: ['title', 'summary'],
    audience: 'public',
  },
  {
    targetId: 'marketplace-hero',
    label: 'Marketplace hero',
    route: '/marketplace',
    sectionKind: 'hero',
    editableFields: ['title', 'summary', 'primaryCtaLabel', 'primaryCtaHref'],
    audience: 'public',
  },
  {
    targetId: 'contact-hero',
    label: 'Contact hero',
    route: '/contact',
    sectionKind: 'hero',
    editableFields: ['title', 'summary'],
    audience: 'public',
  },
  {
    targetId: 'promo_strategy_consult',
    label: 'Strategy consultation promotion',
    route: '/',
    sectionKind: 'promotion',
    editableFields: ['title', 'summary', 'ctaLabel', 'ctaHref'],
    audience: 'public',
  },
  {
    targetId: 'promo_marketplace_launch',
    label: 'Marketplace launch promotion',
    route: '/marketplace',
    sectionKind: 'promotion',
    editableFields: ['title', 'summary', 'ctaLabel', 'ctaHref'],
    audience: 'public',
  },
  {
    targetId: 'promo_client_entry',
    label: 'Client entry promotion',
    route: '/login/client',
    sectionKind: 'promotion',
    editableFields: ['title', 'summary', 'ctaLabel', 'ctaHref'],
    audience: 'public',
  },
  {
    targetId: 'people_profiles',
    label: 'Leadership and specialist trust cards',
    route: '/',
    sectionKind: 'people',
    editableFields: ['displayName', 'title', 'summary', 'featured'],
    audience: 'public',
  },
  {
    targetId: 'faq_public',
    label: 'Public FAQ entries',
    route: '/',
    sectionKind: 'faq',
    editableFields: ['question', 'answer', 'audience'],
    audience: 'public',
  },
  {
    targetId: 'support_surface',
    label: 'Support blocks and contact cards',
    route: '/contact',
    sectionKind: 'support',
    editableFields: ['label', 'summary', 'href'],
    audience: 'public',
  },
] as const

export const AI_ASSISTED_CONTENT_ACTIONS = [
  {
    actionId: 'draft_rewrite_brand_tone',
    label: 'Rewrite in premium brand tone',
    output: 'governed_draft',
    requiresReview: true,
  },
  {
    actionId: 'draft_hero_variant',
    label: 'Generate hero variant',
    output: 'section_variant',
    requiresReview: true,
  },
  {
    actionId: 'draft_promo_variant',
    label: 'Generate promotion variant',
    output: 'promotion_variant',
    requiresReview: true,
  },
  {
    actionId: 'draft_faq_set',
    label: 'Generate FAQ candidates',
    output: 'faq_candidates',
    requiresReview: true,
  },
  {
    actionId: 'publish_ready_check',
    label: 'Run publish readiness check',
    output: 'publish_check',
    requiresReview: false,
  },
] as const

function normalizeText(value: unknown) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
}

function findEditableTarget(targetId: string) {
  return EDITABLE_SURFACE_TARGETS.find((target) => target.targetId === targetId)
}

export function listEditableSurfaceTargets() {
  return [...EDITABLE_SURFACE_TARGETS]
}

export function listImmutableIdentityFields() {
  return [...IMMUTABLE_IDENTITY_FIELDS]
}

export function listAiAssistedContentActions() {
  return [...AI_ASSISTED_CONTENT_ACTIONS]
}

export function getContentGovernanceSnapshot() {
  return {
    editableTargetCount: EDITABLE_SURFACE_TARGETS.length,
    immutableFieldCount: IMMUTABLE_IDENTITY_FIELDS.length,
    aiActionCount: AI_ASSISTED_CONTENT_ACTIONS.length,
    reviewRequiredActionCount: AI_ASSISTED_CONTENT_ACTIONS.filter((action) => action.requiresReview).length,
    publicSurfaceCount: new Set(EDITABLE_SURFACE_TARGETS.map((target) => target.route)).size,
  }
}

export function createAiDraftEnvelope(input: {
  targetId?: string
  actionId?: string
  prompt?: string
  requestedFields?: string[]
}) {
  const targetId = normalizeText(input?.targetId)
  const actionId = normalizeText(input?.actionId)
  const prompt = normalizeText(input?.prompt)
  const target = findEditableTarget(targetId)
  const action = AI_ASSISTED_CONTENT_ACTIONS.find((item) => item.actionId === actionId)

  if (!target) {
    return {
      status: 'rejected',
      reason: 'unknown_target',
      targetId,
      actionId,
    }
  }

  if (!action) {
    return {
      status: 'rejected',
      reason: 'unknown_action',
      targetId,
      actionId,
    }
  }

  const requestedFields = Array.isArray(input?.requestedFields)
    ? input.requestedFields.map((field) => normalizeText(field)).filter(Boolean)
    : []

  const allowedFields = requestedFields.length
    ? requestedFields.filter((field) => (target.editableFields as readonly string[]).includes(field))
    : [...target.editableFields]

  return {
    status: 'draft_ready',
    targetId: target.targetId,
    targetLabel: target.label,
    actionId: action.actionId,
    actionLabel: action.label,
    route: target.route,
    requiresReview: action.requiresReview,
    prompt,
    allowedFields,
    generatedDraft: {
      headline: `Draft for ${target.label}`,
      summary: prompt || `Governed AI-generated draft prepared for ${target.label}.`,
      reviewState: 'pending_operator_review',
    },
  }
}

export function createPublishWorkflow(input: {
  targetId?: string
  requestedFields?: string[]
  changeSummary?: string
  actorLabel?: string
}) {
  const targetId = normalizeText(input?.targetId)
  const target = findEditableTarget(targetId)

  if (!target) {
    return {
      status: 'blocked',
      reason: 'unknown_target',
      targetId,
    }
  }

  const requestedFields = Array.isArray(input?.requestedFields)
    ? input.requestedFields.map((field) => normalizeText(field)).filter(Boolean)
    : []

  const blockedFields = requestedFields.filter((field) =>
    IMMUTABLE_IDENTITY_FIELDS.includes(field as (typeof IMMUTABLE_IDENTITY_FIELDS)[number]),
  )

  const allowedFields = requestedFields.filter((field) => (target.editableFields as readonly string[]).includes(field))

  return {
    status: blockedFields.length ? 'blocked' : 'ready_for_review',
    route: target.route,
    targetId: target.targetId,
    targetLabel: target.label,
    actorLabel: normalizeText(input?.actorLabel) || 'Operator',
    changeSummary: normalizeText(input?.changeSummary) || `Publish plan prepared for ${target.label}.`,
    requestedFields,
    allowedFields,
    blockedFields,
    reviewSteps: [
      'draft_created',
      'operator_review',
      'publish_confirmation',
      'audit_log_append',
    ],
  }
}

export function getAdminContentStudioExperience() {
  return {
    studioSnapshot: getContentStudioSnapshot(),
    controllerPanels: getContentControllerPanels(),
    governanceSnapshot: getContentGovernanceSnapshot(),
    editableTargets: listEditableSurfaceTargets(),
    immutableIdentityFields: listImmutableIdentityFields(),
    aiActions: listAiAssistedContentActions(),
    publishedPromotions: listPublishedPromotions(),
    featuredPeopleProfiles: listFeaturedPeopleProfiles(),
    faqEntries: listPublishedFaqEntries(),
    workflowLanes: [
      {
        laneId: 'lane_draft',
        label: 'Draft lane',
        summary: 'Generate and review governed content drafts before publish.',
      },
      {
        laneId: 'lane_publish',
        label: 'Publish lane',
        summary: 'Harden publish approvals and prevent immutable identity edits.',
      },
      {
        laneId: 'lane_audit',
        label: 'Audit lane',
        summary: 'Keep operator-visible publish history and controlled change rationale.',
      },
    ],
  }
}