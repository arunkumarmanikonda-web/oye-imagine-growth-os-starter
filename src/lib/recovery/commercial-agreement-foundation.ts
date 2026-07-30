import {
  COMMERCIAL_AGREEMENT_STATUSES,
  COMMERCIAL_APPROVAL_STAGES,
  COMMERCIAL_BILLING_MODELS,
  COMMERCIAL_PAYMENT_TERMS,
  COMMERCIAL_SCOPE_LANES,
} from './commercial-agreement-types'

const CANONICAL_PROVIDER_PROFILE = {
  legalName: 'OYE IMAGINE PRIVATE LIMITED',
  brandName: 'Oye !magine',
  cin: 'U47190UP2025PTC220916',
  pan: 'AAECO6856D',
  tan: 'MRTO02898A',
  gstin: '09AAECO6856D1Z8',
  principalPlaceOfBusiness: 'Suite No.11 A-116 Urbtech Trade Centre Sector-132 Maharishi Nagar Noida',
  supportEmail: 'hello@oyeimagine.com',
  supportPhone: '+91 8 988 988 988',
  billingEmail: 'hello@oyeimagine.com',
  emailDeliveryProvider: 'Resend',
} as const

const IMMUTABLE_PROVIDER_FIELDS = [
  'legalName',
  'brandName',
  'cin',
  'pan',
  'tan',
  'gstin',
  'principalPlaceOfBusiness',
  'supportEmail',
  'supportPhone',
  'billingEmail',
] as const

const DEFAULT_SCOPE_ANNEXES = [
  {
    annexId: 'annex_growth_strategy',
    lane: 'growth_strategy',
    title: 'Growth strategy and operating model annex',
    summary: 'Strategic planning, growth roadmap, operating rhythm and commercial alignment.',
    deliverables: ['strategy workshop', 'growth roadmap', 'operating cadence'],
  },
  {
    annexId: 'annex_performance_marketing',
    lane: 'performance_marketing',
    title: 'Performance marketing annex',
    summary: 'Search, paid social and funnel execution with optimization cadence.',
    deliverables: ['campaign setup', 'optimization cycle', 'performance reporting'],
  },
  {
    annexId: 'annex_seo_content',
    lane: 'seo_content',
    title: 'SEO and content systems annex',
    summary: 'Search visibility, editorial planning and organic demand capture.',
    deliverables: ['content plan', 'SEO briefs', 'publishing cadence'],
  },
  {
    annexId: 'annex_marketplace_specialist',
    lane: 'marketplace_specialist',
    title: 'Marketplace specialist annex',
    summary: 'Specialist allocation, proposal conversion and governed delivery visibility.',
    deliverables: ['specialist match', 'proposal review', 'delivery governance'],
  },
  {
    annexId: 'annex_reporting_support',
    lane: 'reporting_support',
    title: 'Reporting and support annex',
    summary: 'Client reporting rhythm, support handling and issue continuity.',
    deliverables: ['monthly report', 'support channel', 'action tracking'],
  },
] as const

const DEFAULT_APPROVAL_CHAIN = [
  {
    stage: 'intake_review',
    owner: 'Sales and onboarding',
    summary: 'Validate client details, scope request and initial commercial direction.',
  },
  {
    stage: 'commercial_review',
    owner: 'Commercial operations',
    summary: 'Validate pricing model, tax posture, billing rhythm and payment terms.',
  },
  {
    stage: 'legal_review',
    owner: 'Operator legal control',
    summary: 'Bind canonical provider identity and confirm annex and signature readiness.',
  },
  {
    stage: 'signature_ready',
    owner: 'Authorized signatories',
    summary: 'Finalize signatory data and move to e-sign workflow.',
  },
] as const

const DEFAULT_INTAKE_CHECKLIST = [
  'Client legal name captured',
  'Primary contact captured',
  'Requested service lanes mapped',
  'Commercial model selected',
  'Tax identity captured when available',
  'Approval chain prepared',
  'Canonical provider profile bound',
  'Signature readiness checklist started',
] as const

function normalizeText(value: unknown) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
}

function normalizeNumber(value: unknown, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeRequestedLanes(input: unknown) {
  if (!Array.isArray(input) || input.length === 0) {
    return ['growth_strategy']
  }

  const allowed = new Set(COMMERCIAL_SCOPE_LANES)
  return input
    .map((item) => normalizeText(item))
    .filter((item) => allowed.has(item as (typeof COMMERCIAL_SCOPE_LANES)[number]))
}

function createAgreementId(clientName: string) {
  const slug = normalizeText(clientName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

  return `agreement_${slug || 'draft'}`
}

function selectScopeAnnexes(requestedLanes: string[]) {
  const selected = DEFAULT_SCOPE_ANNEXES.filter((annex) => requestedLanes.includes(annex.lane))
  return selected.length ? selected : [DEFAULT_SCOPE_ANNEXES[0]]
}

export function getCanonicalProviderProfile() {
  return {
    ...CANONICAL_PROVIDER_PROFILE,
    immutableFields: [...IMMUTABLE_PROVIDER_FIELDS],
  }
}

export function listCommercialScopeLanes() {
  return [...COMMERCIAL_SCOPE_LANES]
}

export function listCommercialApprovalStages() {
  return [...COMMERCIAL_APPROVAL_STAGES]
}

export function listCommercialBillingModels() {
  return [...COMMERCIAL_BILLING_MODELS]
}

export function listCommercialPaymentTerms() {
  return [...COMMERCIAL_PAYMENT_TERMS]
}

export function listCommercialIntakeChecklist() {
  return [...DEFAULT_INTAKE_CHECKLIST]
}

export function buildAgreementSignupBlueprint(input: {
  clientLegalName?: string
  clientTradeName?: string
  clientPrimaryContactName?: string
  clientPrimaryContactEmail?: string
  clientGstin?: string
  clientBillingAddress?: string
  requestedLanes?: string[]
  billingModel?: string
  baseFeeInr?: number
  paymentTerm?: string
}) {
  const clientLegalName = normalizeText(input?.clientLegalName) || 'Prospective client'
  const clientTradeName = normalizeText(input?.clientTradeName) || clientLegalName
  const requestedLanes = normalizeRequestedLanes(input?.requestedLanes)
  const billingModel = listCommercialBillingModels().includes(normalizeText(input?.billingModel) as never)
    ? normalizeText(input?.billingModel)
    : 'monthly_retainer'
  const paymentTerm = listCommercialPaymentTerms().includes(normalizeText(input?.paymentTerm) as never)
    ? normalizeText(input?.paymentTerm)
    : 'net_15'

  const scopeAnnexes = selectScopeAnnexes(requestedLanes)

  return {
    agreementId: createAgreementId(clientLegalName),
    status: COMMERCIAL_AGREEMENT_STATUSES[1],
    providerProfile: getCanonicalProviderProfile(),
    clientProfile: {
      legalName: clientLegalName,
      tradeName: clientTradeName,
      primaryContactName: normalizeText(input?.clientPrimaryContactName) || 'Pending client contact',
      primaryContactEmail: normalizeText(input?.clientPrimaryContactEmail) || 'pending@client.example',
      gstin: normalizeText(input?.clientGstin) || 'pending_client_tax_profile',
      billingAddress: normalizeText(input?.clientBillingAddress) || 'pending_client_billing_address',
    },
    requestedLanes,
    scopeAnnexes,
    commercialTerms: {
      currency: 'INR',
      billingModel,
      baseFeeInr: normalizeNumber(input?.baseFeeInr, 0),
      gstRatePercent: 18,
      paymentTerm,
      invoiceCycle: 'monthly',
      invoiceDelivery: 'email_via_resend',
    },
    approvalChain: DEFAULT_APPROVAL_CHAIN.map((stage, index) => ({
      ...stage,
      order: index + 1,
      status: index === 0 ? 'ready' : 'pending',
    })),
    signaturePlan: {
      providerSignatory: 'Authorized Signatory — OYE IMAGINE PRIVATE LIMITED',
      clientSignatory: 'Pending client designation',
      eSignProviderStatus: 'pending_integration',
      documentsRequired: ['master_service_agreement', 'scope_annexures', 'commercial_schedule'],
    },
    workflowMilestones: [
      'intake_captured',
      'annex_generated',
      'commercial_review_ready',
      'legal_binding_complete',
      'signature_preparation_ready',
    ],
    legalBinding: {
      canonicalProviderBound: true,
      immutableProviderFields: [...IMMUTABLE_PROVIDER_FIELDS],
    },
  }
}

export function getAgreementSignupSnapshot() {
  return {
    availableScopeLaneCount: COMMERCIAL_SCOPE_LANES.length,
    annexTemplateCount: DEFAULT_SCOPE_ANNEXES.length,
    approvalStageCount: DEFAULT_APPROVAL_CHAIN.length,
    intakeChecklistCount: DEFAULT_INTAKE_CHECKLIST.length,
    immutableProviderFieldCount: IMMUTABLE_PROVIDER_FIELDS.length,
  }
}

export function getAdminCommercialFoundationExperience() {
  const sampleBlueprint = buildAgreementSignupBlueprint({
    clientLegalName: 'Neejee Retail Private Limited',
    clientTradeName: 'Neejee',
    clientPrimaryContactName: 'Commercial Lead',
    clientPrimaryContactEmail: 'finance@neejee.example',
    requestedLanes: ['growth_strategy', 'performance_marketing', 'reporting_support'],
    billingModel: 'monthly_retainer',
    baseFeeInr: 125000,
    paymentTerm: 'net_15',
  })

  return {
    snapshot: getAgreementSignupSnapshot(),
    providerProfile: getCanonicalProviderProfile(),
    billingModels: listCommercialBillingModels(),
    paymentTerms: listCommercialPaymentTerms(),
    scopeLanes: listCommercialScopeLanes(),
    intakeChecklist: listCommercialIntakeChecklist(),
    approvalStages: listCommercialApprovalStages(),
    sampleBlueprint,
    workflowCards: [
      {
        id: 'workflow_intake',
        label: 'Agreement intake',
        summary: 'Capture party details, service lanes and commercial request structure.',
      },
      {
        id: 'workflow_annex',
        label: 'Annex generation',
        summary: 'Bind selected service lanes into scope annexures and commercial schedule.',
      },
      {
        id: 'workflow_signature',
        label: 'Signature readiness',
        summary: 'Preserve canonical provider identity and prepare e-sign transition.',
      },
    ],
  }
}