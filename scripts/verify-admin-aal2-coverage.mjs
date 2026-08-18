import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const adminApiRoot = path.join(repoRoot, 'src', 'app', 'api', 'admin')
const centralGate = path.join(repoRoot, 'src', 'lib', 'auth', 'api-access.ts')
const workspaceGate = path.join(repoRoot, 'src', 'lib', 'auth', 'workspace-access.ts')
const loginRoute = path.join(repoRoot, 'src', 'app', 'api', 'auth', 'login', 'route.ts')
const adminLayout = path.join(repoRoot, 'src', 'app', 'admin', 'layout.tsx')
const sessionBoundary = path.join(repoRoot, 'src', 'lib', 'supabase', 'middleware.ts')
const proxyPath = path.join(repoRoot, 'src', 'proxy.ts')
const deprecatedMiddleware = path.join(repoRoot, 'src', 'middleware.ts')
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
if (fs.existsSync(deprecatedMiddleware)) failures.push('src/middleware.ts still exists; Next.js 16 proxy boundary must be authoritative')
if (!fs.existsSync(proxyPath)) failures.push('src/proxy.ts is missing')
else {
  const source = fs.readFileSync(proxyPath,'utf8')
  if (!source.includes("'/api/admin/:path*'")) failures.push('proxy matcher does not cover all admin APIs')
  if (!source.includes('updateSession(request)')) failures.push('proxy does not delegate to the verified session boundary')
}
if (!fs.existsSync(sessionBoundary)) failures.push('Supabase session boundary is missing')
else {
  const source = fs.readFileSync(sessionBoundary,'utf8')
  const required = ["isAdmin || membershipRequiresMfa(membership)", "currentLevel !== 'aal2'", "apiError('mfa_required', 403)", "selectMembershipForLane(memberships, 'admin')"]
  for (const marker of required) if (!source.includes(marker)) failures.push(`session boundary is missing required admin security marker: ${marker}`)
}
if (!fs.existsSync(centralGate)) failures.push('central route-level API access gate is missing')
else {
  const source = fs.readFileSync(centralGate,'utf8')
  if (!source.includes("lane === 'admin'") || !source.includes('aal2') || !source.includes('mfa_required')) failures.push('central route-level API gate does not fail closed on admin AAL2')
}
if (!fs.existsSync(workspaceGate)) failures.push('server-rendered workspace identity gate is missing')
else {
  const source = fs.readFileSync(workspaceGate,'utf8')
  const required = [
    'workspaceIdentityRequiresAal2',
    "lane === 'admin' || membershipRequiresMfa(membership)",
    "aalData.currentLevel === 'aal2'",
    "redirect(`/auth/mfa?redirect=${encodeURIComponent(destination)}` as Route)",
  ]
  for (const marker of required) if (!source.includes(marker)) failures.push(`workspace identity gate is missing required admin security marker: ${marker}`)
}
if (!fs.existsSync(loginRoute)) failures.push('password login route is missing')
else {
  const source = fs.readFileSync(loginRoute,'utf8')
  const required = [
    "const lane = membershipLane(membership)",
    "lane === 'admin' || membershipRequiresMfa(membership)",
    "aalData.currentLevel !== 'aal2'",
    'return mfaRedirect(request, destination)',
  ]
  for (const marker of required) if (!source.includes(marker)) failures.push(`login route is missing required admin AAL2 marker: ${marker}`)
}
if (!fs.existsSync(adminLayout)) failures.push('admin layout is missing')
else {
  const source = fs.readFileSync(adminLayout,'utf8')
  if (!source.includes("requireWorkspaceIdentity({ lane: 'admin'")) failures.push('admin layout does not bind server-rendered pages to the admin workspace identity gate')
}
if (!routes.length) failures.push('no admin API routes discovered')

if (failures.length) {
  console.error('Admin AAL2 coverage verification failed.')
  failures.forEach((failure)=>console.error(`- ${failure}`))
  process.exit(1)
}
const direct = routes.filter((route)=>fs.readFileSync(route,'utf8').includes('@/lib/auth/api-access')).length
console.log(`Admin AAL2 coverage verified across password sign-in, ${routes.length} admin API route(s), proxy/session boundary, and server-rendered admin layout: admin lane always requires AAL2; ${direct} route(s) add direct permission-aware gating; zero legacy static-secret markers.`)
