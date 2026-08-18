import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const migrationsDir = path.join(repoRoot, 'supabase', 'migrations')
const targets = {
  readiness: path.join(repoRoot, 'src', 'lib', 'release', 'readiness.ts'),
  route: path.join(repoRoot, 'src', 'app', 'api', 'admin', 'release-status', 'route.ts'),
  cockpit: path.join(repoRoot, 'src', 'app', 'admin', 'release-readiness', 'page.tsx'),
  migration: path.join(migrationsDir, '20260818190000_release_schema_evidence.sql'),
  checklist: path.join(repoRoot, 'docs', 'launch', 'production-activation-checklist.md'),
  proof: path.join(repoRoot, 'docs', 'proof', 'p0', 'P0-013-production-parity-release-readiness-2026-08-18.json'),
}

const failures = []
function expect(condition, message) { if (!condition) failures.push(message) }
function read(key) {
  const file = targets[key]
  expect(fs.existsSync(file), `${key}: required file is missing`)
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : ''
}

const migrations = fs.readdirSync(migrationsDir).filter(file => file.endsWith('.sql')).sort()
const readiness = read('readiness')
const route = read('route')
const cockpit = read('cockpit')
const migration = read('migration')
const checklist = read('checklist')
const proof = JSON.parse(read('proof') || '{}')

expect(migrations.length === 93, `Expected 93 source migrations, found ${migrations.length}.`)
expect(migrations.at(-1) === '20260818190000_release_schema_evidence.sql', `Unexpected migration tail: ${migrations.at(-1)}`)
expect(readiness.includes('migrationFileCount: 93'), 'Runtime release expectation is not pinned to 93 migrations.')
expect(readiness.includes("lastSourceFile: '20260818190000_release_schema_evidence.sql'"), 'Runtime release expectation has the wrong migration tail.')
expect(readiness.includes("lastProductionMigrationName: 'release_schema_evidence'"), 'Runtime release expectation has the wrong production migration name.')

expect(migration.includes('language plpgsql'), 'Release schema evidence RPC must use capability-aware PL/pgSQL.')
expect(migration.includes('security definer'), 'Release schema evidence RPC must be SECURITY DEFINER.')
expect(migration.includes('set search_path = pg_catalog, public'), 'Release schema evidence RPC must use a fixed safe search path.')
expect(migration.includes("to_regclass('supabase_migrations.schema_migrations') is null"), 'Release schema evidence RPC must detect a missing Supabase migration ledger without failing function creation.')
expect(migration.includes("'ledgerAvailable', false"), 'Portable fallback must explicitly report the migration ledger as unavailable.')
expect(migration.includes("'migrationCount', null"), 'Portable fallback must not fabricate a migration count.')
expect(migration.includes('execute $sql$'), 'Production Supabase ledger query must be dynamically resolved after the capability check.')
expect(migration.includes('from supabase_migrations.schema_migrations'), 'Release schema evidence RPC must read the real production migration ledger when available.')
expect(migration.includes("'ledgerAvailable', true"), 'Real production ledger result must explicitly report ledger availability.')
expect(migration.includes('revoke all on function public.release_schema_evidence() from public, anon, authenticated'), 'Browser execute must be revoked from release schema evidence RPC.')
expect(migration.includes('grant execute on function public.release_schema_evidence() to service_role'), 'Service-role execute grant is missing from release schema evidence RPC.')

expect(route.includes("requireApiAccess({ lane: 'admin' })"), 'Release status route must use the admin AAL2 access boundary.')
expect(route.includes("access.membership.role_key !== 'platform_owner'"), 'Release status route must be platform-owner only.')
expect(route.includes("'Cache-Control': 'private, no-store'"), 'Release status response must be private/no-store.')
for (const forbidden of ['ADMIN_PASSWORD', 'SUPABASE_SERVICE_ROLE_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'buildCommercialEvidenceBridgeFromUrlSearchParams', 'workspace_notes']) {
  expect(!route.includes(forbidden), `Release status route contains forbidden legacy/readiness-irrelevant marker: ${forbidden}`)
}

const externalStates = [
  ['supabase_leaked_password_protection', 'pending_external'],
  ['github_dependabot_security_alerts', 'pending_external'],
  ['production_admin_password_acceptance', 'human_evidence_required'],
  ['production_admin_mfa_acceptance', 'human_evidence_required'],
]
for (const [id, state] of externalStates) {
  const pattern = new RegExp(`id: '${id}'[\\s\\S]{0,500}state: '${state}'`)
  expect(pattern.test(readiness), `${id} is not fail-closed as ${state}.`)
}

expect(readiness.includes("unrestrictedAutoSpendAutoPublish: 'not_enabled_by_design'"), 'Unrestricted auto-spend/publish must remain explicitly disabled by design.')
expect(readiness.includes("cspEnforcement: 'pending_representative_telemetry'"), 'CSP enforcement must remain pending representative telemetry.')
expect(readiness.includes("state: killSwitch ? 'safe_lock' : 'blocked'"), 'Autonomy kill switch is not represented as a deliberate safety lock.')
expect(readiness.includes('&& !killSwitch'), 'Full unattended autonomy eligibility must require deliberate kill-switch release.')
expect(readiness.includes("state: providerAccounts > 0 ? 'go' : 'pending_external'"), 'Provider activation must remain evidence-based rather than adapter-based.')
expect(readiness.includes("state: providerReady > 0 ? 'go' : 'pending_external'"), 'Provider readiness must require current machine READY evidence.')
expect(readiness.includes('const verifiedFundingAvailable = creditedFundingRequests > 0 && wallets.length > 0'), 'Funding readiness must require maker-checker credited funding plus wallet evidence.')
expect(readiness.includes("state: verifiedFundingAvailable ? 'go' : 'pending_external'"), 'Funding activation must remain pending until credited funding evidence exists.')
expect(readiness.includes('&& verifiedFundingAvailable'), 'Full unattended autonomy eligibility must require verified credited funding evidence.')

expect(cockpit.includes("fetch('/api/admin/release-status'"), 'Release cockpit must consume the authoritative release-status API.')
expect(cockpit.includes('NOT ENABLED'), 'Release cockpit must visibly state unrestricted spend/publish is not enabled.')
expect(cockpit.includes('External and human requirements'), 'Release cockpit must separate external/human evidence from machine controls.')

expect(checklist.includes('93 source migrations and 93 production ledger entries'), 'Launch checklist is not reconciled to 93/93 parity.')
expect(!checklist.includes('79 Git migrations and 79 production ledger entries'), 'Launch checklist still contains stale 79/79 parity text.')
expect(checklist.includes('Supabase Auth leaked-password protection enabled'), 'Launch checklist lost the external leaked-password requirement.')
expect(checklist.includes('GitHub native Dependabot security alerts enabled'), 'Launch checklist lost the external Dependabot requirement.')
expect(checklist.includes('CSP telemetry stores normalized origin/path only'), 'Launch checklist lost durable CSP privacy evidence.')
expect(checklist.includes('kill switch defaults ON and remains the deliberate final safety lock'), 'Launch checklist lost the autonomy safety-lock rule.')

expect(proof.supabase?.productionLedgerCount === 93, 'Release readiness parity proof does not record 93 production migrations.')
expect(proof.supabase?.productionLedgerLastVersion === '20260818183025', 'Release readiness parity proof has the wrong production ledger version.')
expect(proof.supabase?.productionLedgerLastName === 'release_schema_evidence', 'Release readiness parity proof has the wrong production ledger name.')
expect(proof.liveControls?.schemaEvidenceAnonExecute === false && proof.liveControls?.schemaEvidenceAuthenticatedExecute === false && proof.liveControls?.schemaEvidenceServiceRoleExecute === true, 'Release schema evidence privilege proof is unsafe.')
expect(proof.liveControls?.externalEvidenceAutoCompleted === false, 'External evidence must not be auto-completed.')
expect(proof.liveControls?.growthExecutorKillSwitch === true, 'Release readiness proof must preserve the kill switch.')

if (failures.length) {
  console.error('Release readiness contract verification failed.')
  failures.forEach(failure => console.error(`- ${failure}`))
  process.exit(1)
}

console.log('Release readiness contract verified: 93/93 schema truth, capability-aware portable ledger evidence, AAL2 platform-owner access, no secret-presence readiness signals, provider/funding activation remains evidence-backed, external/human requirements remain fail-closed, CSP enforcement remains evidence-gated, and unrestricted autonomy remains disabled by design.')
