import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const adminApiRoot = path.join(repoRoot, 'src', 'app', 'api', 'admin')
const centralGate = path.join(repoRoot, 'src', 'lib', 'auth', 'api-access.ts')
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
  const usesCentralGate = source.includes('@/lib/auth/api-access') || source.includes('requireApiAccess(')
  if (!usesCentralGate) failures.push(`${path.relative(repoRoot,route)} does not reference the central API access gate`)
}

if (fs.existsSync(legacyHelper)) failures.push('src/lib/admin-auth.ts still exists; legacy static-secret/session authorization must not coexist with the AAL2 admin gate')
if (!fs.existsSync(centralGate)) failures.push('central API access gate is missing')
else {
  const source = fs.readFileSync(centralGate,'utf8')
  if (!source.includes("lane === 'admin'") || !source.includes('aal2')) failures.push('central API access gate does not visibly fail closed on admin AAL2')
  if (!source.includes('mfa_required')) failures.push('central API access gate does not expose the expected MFA-required denial state')
}

if (!routes.length) failures.push('no admin API routes discovered')

if (failures.length) {
  console.error('Admin AAL2 coverage verification failed.')
  failures.forEach((failure)=>console.error(`- ${failure}`))
  process.exit(1)
}
console.log(`Admin AAL2 coverage verified across ${routes.length} admin API route(s); legacy static-secret authorization surface is absent.`)
