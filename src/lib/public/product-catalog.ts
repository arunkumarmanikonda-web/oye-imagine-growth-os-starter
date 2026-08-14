export const growthLoop = ['Understand', 'Imagine', 'Create', 'Approve', 'Launch', 'Learn', 'Grow'] as const

export const platformModules = [
  { name: 'Brand Intelligence', body: 'Canonical brand, audience, offer, language and provenance context before strategy or generation.' },
  { name: 'Strategy & Planning', body: 'Audits, competitor context, channel priorities, content plans and governed strategy artifacts.' },
  { name: 'Creative Asset Platform', body: 'Private tenant asset libraries, image/video generation jobs, versions, rights, approvals and channel derivatives.' },
  { name: 'Paid Media', body: 'Campaign drafting, approval-bound execution architecture, budget guardrails and channel activation.' },
  { name: 'SEO & AI Search', body: 'Technical/content SEO, structured search briefs, AEO/GEO planning and measured publishing loops.' },
  { name: 'Lifecycle', body: 'Email, WhatsApp, SMS and social journey foundations designed around consent and verified delivery.' },
  { name: 'Analytics & Attribution', body: 'KPI, reporting, source freshness, attribution and optimization layers designed to separate real data from unavailable data.' },
  { name: 'Commercial OS', body: 'Contracts, invoices, approvals, media balances, ledger controls and subscription state with high-risk mutations kept governed.' },
  { name: 'AI & Agents', body: 'Provider-neutral model routing, persistent usage/cost governance, brand-grounded workflows and bounded tool execution.' },
  { name: 'Marketplace & Managed Delivery', body: 'Specialist services, operator workspaces and managed delivery connected to the same tenant and audit model.' },
] as const

export const editions = [
  { name: 'Starter', forWhom: 'Emerging brands building a governed growth foundation.', includes: ['Brand/workspace foundation', 'Strategy and content planning', 'Core reporting', 'Controlled AI assistance'], commercial: 'From ₹14,900/month' },
  { name: 'Growth', forWhom: 'Growing businesses adding acquisition, SEO and lifecycle operations.', includes: ['Starter capabilities', 'Paid-media workflows', 'SEO/AEO planning', 'Lifecycle automation foundations'], commercial: '₹34,900/month' },
  { name: 'Commerce', forWhom: 'E-commerce brands requiring catalogue, revenue and creative operating loops.', includes: ['Growth capabilities', 'Commerce/revenue evidence', 'Creative asset operations', 'Conversion and attribution workflows'], commercial: '₹69,900/month' },
  { name: 'Agency', forWhom: 'Agencies and multi-client operators needing separated workspaces and approvals.', includes: ['Multi-client workspaces', 'Operator queues', 'Client reporting', 'Approval and commercial controls'], commercial: '₹99,900/month' },
  { name: 'Enterprise', forWhom: 'Larger organizations requiring deeper identity, governance and assurance.', includes: ['Enterprise governance', 'Advanced role controls', 'Audit and evidence workflows', 'Custom integration architecture'], commercial: 'From ₹149,900/month' },
  { name: 'Managed', forWhom: 'Brands that want Oye !magine specialists to operate the system with them.', includes: ['Platform access', 'Managed growth delivery', 'Specialist marketplace', 'Operator/client collaboration'], commercial: 'From ₹199,900/month' },
  { name: 'White Label', forWhom: 'Partners delivering the operating system under their own customer experience.', includes: ['Tenant branding architecture', 'Partner operating model', 'Scoped reports and experiences', 'Custom commercial design'], commercial: 'From ₹249,900/month' },
] as const

export const solutionGroups = [
  { title: 'E-commerce', body: 'Connect brand truth, product discovery, creative, acquisition, revenue evidence and controlled optimization.', href: '/customers/neejee' },
  { title: 'SME Growth', body: 'Replace fragmented tools with one governed operating loop for strategy, campaigns, reporting and commercial visibility.', href: '/contact' },
  { title: 'Enterprise', body: 'Add role controls, approvals, auditability, private data boundaries and evidence-led operating governance.', href: '/trust' },
  { title: 'Agencies', body: 'Run separated client workspaces, operator queues, approvals, reports and specialist delivery from one platform.', href: '/marketplace' },
  { title: 'Managed Growth', body: 'Combine the platform with accountable specialists and managed execution without losing the audit trail.', href: '/marketplace' },
  { title: 'White Label', body: 'Deploy the operating model for partner-led customer experiences with explicit tenant and branding boundaries.', href: '/contact' },
] as const

export const integrationFamilies = [
  { family: 'AI intelligence', examples: 'Reasoning · research · generation · embeddings', state: 'Oye routes each task through the best approved internal capability and keeps the underlying technology abstracted from client workflows.' },
  { family: 'Creative generation', examples: 'Images · video · audio · derivatives', state: 'Generation, storage, provenance and approval happen inside the Oye creative operating layer before any asset can move outward.' },
  { family: 'Paid media', examples: 'Search · social · professional networks', state: 'Channel connection, campaign objects, spend and readback are evidence-gated. Oye never represents an unverified connection as live.' },
  { family: 'Analytics & search', examples: 'Traffic · conversion · search visibility · revenue evidence', state: 'Connected data is normalized into Oye facts with source identity, freshness and lineage before it is used for reports or recommendations.' },
  { family: 'Lifecycle', examples: 'Email · WhatsApp · SMS · notifications', state: 'Delivery routes remain consent-aware, approval-aware and account-specific while the customer experience remains entirely Oye !magine.' },
  { family: 'Commercial', examples: 'Payments · recurring mandates · eSign · invoicing', state: 'Commercial activation follows signed scope, payment evidence, invoice state and the configured legal/finance approval chain.' },
] as const

export const trustControls = [
  { title: 'Verified identity', body: 'Protected application routes use verified identity and active membership rather than caller-selected admin/client authority.' },
  { title: 'Privileged MFA boundary', body: 'Privileged page and API namespaces require higher assurance before access is granted.' },
  { title: 'Tenant isolation', body: 'Public database tables are RLS-enabled by default; sensitive server-owned tables fail closed without explicit policies.' },
  { title: 'Private creative storage', body: 'Oye corporate assets and every client asset library live in private buckets. New tenant registration provisions a dedicated client bucket.' },
  { title: 'Commercial containment', body: 'Irreversible contract, invoice, subscription and media-balance mutation routes remain approval-bound until their acceptance gates are satisfied.' },
  { title: 'Release evidence', body: 'Production builds validate a schema contract and generate a release manifest tied to Git and migration state.' },
] as const

export const neejeePilot = {
  title: 'Neejee controlled commerce pilot',
  intro: 'Neejee is used to prove Oye !magine against a real founder-curated craft discovery and commerce business rather than a synthetic vertical.',
  truths: [
    'Founder-curated craft discovery and commerce',
    'Provenance across makers, regions, techniques and materials',
    'Category-flexible across textiles, jewellery, accessories, home/craft objects and gifting',
    'Shopping/discovery experiences including Mirror, Space and Concierge',
  ],
  proofLoop: ['Canonical brand truth', 'Website/catalogue understanding', 'Strategy', 'Creative/content', 'Landing/SEO', 'Human approval', 'Connected-channel execution', 'Analytics and commerce evidence', 'Reconciliation', 'Next recommendation'],
  disclosure: 'This is a controlled pilot story. Oye !magine does not publish fabricated performance results or describe an external channel as live before execution evidence exists.',
} as const
