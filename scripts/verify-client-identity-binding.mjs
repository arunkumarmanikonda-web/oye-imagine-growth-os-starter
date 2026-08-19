import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
let failures = 0

function read(path) {
  const full = resolve(root, path)
  if (!existsSync(full)) {
    fail(`${path} is missing`)
    return ''
  }
  return readFileSync(full, 'utf8')
}

function fail(message) {
  failures += 1
  console.error(`FAIL ${message}`)
}

function pass(message) {
  console.log(`OK   ${message}`)
}

function mustContain(path, needles) {
  const text = read(path)
  for (const needle of needles) {
    if (!text.includes(needle)) fail(`${path} must contain ${JSON.stringify(needle)}`)
    else pass(`${path} contains ${JSON.stringify(needle)}`)
  }
  return text
}

function mustNotContain(path, needles) {
  const text = read(path)
  for (const needle of needles) {
    if (text.includes(needle)) fail(`${path} must not contain ${JSON.stringify(needle)}`)
    else pass(`${path} excludes ${JSON.stringify(needle)}`)
  }
  return text
}

function walk(path) {
  const full = resolve(root, path)
  if (!existsSync(full)) return []
  const output = []
  for (const name of readdirSync(full)) {
    const child = `${path}/${name}`
    const stat = statSync(resolve(root, child))
    if (stat.isDirectory()) output.push(...walk(child))
    else output.push(child)
  }
  return output
}

const publicMarketplaceAi = 'src/app/api/marketplace/ai/route.ts'
mustContain(publicMarketplaceAi, ['buildPublicMarketplaceResponse', "'Cache-Control': 'public"])
mustNotContain(publicMarketplaceAi, ['workspaceKey', 'buildAiMarketplaceResponse', 'getClientFinanceWorkspace', "surface')", 'registrySummary'])

for (const [path, publicScope] of [
  ['src/app/api/marketplace/concierge/search/route.ts', 'buildPublicMarketplaceConciergeScope'],
  ['src/app/api/marketplace/concierge/experience/route.ts', 'buildPublicMarketplaceConciergeScope'],
  ['src/app/api/support/concierge/experience/route.ts', 'buildPublicSupportConciergeScope'],
  ['src/app/support/center/page.tsx', 'buildPublicSupportConciergeScope'],
]) {
  mustContain(path, [publicScope])
  mustNotContain(path, ['buildDemoClientConciergeScope', 'buildDemoMarketplaceConciergeScope', 'buildDemoAdminConciergeScope'])
}

const sharedContext = 'src/lib/client/client-surface-context.ts'
mustContain(sharedContext, [
  "requireWorkspaceIdentity({ lane: 'client'",
  'membership.metadata?.demoAccount === true',
  'buildVerifiedClientConciergeScope',
])

const clientApiRoutes = [
  'src/app/api/client/commercial/dashboard/route.ts',
  'src/app/api/client/commercial/media-funding/route.ts',
  'src/app/api/client/finance/route.ts',
  'src/app/api/client/concierge/route.ts',
  'src/app/api/client/concierge/search/route.ts',
  'src/app/api/client/concierge/experience/route.ts',
]
for (const path of clientApiRoutes) {
  mustContain(path, ["requireApiAccess({ lane: 'client'"])
}

for (const path of [
  'src/app/api/client/commercial/dashboard/route.ts',
  'src/app/api/client/finance/route.ts',
]) {
  mustContain(path, ['clientMembershipIsDemo', "mode: 'verified_membership'", "mode: 'authenticated_demo_fixture'"])
}
mustNotContain('src/app/api/client/finance/route.ts', ['resolveAuthorizedFinanceWorkspaceKey', "get('workspaceKey')"])

for (const path of [
  'src/app/api/client/concierge/route.ts',
  'src/app/api/client/concierge/search/route.ts',
  'src/app/api/client/concierge/experience/route.ts',
]) {
  mustContain(path, ['buildVerifiedClientConciergeScope'])
  mustNotContain(path, ['buildDemoClientConciergeScope', 'buildDemoAdminConciergeScope', "'admin'"])
}

const clientPages = [
  'src/app/client/page.tsx',
  'src/app/client/concierge/page.tsx',
  'src/app/client/finance/page.tsx',
  'src/app/client/commercial/page.tsx',
  'src/app/client/commercial/payments/page.tsx',
  'src/app/client/agreements/page.tsx',
  'src/app/client/agreements/execution/page.tsx',
  'src/app/client/billing/page.tsx',
]
for (const path of clientPages) mustContain(path, ['requireClientSurfaceContext'])

for (const path of [
  'src/app/client/finance/page.tsx',
  'src/app/client/commercial/page.tsx',
  'src/app/client/commercial/payments/page.tsx',
  'src/app/client/agreements/page.tsx',
  'src/app/client/agreements/execution/page.tsx',
  'src/app/client/billing/page.tsx',
]) {
  mustContain(path, ['context.isDemo'])
}

for (const path of walk('src/app/client')) {
  if (!path.endsWith('.ts') && !path.endsWith('.tsx')) continue
  const text = read(path)
  if (text.includes("@/lib/client-auth")) fail(`${path} imports legacy hard-coded client-auth context`)
  if (text.includes('workspace_neejee_primary')) fail(`${path} contains legacy hard-coded workspace_neejee_primary`)
}

const registry = read('src/lib/ai/concierge-retrieval-registry.ts')
if (!registry.includes("tenantId:'global'")) fail('public concierge scopes must use global tenant scope')
else pass('public concierge scopes use global tenant scope')

if (failures > 0) {
  console.error(`\nClient identity binding verification failed with ${failures} issue(s).`)
  process.exit(1)
}

console.log('\nPASS client identity binding contract')
