import { LaunchChecklistSection } from './types';

export const launchChecklistSections: LaunchChecklistSection[] = [
  {
    id: 'foundation-backfill',
    title: 'Foundation evidence backfill',
    description:
      'Backfill workbook and artifact evidence for the early public-shell batches before final signoff.',
    sourceBatches: ['UI01', 'UI02', 'UI03', 'UI04'],
    ownerSuggestions: ['Engineering', 'Product'],
    signoffRoles: ['Engineering', 'Product'],
    status: 'in_progress',
    items: [
      {
        id: 'ui01-ui04-evidence',
        label: 'Evidence links attached for UI01-UI04',
        status: 'in_progress',
        launchBlocking: true,
        evidenceSource: 'Tracker workbook + prior batch artifacts',
        notes: 'Requires artifact URL backfill before launch review.',
      },
      {
        id: 'ui01-ui04-owner-map',
        label: 'Owner map confirmed for UI01-UI04',
        status: 'not_started',
        launchBlocking: false,
        evidenceSource: 'Tracker workbook',
      },
    ],
  },
  {
    id: 'flows-backfill',
    title: 'Flow and conversion evidence backfill',
    description:
      'Backfill evidence for the midstream public UX and conversion-path batches.',
    sourceBatches: ['UI05', 'UI06', 'UI07', 'UI08'],
    ownerSuggestions: ['Engineering', 'Product', 'Marketing'],
    signoffRoles: ['Engineering', 'Marketing'],
    status: 'in_progress',
    items: [
      {
        id: 'ui05-ui08-evidence',
        label: 'Evidence links attached for UI05-UI08',
        status: 'in_progress',
        launchBlocking: true,
        evidenceSource: 'Tracker workbook + prior batch artifacts',
      },
      {
        id: 'ui05-ui08-copy-review',
        label: 'Copy and CTA review status captured',
        status: 'not_started',
        launchBlocking: false,
        evidenceSource: 'Marketing review notes',
      },
    ],
  },
  {
    id: 'trust-backfill',
    title: 'Trust and compliance evidence backfill',
    description:
      'Backfill trust/compliance proof for the public shell before legal approval.',
    sourceBatches: ['UI09', 'UI10', 'UI11', 'UI12'],
    ownerSuggestions: ['Engineering', 'Legal', 'Product'],
    signoffRoles: ['Engineering', 'Legal'],
    status: 'in_progress',
    items: [
      {
        id: 'ui09-ui12-evidence',
        label: 'Evidence links attached for UI09-UI12',
        status: 'in_progress',
        launchBlocking: true,
        evidenceSource: 'Tracker workbook + compliance artifacts',
      },
      {
        id: 'ui09-ui12-legal-summary',
        label: 'Legal review summary attached',
        status: 'not_started',
        launchBlocking: true,
        evidenceSource: 'Legal summary memo',
      },
    ],
  },
  {
    id: 'ux-backfill',
    title: 'Public UX evidence backfill',
    description:
      'Backfill final evidence for the remaining pre-UI17 public UX batches.',
    sourceBatches: ['UI13', 'UI14', 'UI15', 'UI16'],
    ownerSuggestions: ['Engineering', 'Design', 'Product'],
    signoffRoles: ['Engineering', 'Design'],
    status: 'in_progress',
    items: [
      {
        id: 'ui13-ui16-evidence',
        label: 'Evidence links attached for UI13-UI16',
        status: 'in_progress',
        launchBlocking: true,
        evidenceSource: 'Tracker workbook + screenshots',
      },
      {
        id: 'ui13-ui16-design-review',
        label: 'Design review notes attached',
        status: 'not_started',
        launchBlocking: false,
        evidenceSource: 'Design review notes',
      },
    ],
  },
  {
    id: 'ui17-responsive',
    title: 'Responsive layout remediation',
    description:
      'UI17 completed and verified; attach final proof to the launch pack.',
    sourceBatches: ['UI17'],
    ownerSuggestions: ['Engineering', 'Design'],
    signoffRoles: ['Engineering', 'Design'],
    status: 'ready',
    items: [
      {
        id: 'ui17-proof',
        label: 'Responsive verification evidence attached',
        status: 'ready',
        launchBlocking: true,
        evidenceSource: 'Playwright verification artifacts',
        notes: 'Completed green in prior batch closeout.',
      },
    ],
  },
  {
    id: 'ui18-accessibility',
    title: 'Accessibility remediation rerun',
    description:
      'UI18 remains the explicit blocker until the affected audit runner is delta-fixed and the reports are regenerated.',
    sourceBatches: ['UI18'],
    ownerSuggestions: ['Engineering', 'Design', 'Product'],
    signoffRoles: ['Engineering', 'Design', 'Product'],
    status: 'blocked',
    items: [
      {
        id: 'ui18-runner-fix',
        label: 'Delta-fix the affected accessibility runner only',
        status: 'blocked',
        launchBlocking: true,
        evidenceSource: 'UI18 rerun logs and repaired runner output',
        notes: 'Blocked by runner incompatibility and requires targeted rerun, not full restart.',
      },
      {
        id: 'ui18-report-pack',
        label: 'Axe/Playwright report pack attached',
        status: 'not_started',
        launchBlocking: true,
        evidenceSource: 'Accessibility report artifacts',
      },
    ],
  },
  {
    id: 'ui19-design-system',
    title: 'Design system consistency',
    description:
      'UI19 completed and should be referenced in final visual signoff.',
    sourceBatches: ['UI19'],
    ownerSuggestions: ['Engineering', 'Design'],
    signoffRoles: ['Engineering', 'Design'],
    status: 'ready',
    items: [
      {
        id: 'ui19-proof',
        label: 'Design consistency evidence attached',
        status: 'ready',
        launchBlocking: true,
        evidenceSource: 'UI19 branch and artifact evidence',
        notes: 'Branch mega-batch-c-ui19-design-system-consistency, commit e888ed6.',
      },
    ],
  },
  {
    id: 'ui20-premium-polish',
    title: 'Premium polish',
    description:
      'UI20 completed and should be included in final visual/copy review.',
    sourceBatches: ['UI20'],
    ownerSuggestions: ['Engineering', 'Design', 'Marketing'],
    signoffRoles: ['Engineering', 'Design', 'Marketing'],
    status: 'ready',
    items: [
      {
        id: 'ui20-proof',
        label: 'Premium polish evidence attached',
        status: 'ready',
        launchBlocking: false,
        evidenceSource: 'UI20 branch and artifact evidence',
        notes: 'Branch mega-batch-c-ui20-premium-polish, commit 9d5972c.',
      },
    ],
  },
  {
    id: 'ui21-web-vitals',
    title: 'Web vitals and build hygiene',
    description:
      'UI21 completed green and should be attached to the performance review section.',
    sourceBatches: ['UI21'],
    ownerSuggestions: ['Engineering', 'Product'],
    signoffRoles: ['Engineering', 'Product'],
    status: 'ready',
    items: [
      {
        id: 'ui21-proof',
        label: 'Lighthouse and build hygiene evidence attached',
        status: 'ready',
        launchBlocking: true,
        evidenceSource: 'UI21 Lighthouse report pack',
        notes: 'Branch mega-batch-c-ui21-web-vitals-cleanup, commit be3d119.',
      },
    ],
  },
  {
    id: 'ui22-seo',
    title: 'SEO metadata, schema, and FAQ modules',
    description:
      'UI22 completed green and should be attached to the SEO validation section.',
    sourceBatches: ['UI22'],
    ownerSuggestions: ['Engineering', 'Marketing', 'Product'],
    signoffRoles: ['Engineering', 'Marketing'],
    status: 'ready',
    items: [
      {
        id: 'ui22-proof',
        label: 'SEO verification pack attached',
        status: 'ready',
        launchBlocking: true,
        evidenceSource: 'UI22 closeout summary and route verification',
        notes: 'Branch mega-batch-c-ui22-seo-presentation-modules, commits 76bf2c6 and b9132d8.',
      },
    ],
  },
  {
    id: 'ui23-cross-linking',
    title: 'Cross-linking and sitemap coverage',
    description:
      'UI23 completed green and should be attached to the crawl/readiness section.',
    sourceBatches: ['UI23'],
    ownerSuggestions: ['Engineering', 'Marketing', 'Product'],
    signoffRoles: ['Engineering', 'Marketing'],
    status: 'ready',
    items: [
      {
        id: 'ui23-proof',
        label: 'Cross-link and sitemap validation attached',
        status: 'ready',
        launchBlocking: true,
        evidenceSource: 'UI23 closeout summary and route verification',
        notes: 'Branch mega-batch-c-ui23-cross-linking-and-sitemap, commit ceee78c.',
      },
    ],
  },
];

export function summarizeChecklist(sections: LaunchChecklistSection[]) {
  const allItems = sections.flatMap((section) => section.items);
  const ready = allItems.filter((item) => item.status === 'ready').length;
  const blocked = allItems.filter((item) => item.status === 'blocked').length;
  const inProgress = allItems.filter((item) => item.status === 'in_progress').length;
  const notStarted = allItems.filter((item) => item.status === 'not_started').length;
  const blockingOpen = allItems.filter(
    (item) => item.launchBlocking && item.status !== 'ready'
  ).length;

  return {
    sectionCount: sections.length,
    itemCount: allItems.length,
    ready,
    blocked,
    inProgress,
    notStarted,
    blockingOpen,
  };
}