export type WorkspaceLane = 'admin' | 'client'

export type RoleExperience = {
  key: string
  label: string
  shortLabel: string
  lane: WorkspaceLane
  requiresMfa: boolean
  headline: string
  description: string
  accent: 'yellow' | 'pink' | 'ink' | 'mint'
  nav: Array<{ label: string; href: string; glyph: string }>
  quickActions: Array<{ label: string; href: string; detail: string }>
}

const experiences: Record<string, RoleExperience> = {
  platform_owner: {
    key: 'platform_owner', label: 'Super User', shortLabel: 'Super User', lane: 'admin', requiresMfa: true, accent: 'yellow',
    headline: 'Everything important, in one operating view.',
    description: 'Platform control, tenants, growth execution, AI, commercial governance and trust operations.',
    nav: [
      { label: 'Command center', href: '/workspace', glyph: '✦' },
      { label: 'Access control', href: '/admin/access-control', glyph: '◉' },
      { label: 'Platform config', href: '/admin/config', glyph: '⚙' },
      { label: 'Brand intelligence', href: '/admin/brand-intelligence', glyph: '◎' },
      { label: 'Creative studio', href: '/admin/creative', glyph: '◐' },
      { label: 'Growth execution', href: '/admin/execution-plan', glyph: '↗' },
      { label: 'Integrations', href: '/admin/integrations', glyph: '⌘' },
      { label: 'Commercial', href: '/admin/commercial', glyph: '₹' },
      { label: 'Marketplace', href: '/admin/marketplace', glyph: '◇' },
      { label: 'AI agents', href: '/admin/agents', glyph: '✺' },
      { label: 'Privacy', href: '/admin/privacy', glyph: '◈' },
    ],
    quickActions: [
      { label: 'Manage access', href: '/admin/access-control', detail: 'Users, roles and granular permissions' },
      { label: 'Configure providers', href: '/admin/config', detail: 'Keys, routes and platform capabilities' },
      { label: 'Create campaign', href: '/admin/execution-plan', detail: 'Strategy to governed execution' },
      { label: 'Generate creative', href: '/admin/creative', detail: 'Images, copy and video jobs' },
    ],
  },
  tenant_admin: {
    key: 'tenant_admin', label: 'Client Administrator', shortLabel: 'Admin', lane: 'admin', requiresMfa: true, accent: 'yellow',
    headline: 'Your brand growth team, organised around outcomes.',
    description: 'Manage the brand, people, approvals, campaigns, content, reporting and account controls.',
    nav: [
      { label: 'Home', href: '/workspace', glyph: '✦' },
      { label: 'Brand', href: '/admin/brand-intelligence', glyph: '◎' },
      { label: 'Creative', href: '/admin/creative', glyph: '◐' },
      { label: 'Campaigns', href: '/admin/execution-plan', glyph: '↗' },
      { label: 'Integrations', href: '/admin/integrations', glyph: '⌘' },
      { label: 'Commercial', href: '/admin/commercial', glyph: '₹' },
    ],
    quickActions: [
      { label: 'Launch a growth brief', href: '/admin/execution-plan', detail: 'Build the next governed campaign' },
      { label: 'Open creative studio', href: '/admin/creative', detail: 'Create channel-ready assets' },
      { label: 'Review integrations', href: '/admin/integrations', detail: 'See connected data and channels' },
    ],
  },
  account_manager: {
    key: 'account_manager', label: 'Account Manager', shortLabel: 'Account', lane: 'admin', requiresMfa: true, accent: 'pink',
    headline: 'Client momentum without the operational noise.',
    description: 'Coordinate briefs, approvals, delivery, reporting and specialist work from one place.',
    nav: [
      { label: 'Home', href: '/workspace', glyph: '✦' },
      { label: 'Brand', href: '/admin/brand-intelligence', glyph: '◎' },
      { label: 'Campaigns', href: '/admin/execution-plan', glyph: '↗' },
      { label: 'Creative', href: '/admin/creative', glyph: '◐' },
      { label: 'Marketplace', href: '/admin/marketplace', glyph: '◇' },
    ],
    quickActions: [
      { label: 'Create client brief', href: '/admin/execution-plan', detail: 'Turn the objective into a plan' },
      { label: 'Review creative', href: '/admin/creative', detail: 'Move assets through approval' },
      { label: 'Open specialist work', href: '/admin/marketplace', detail: 'Coordinate partner delivery' },
    ],
  },
  brand_manager: {
    key: 'brand_manager', label: 'Brand Manager', shortLabel: 'Brand', lane: 'admin', requiresMfa: true, accent: 'pink',
    headline: 'Keep every output unmistakably on brand.',
    description: 'Own brand truth, creative direction, content quality, approvals and campaign consistency.',
    nav: [
      { label: 'Home', href: '/workspace', glyph: '✦' },
      { label: 'Brand intelligence', href: '/admin/brand-intelligence', glyph: '◎' },
      { label: 'Creative studio', href: '/admin/creative', glyph: '◐' },
      { label: 'Content', href: '/admin/content', glyph: '≋' },
      { label: 'Campaigns', href: '/admin/execution-plan', glyph: '↗' },
    ],
    quickActions: [
      { label: 'Refresh brand truth', href: '/admin/brand-intelligence', detail: 'Update what AI may rely on' },
      { label: 'Create assets', href: '/admin/creative', detail: 'Build a branded asset family' },
      { label: 'Review content', href: '/admin/content', detail: 'Approve what moves forward' },
    ],
  },
  designer: {
    key: 'designer', label: 'Designer / Creative', shortLabel: 'Creative', lane: 'admin', requiresMfa: true, accent: 'pink',
    headline: 'A creative desk that already knows the brand.',
    description: 'Generate, refine, version and hand off campaign assets without losing provenance or approvals.',
    nav: [
      { label: 'Creative home', href: '/workspace', glyph: '✦' },
      { label: 'Creative studio', href: '/admin/creative', glyph: '◐' },
      { label: 'Content', href: '/admin/content', glyph: '≋' },
      { label: 'Brand intelligence', href: '/admin/brand-intelligence', glyph: '◎' },
    ],
    quickActions: [
      { label: 'Generate image set', href: '/admin/creative', detail: 'Create platform-ready variants' },
      { label: 'Prepare campaign assets', href: '/admin/creative', detail: 'Group derivatives under one concept' },
      { label: 'Check brand truth', href: '/admin/brand-intelligence', detail: 'Ground the next creative direction' },
    ],
  },
  digital_marketer: {
    key: 'digital_marketer', label: 'Digital Marketer', shortLabel: 'Growth', lane: 'admin', requiresMfa: true, accent: 'yellow',
    headline: 'Plan, launch and learn from one growth cockpit.',
    description: 'Campaign planning, paid media, analytics, content, channel connections and guarded optimisation.',
    nav: [
      { label: 'Growth home', href: '/workspace', glyph: '✦' },
      { label: 'Campaigns', href: '/admin/execution-plan', glyph: '↗' },
      { label: 'Google Ads', href: '/admin/google-ads', glyph: 'G' },
      { label: 'Creative', href: '/admin/creative', glyph: '◐' },
      { label: 'Integrations', href: '/admin/integrations', glyph: '⌘' },
      { label: 'Campaign summary', href: '/admin/campaign-summary', glyph: '≋' },
    ],
    quickActions: [
      { label: 'Draft campaign', href: '/admin/execution-plan', detail: 'Build a governed channel plan' },
      { label: 'Open Google Ads', href: '/admin/google-ads', detail: 'Draft and manage approved work' },
      { label: 'Read performance', href: '/admin/campaign-summary', detail: 'See evidence and next actions' },
    ],
  },
  content_approver: {
    key: 'content_approver', label: 'Content Approver', shortLabel: 'Approver', lane: 'admin', requiresMfa: true, accent: 'mint',
    headline: 'Review what matters. Approve with context.',
    description: 'See the brand evidence, creative lineage and publishing intent before anything moves forward.',
    nav: [
      { label: 'Review home', href: '/workspace', glyph: '✦' },
      { label: 'Content', href: '/admin/content', glyph: '≋' },
      { label: 'Creative', href: '/admin/creative', glyph: '◐' },
      { label: 'Brand intelligence', href: '/admin/brand-intelligence', glyph: '◎' },
    ],
    quickActions: [
      { label: 'Review creative', href: '/admin/creative', detail: 'Approve or return assets' },
      { label: 'Review content', href: '/admin/content', detail: 'Check messaging and provenance' },
    ],
  },
  finance_approver: {
    key: 'finance_approver', label: 'Finance Approver', shortLabel: 'Finance', lane: 'admin', requiresMfa: true, accent: 'mint',
    headline: 'Commercial control before money moves.',
    description: 'Review invoices, subscriptions, media balances and financial approvals in a fail-closed workspace.',
    nav: [
      { label: 'Finance home', href: '/workspace', glyph: '✦' },
      { label: 'Commercial', href: '/admin/commercial', glyph: '₹' },
      { label: 'Privacy & controls', href: '/admin/privacy', glyph: '◈' },
    ],
    quickActions: [
      { label: 'Review commercial state', href: '/admin/commercial', detail: 'Invoices, balances and approvals' },
    ],
  },
  analyst: {
    key: 'analyst', label: 'Analyst', shortLabel: 'Analytics', lane: 'admin', requiresMfa: true, accent: 'mint',
    headline: 'Evidence first. Every number with a source.',
    description: 'Read campaign, revenue and integration freshness without gaining mutation authority.',
    nav: [
      { label: 'Insights home', href: '/workspace', glyph: '✦' },
      { label: 'Campaign summary', href: '/admin/campaign-summary', glyph: '≋' },
      { label: 'Integrations', href: '/admin/integrations', glyph: '⌘' },
    ],
    quickActions: [
      { label: 'Open campaign summary', href: '/admin/campaign-summary', detail: 'Review evidence and freshness' },
      { label: 'Check data sources', href: '/admin/integrations', detail: 'Inspect connection state' },
    ],
  },
  partner_specialist: {
    key: 'partner_specialist', label: 'Partner / Specialist', shortLabel: 'Partner', lane: 'admin', requiresMfa: true, accent: 'pink',
    headline: 'The work you are assigned. Nothing you are not.',
    description: 'A scoped specialist workspace for briefs, deliverables, proposals and governed collaboration.',
    nav: [
      { label: 'Partner home', href: '/workspace', glyph: '✦' },
      { label: 'Marketplace', href: '/admin/marketplace', glyph: '◇' },
      { label: 'Creative', href: '/admin/creative', glyph: '◐' },
    ],
    quickActions: [
      { label: 'Open assignments', href: '/admin/marketplace', detail: 'Review scoped client work' },
      { label: 'Open creative desk', href: '/admin/creative', detail: 'Work only inside assigned scope' },
    ],
  },
  client_operator: {
    key: 'client_operator', label: 'Client Operator', shortLabel: 'Client', lane: 'client', requiresMfa: false, accent: 'yellow',
    headline: 'Your growth picture, without the agency maze.',
    description: 'See what is planned, what needs approval, what is live and what is changing next.',
    nav: [
      { label: 'Home', href: '/workspace', glyph: '✦' },
      { label: 'Client dashboard', href: '/client', glyph: '◎' },
      { label: 'Finance', href: '/client/finance', glyph: '₹' },
    ],
    quickActions: [
      { label: 'Open client dashboard', href: '/client', detail: 'Review active work and outcomes' },
      { label: 'Review finance', href: '/client/finance', detail: 'See commercial state in scope' },
    ],
  },
  viewer: {
    key: 'viewer', label: 'Viewer', shortLabel: 'Viewer', lane: 'client', requiresMfa: false, accent: 'ink',
    headline: 'A clear read-only view of the work.',
    description: 'See approved brand, creative and reporting surfaces without change authority.',
    nav: [
      { label: 'Home', href: '/workspace', glyph: '✦' },
      { label: 'Client dashboard', href: '/client', glyph: '◎' },
    ],
    quickActions: [{ label: 'Open client dashboard', href: '/client', detail: 'Review approved information' }],
  },
}

const priority = ['platform_owner','tenant_admin','account_manager','brand_manager','digital_marketer','designer','finance_approver','content_approver','analyst','partner_specialist','client_operator','viewer']

export function getRoleExperience(roleKey: string): RoleExperience {
  return experiences[roleKey] ?? experiences.viewer
}

export function roleLane(roleKey: string): WorkspaceLane {
  return getRoleExperience(roleKey).lane
}

export function roleRequiresMfa(roleKey: string) {
  return getRoleExperience(roleKey).requiresMfa
}

export function rolePriority(roleKey: string) {
  const index = priority.indexOf(roleKey)
  return index === -1 ? priority.length : index
}

export function roleIsInternalOperator(roleKey: string) {
  return roleLane(roleKey) === 'admin'
}

export const supportedRoleKeys = Object.freeze(Object.keys(experiences))
