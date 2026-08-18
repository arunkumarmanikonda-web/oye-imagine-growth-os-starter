import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const failures = []

function expect(condition, message) {
  if (!condition) failures.push(message)
}

function exists(relativePath) {
  return fs.existsSync(path.join(repoRoot, relativePath))
}

function read(relativePath) {
  const absolute = path.join(repoRoot, relativePath)
  expect(fs.existsSync(absolute), `${relativePath}: required governed surface is missing.`)
  return fs.existsSync(absolute) ? fs.readFileSync(absolute, 'utf8') : ''
}

const forbiddenRoutes = [
  'src/app/api/test/email/route.ts',
  'src/app/api/test/sms/route.ts',
  'src/app/api/test/whatsapp/route.ts',
  'src/app/api/bootstrap/admin/route.ts',
  'src/app/api/bootstrap/seed/route.ts',
  'src/app/api/bootstrap/neejee-seed/route.ts',
  'src/app/api/setup/check/route.ts',
  'src/app/api/commercial/agreement-signup/route.ts',
  'src/app/api/commercial/agreement-execution/route.ts',
  'src/app/api/commercial/invoice-preview/route.ts',
  'src/app/api/commercial/ledger-snapshot/route.ts',
  'src/app/api/public/submissions/route.ts',
  'src/app/api/seller/application/route.ts',
]

for (const route of forbiddenRoutes) {
  expect(!exists(route), `${route}: retired public diagnostic/bootstrap/recovery route must not be deployed.`)
}

expect(!exists('src/lib/setup-status.ts'), 'src/lib/setup-status.ts: secret-presence setup helper must not remain deployable.')

const proxy = read('src/proxy.ts')
const lifecycleSend = read('src/app/api/admin/lifecycle/send/route.ts')
const providerReadiness = read('src/app/api/admin/integrations/readiness/route.ts')
const releaseStatus = read('src/app/api/admin/release-status/route.ts')

expect(proxy.includes("'/api/admin/:path*'"), 'Proxy must continue protecting all /api/admin routes.')
expect(lifecycleSend.includes("requireApiAccess({lane:'admin'})") || lifecycleSend.includes("requireApiAccess({ lane: 'admin' })"), 'Governed lifecycle send route must require verified admin access.')
expect(providerReadiness.includes("requireApiAccess({") && providerReadiness.includes("lane: 'admin'"), 'Provider readiness route must require verified admin access.')
expect(releaseStatus.includes("requireApiAccess({ lane: 'admin' })"), 'Release status route must require verified admin access.')
expect(releaseStatus.includes("role_key !== 'platform_owner'"), 'Release status route must remain platform-owner restricted.')

const apiRoot = path.join(repoRoot, 'src', 'app', 'api')
const forbiddenMarkers = [
  'BOOTSTRAP_SECRET',
  'sendResendEmail',
  'sendFast2Sms',
  'sendAiSensyCampaign',
]

function walk(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const target = path.join(dir, entry.name)
    if (entry.isDirectory()) return walk(target)
    return entry.isFile() && /\.(ts|tsx|js|mjs)$/.test(entry.name) ? [target] : []
  })
}

for (const file of walk(apiRoot)) {
  const relative = path.relative(repoRoot, file).replaceAll('\\', '/')
  const source = fs.readFileSync(file, 'utf8')
  if (relative.startsWith('src/app/api/admin/')) continue
  for (const marker of forbiddenMarkers) {
    expect(!source.includes(marker), `${relative}: public/non-admin API contains forbidden privileged marker ${marker}.`)
  }
}

if (failures.length) {
  console.error('Production surface lockdown verification failed.')
  failures.forEach(failure => console.error(`- ${failure}`))
  process.exit(1)
}

console.log('Production surface lockdown verified: legacy test-send/bootstrap/setup/recovery routes are absent, privileged provider actions remain under verified /api/admin boundaries, and no public API directly references bootstrap secrets or raw provider send adapters.')
