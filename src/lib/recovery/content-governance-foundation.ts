import {
  contentFaqEntries,
  contentPages,
  contentPeopleProfiles,
  contentPromotions,
  contentSections,
  getContentControllerSnapshot
} from './content-controller'

export type PublishingState = 'draft' | 'review' | 'scheduled' | 'published'

export interface ContentPublishingWorkItem {
  id: string
  title: string
  pageSlug: string
  entityType: 'page' | 'section' | 'promotion' | 'faq' | 'profile'
  entityKey: string
  state: PublishingState
  owner: string
  previewPath: string
  publishWindow: string
  rollbackVersion: string
  checklist: string[]
}

function resolvePagePath(pageSlug: string) {
  switch (pageSlug) {
    case 'home':
      return '/'
    case 'marketplace':
      return '/marketplace'
    case 'contact':
      return '/contact'
    case 'login':
      return '/login'
    case 'client':
      return '/client'
    case 'admin':
      return '/admin'
    default:
      return `/${pageSlug}`
  }
}

export const contentPublishingWorkItems: ContentPublishingWorkItem[] = [
  {
    id: 'publish-home-hero-001',
    title: 'Homepage hero trust-led rewrite',
    pageSlug: 'home',
    entityType: 'section',
    entityKey: 'hero',
    state: 'review',
    owner: 'Content Lead',
    previewPath: '/?preview=publish-home-hero-001',
    publishWindow: 'After legal/profile confirmation',
    rollbackVersion: 'home@v12',
    checklist: ['Messaging reviewed', 'Trust block aligned', 'CTA labels approved']
  },
  {
    id: 'publish-marketplace-001',
    title: 'Marketplace positioning and governance refresh',
    pageSlug: 'marketplace',
    entityType: 'page',
    entityKey: 'marketplace',
    state: 'draft',
    owner: 'Marketplace Ops',
    previewPath: '/marketplace?preview=publish-marketplace-001',
    publishWindow: 'Pending operator sign-off',
    rollbackVersion: 'marketplace@v4',
    checklist: ['Scope verified', 'Provider claims reviewed', 'CTA placement checked']
  },
  {
    id: 'publish-contact-001',
    title: 'Contact page support trust hardening',
    pageSlug: 'contact',
    entityType: 'page',
    entityKey: 'contact',
    state: 'published',
    owner: 'Support Operations',
    previewPath: '/contact?preview=publish-contact-001',
    publishWindow: 'Live',
    rollbackVersion: 'contact@v3',
    checklist: ['Legal identity present', 'Support channels canonical', 'Address formatting verified']
  },
  {
    id: 'publish-login-001',
    title: 'Login hub directional copy refinement',
    pageSlug: 'login',
    entityType: 'section',
    entityKey: 'login-hub',
    state: 'review',
    owner: 'Platform Experience',
    previewPath: '/login?preview=publish-login-001',
    publishWindow: 'Next controlled publish window',
    rollbackVersion: 'login@v6',
    checklist: ['Client/admin paths separated', 'No mixed-role confusion', 'Redirect hints verified']
  },
  {
    id: 'publish-client-001',
    title: 'Client workspace welcome narrative',
    pageSlug: 'client',
    entityType: 'section',
    entityKey: 'client-welcome',
    state: 'scheduled',
    owner: 'Client Success',
    previewPath: '/client?preview=publish-client-001',
    publishWindow: 'Scheduled for next workspace pass',
    rollbackVersion: 'client@v2',
    checklist: ['Workspace context checked', 'Role-safe copy confirmed', 'Support route linked']
  },
  {
    id: 'publish-admin-001',
    title: 'Admin trust and governance summary refresh',
    pageSlug: 'admin',
    entityType: 'section',
    entityKey: 'admin-summary',
    state: 'draft',
    owner: 'Operator Governance',
    previewPath: '/admin?preview=publish-admin-001',
    publishWindow: 'Pending ops review',
    rollbackVersion: 'admin@v5',
    checklist: ['Config references verified', 'Audit wording approved', 'Support command path included']
  }
]

export function getContentPublishingSnapshot() {
  const stateCounts: Record<PublishingState, number> = {
    draft: 0,
    review: 0,
    scheduled: 0,
    published: 0
  }

  for (const workItem of contentPublishingWorkItems) {
    stateCounts[workItem.state] += 1
  }

  return {
    stateCounts,
    totalWorkItems: contentPublishingWorkItems.length,
    previewReadyCount: contentPublishingWorkItems.filter((item) => item.previewPath.startsWith('/')).length,
    rollbackReadyCount: contentPublishingWorkItems.filter((item) => item.rollbackVersion.length > 0).length,
    scheduledCount: stateCounts.scheduled,
    controllerSnapshot: getContentControllerSnapshot(),
    governedAssetCounts: {
      pages: contentPages.length,
      sections: contentSections.length,
      promotions: contentPromotions.length,
      faqEntries: contentFaqEntries.length,
      peopleProfiles: contentPeopleProfiles.length
    }
  }
}

export function getContentPublishingExperience() {
  const snapshot = getContentPublishingSnapshot()

  return {
    title: 'Content studio governance',
    subtitle:
      'Draft, preview, publish, rollback, and audit-safe content operations across public, client, and operator surfaces.',
    summaryCards: [
      { label: 'Draft items', value: String(snapshot.stateCounts.draft) },
      { label: 'In review', value: String(snapshot.stateCounts.review) },
      { label: 'Scheduled', value: String(snapshot.stateCounts.scheduled) },
      { label: 'Published references', value: String(snapshot.stateCounts.published) }
    ],
    workflowStages: [
      'Draft authoring under governed schema',
      'Operator review and trust/legal verification',
      'Preview against target surface and route context',
      'Controlled publish window with rollback reference',
      'Audit trail retention for every publish decision'
    ],
    governanceRules: [
      'Every publishable item must expose a preview path before release.',
      'Every released item must retain a rollback version identifier.',
      'Governed content must remain traceable to a page slug, owner, and publish state.'
    ],
    previewRoutes: contentPublishingWorkItems.map((item) => ({
      id: item.id,
      title: item.title,
      pageSlug: item.pageSlug,
      previewPath: item.previewPath
    })),
    workItems: contentPublishingWorkItems,
    controllerSnapshot: snapshot.controllerSnapshot,
    governedAssetCounts: snapshot.governedAssetCounts
  }
}

export function getGovernedPagePaths() {
  return contentPages.map((page) => ({
    slug: page.slug,
    path: resolvePagePath(page.slug)
  }))
}