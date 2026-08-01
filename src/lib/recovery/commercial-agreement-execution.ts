import {
  buildAgreementSignupBlueprint,
  getAgreementSignupSnapshot,
  getCanonicalProviderProfile,
} from './commercial-agreement-foundation'

export const COMMERCIAL_ESIGN_PROVIDERS = [
  'pending_integration',
  'docusign_ready',
  'zoho_sign_ready',
] as const

export const COMMERCIAL_EXECUTION_STATES = [
  'draft_package',
  'approval_in_progress',
  'signature_ready',
  'signature_sent',
] as const

export const COMMERCIAL_ARTIFACT_TYPES = [
  'master_service_agreement',
  'scope_annexures',
  'commercial_schedule',
  'signature_cover',
] as const

function normalizeText(value: unknown) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
}

function buildArtifactList(blueprint: ReturnType<typeof buildAgreementSignupBlueprint>) {
  const annexCount = blueprint.scopeAnnexes.length

  return [
    {
      artifactId: `${blueprint.agreementId}_msa`,
      type: 'master_service_agreement',
      label: 'Master service agreement',
      status: 'prepared',
      route: `/client/agreements/${blueprint.agreementId}/msa`,
    },
    {
      artifactId: `${blueprint.agreementId}_annexures`,
      type: 'scope_annexures',
      label: `Scope annexures (${annexCount})`,
      status: annexCount > 0 ? 'prepared' : 'pending',
      route: `/client/agreements/${blueprint.agreementId}/annexures`,
    },
    {
      artifactId: `${blueprint.agreementId}_commercial_schedule`,
      type: 'commercial_schedule',
      label: 'Commercial schedule',
      status: 'prepared',
      route: `/client/agreements/${blueprint.agreementId}/commercial-schedule`,
    },
    {
      artifactId: `${blueprint.agreementId}_signature_cover`,
      type: 'signature_cover',
      label: 'Signature cover and routing note',
      status: 'prepared',
      route: `/client/agreements/${blueprint.agreementId}/signature-cover`,
    },
  ]
}

export function advanceApprovalExecution(input: {
  clientLegalName?: string
  requestedLanes?: string[]
  currentStage?: string
  billingModel?: string
  paymentTerm?: string
  baseFeeInr?: number
}) {
  const blueprint = buildAgreementSignupBlueprint(input)
  const currentStage = normalizeText(input?.currentStage) || blueprint.approvalChain[0]?.stage || 'intake_review'
  const currentIndex = blueprint.approvalChain.findIndex((stage) => stage.stage === currentStage)
  const safeIndex = currentIndex >= 0 ? currentIndex : 0

  const executionChain = blueprint.approvalChain.map((stage, index) => {
    let status = 'pending'
    if (index < safeIndex) status = 'approved'
    if (index === safeIndex) status = 'approved'
    if (index === safeIndex + 1) status = 'ready'
    if (safeIndex === blueprint.approvalChain.length - 1 && index === safeIndex) status = 'approved'

    return {
      ...stage,
      executionStatus: status,
    }
  })

  const nextStage = executionChain.find((stage) => stage.executionStatus === 'ready') ?? null
  const approvedCount = executionChain.filter((stage) => stage.executionStatus === 'approved').length

  return {
    agreementId: blueprint.agreementId,
    status:
      approvedCount >= executionChain.length
        ? 'signature_ready'
        : approvedCount > 0
          ? 'approval_in_progress'
          : 'draft_package',
    approvedCount,
    currentApprovedStage: executionChain[Math.min(safeIndex, executionChain.length - 1)]?.stage ?? null,
    nextStage: nextStage?.stage ?? null,
    executionChain,
  }
}

export function buildAgreementExecutionPackage(input: {
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
  eSignProvider?: string
}) {
  const blueprint = buildAgreementSignupBlueprint(input)
  const approvalProgress = advanceApprovalExecution({
    clientLegalName: input?.clientLegalName,
    requestedLanes: input?.requestedLanes,
    billingModel: input?.billingModel,
    paymentTerm: input?.paymentTerm,
    baseFeeInr: input?.baseFeeInr,
    currentStage: 'intake_review',
  })

  const eSignProvider = COMMERCIAL_ESIGN_PROVIDERS.includes(normalizeText(input?.eSignProvider) as never)
    ? normalizeText(input?.eSignProvider)
    : 'pending_integration'

  const artifacts = buildArtifactList(blueprint)
  const provider = getCanonicalProviderProfile()

  return {
    agreementId: blueprint.agreementId,
    executionState: approvalProgress.status,
    providerProfile: provider,
    clientProfile: blueprint.clientProfile,
    commercialTerms: blueprint.commercialTerms,
    artifacts,
    approvalProgress,
    signatureReadiness: {
      providerBound: blueprint.legalBinding.canonicalProviderBound,
      immutableProviderFields: blueprint.legalBinding.immutableProviderFields,
      providerSignatory: blueprint.signaturePlan.providerSignatory,
      clientSignatory: blueprint.signaturePlan.clientSignatory,
      eSignProvider,
      readyDocumentCount: artifacts.filter((artifact) => artifact.status === 'prepared').length,
      readyForDispatch:
        artifacts.every((artifact) => artifact.status === 'prepared') &&
        blueprint.legalBinding.canonicalProviderBound,
    },
    actionShortcuts: [
      { label: 'Open commercial schedule', route: artifacts[2].route },
      { label: 'Open annexures', route: artifacts[1].route },
      { label: 'Open signature cover', route: artifacts[3].route },
    ],
  }
}

export function getCommercialExecutionSnapshot() {
  const signupSnapshot = getAgreementSignupSnapshot()
  return {
    ...signupSnapshot,
    artifactTypeCount: COMMERCIAL_ARTIFACT_TYPES.length,
    executionStateCount: COMMERCIAL_EXECUTION_STATES.length,
    eSignProviderCount: COMMERCIAL_ESIGN_PROVIDERS.length,
  }
}

export function getAdminCommercialExecutionExperience() {
  const samplePackage = buildAgreementExecutionPackage({
    clientLegalName: 'Neejee Retail Private Limited',
    clientTradeName: 'Neejee',
    clientPrimaryContactName: 'Commercial Lead',
    clientPrimaryContactEmail: 'finance@neejee.example',
    requestedLanes: ['growth_strategy', 'performance_marketing', 'reporting_support'],
    billingModel: 'monthly_retainer',
    baseFeeInr: 125000,
    paymentTerm: 'net_15',
    eSignProvider: 'pending_integration',
  })

  return {
    snapshot: getCommercialExecutionSnapshot(),
    providerProfile: getCanonicalProviderProfile(),
    executionStates: [...COMMERCIAL_EXECUTION_STATES],
    artifactTypes: [...COMMERCIAL_ARTIFACT_TYPES],
    eSignProviders: [...COMMERCIAL_ESIGN_PROVIDERS],
    samplePackage,
    workflowCards: [
      {
        id: 'execution_package',
        label: 'Artifact packaging',
        summary: 'Assemble MSA, annexures, commercial schedule and signature cover into one governed package.',
      },
      {
        id: 'approval_chain',
        label: 'Approval execution',
        summary: 'Move the agreement through intake, commercial, legal and signature-ready control points.',
      },
      {
        id: 'signature_dispatch',
        label: 'E-sign preparation',
        summary: 'Preserve canonical provider identity while preparing dispatch into the future e-sign layer.',
      },
    ],
  }
}