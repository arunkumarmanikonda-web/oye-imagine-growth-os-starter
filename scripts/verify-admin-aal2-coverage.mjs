import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const adminApiRoot = path.join(repoRoot, 'src', 'app', 'api', 'admin')
const centralGate = path.join(repoRoot, 'src', 'lib', 'auth', 'api-access.ts')
const adminBoundary = path.join(repoRoot, 'src', 'proxy.ts')
const legacyHelper = path.join(repoRoot, 'src', 'lib', 'admin-auth.ts')
const failures = []

function walk(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap((entry)=>entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)])
}

const routes = walk(adminApiRoot).filter((file)=>file.endsWith(`${path.sep}route.ts`))
const forbidden = [/@\/lib\/admin-auth/, /authorizeAdminRequest\s*\(/, /x-oi-admin-key/i, /OI_ADMIN_KEY/, /ADMIN_API_KEY/]
for (const route of routes) {
  const source = fs.readFileSync(route,'utf8')
  for (const pattern of forbidden) if (pattern.test(source)) failures.push(`${path.relative(repoRoot,route)} contains forbidden legacy admin authorization marker ${pattern}`)
}

if (fs.existsSync(legacyHelper)) failures.push('src/lib/admin-auth.ts still exists')
if (!fs.existsSync(adminBoundary)) failures.push('src/proxy.ts admin security boundary is missing')
else {
  const source = fs.readFileSync(adminBoundary,'utf8')
  const required = ["matcher: ['/api/admin/:path*']", 'getClaims()', 'getAuthenticatorAssuranceLevel()', "currentLevel !== 'aal2'", "membershipAllowsLane(membership, 'admin')", "'mfa_required'", "'access_denied'"]
  for (const marker of required) if (!source.includes(marker)) failures.push(`admin proxy boundary is missing required security marker: ${marker}`)
}

if (!fs.existsSync(centralGate)) failures.push('central API access gate is missing')
else {
  const source = fs.readFileSync(centralGate,'utf8')
  if (!source.includes("lane === 'admin'") || !source.includes('aal2') || !source.includes('mfa_required')) failures.push('central route-level API gate does not fail closed on admin AAL2')
}
if (!routes.length) failures.push('no admin API routes discovered')

if (failures.length) {
  console.error('Admin AAL2 coverage verification failed.')
  failures.forEach((failure)=>console.error(`- ${failure}`))
  process.exit(1)
}
const direct = routes.filter((route)=>fs.readFileSync(route,'utf8').includes('@/lib/auth/api-access')).length
console.log(`Admin AAL2 coverage verified across ${routes.length} admin API route(s): shared AAL2/admin-membership boundary active, ${direct} route(s) also apply direct permission-aware API gating, zero legacy static-secret markers.`)
