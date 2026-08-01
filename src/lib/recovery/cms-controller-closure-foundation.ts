export type CmsSurface = 'public' | 'client' | 'operator'
export type CmsPublishState = 'published' | 'draft' | 'fallback'

export type CmsContentRecord = {
  key: string
  surface: CmsSurface
  title: string
  body: string
  trustBound: boolean
  publishState: Exclude<CmsPublishState, 'fallback'>
}

export type CmsControllerState = {
  surface: CmsSurface
  resolvedContent: Array<CmsContentRecord | (Omit<CmsContentRecord, 'publishState'> & { publishState: 'fallback' })>
  fallbackSources: string[]
  publishSummary: {
    publishedCount: number
    draftCount: number
    fallbackCount: number
  }
}

const canonicalCmsRegistry: Record<CmsSurface, CmsContentRecord[]> = {
  public: [
    {
      key: 'homepage-hero',
      surface: 'public',
      title: 'Oye !magine growth operating system',
      body: 'Canonical public hero content for premium trust-led experience.',
      trustBound: true,
      publishState: 'published'
    },
    {
      key: 'homepage-proof',
      surface: 'public',
      title: 'Execution proof and trust',
      body: 'Public trust and proof narrative bound to canonical identity.',
      trustBound: true,
      publishState: 'draft'
    }
  ],
  client: [
    {
      key: 'client-dashboard-intro',
      surface: 'client',
      title: 'Client workspace overview',
      body: 'Canonical client workspace introduction controlled by CMS.',
      trustBound: true,
      publishState: 'published'
    },
    {
      key: 'client-support-panel',
      surface: 'client',
      title: 'Client support guidance',
      body: 'Support and escalation guidance for client workspace users.',
      trustBound: true,
      publishState: 'draft'
    }
  ],
  operator: [
    {
      key: 'operator-control-tower',
      surface: 'operator',
      title: 'Operator control tower',
      body: 'Canonical operator workspace narrative for governance surfaces.',
      trustBound: true,
      publishState: 'published'
    },
    {
      key: 'operator-publish-guardrail',
      surface: 'operator',
      title: 'Publishing guardrails',
      body: 'Operational guidance for publication review and governance.',
      trustBound: true,
      publishState: 'draft'
    }
  ]
}

function cloneRecord(record: CmsContentRecord): CmsContentRecord {
  return { ...record }
}

export function getCanonicalCmsRegistry() {
  return {
    public: canonicalCmsRegistry.public.map(cloneRecord),
    client: canonicalCmsRegistry.client.map(cloneRecord),
    operator: canonicalCmsRegistry.operator.map(cloneRecord)
  }
}

export function getCmsContentForSurface(surface: CmsSurface) {
  return canonicalCmsRegistry[surface].map(cloneRecord)
}

export function buildCmsControllerState(surface: CmsSurface): CmsControllerState {
  const surfaceContent = getCmsContentForSurface(surface)
  const fallbackSources = surface === 'public'
    ? []
    : canonicalCmsRegistry.public.map((record) => record.key)

  const resolvedContent: CmsControllerState['resolvedContent'] = surfaceContent.map((record) => cloneRecord(record))

  if (surface !== 'public') {
    const existingKeys = new Set(resolvedContent.map((record) => record.key))
    for (const publicRecord of canonicalCmsRegistry.public) {
      if (!existingKeys.has(publicRecord.key)) {
        resolvedContent.push({
          ...cloneRecord(publicRecord),
          surface,
          publishState: 'fallback'
        })
      }
    }
  }

  return {
    surface,
    resolvedContent,
    fallbackSources,
    publishSummary: {
      publishedCount: resolvedContent.filter((record) => record.publishState === 'published').length,
      draftCount: resolvedContent.filter((record) => record.publishState === 'draft').length,
      fallbackCount: resolvedContent.filter((record) => record.publishState === 'fallback').length
    }
  }
}

export function getCmsControllerAudit() {
  return {
    registry: getCanonicalCmsRegistry(),
    states: {
      public: buildCmsControllerState('public'),
      client: buildCmsControllerState('client'),
      operator: buildCmsControllerState('operator')
    },
    proofScope: {
      functional: 'surface-aware cms controller contract available',
      visible: 'pending actual UI adoption',
      data: 'canonical content keys and publication states fixed',
      governance: 'fallback and publication rules available'
    }
  }
}