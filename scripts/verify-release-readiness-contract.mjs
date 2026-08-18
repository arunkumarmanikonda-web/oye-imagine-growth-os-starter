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
  webhookMigration: path.join(migrationsDir, '20260818220000_lifecycle_webhook_guard.sql'),
  checklist: path.join(repoRoot, 'docs', 'launch', 'production-activation-checklist.md'),
  proof: path.join(repoRoot, 'docs', 'proof', 'p0', 'P0-013-production-parity-release-readiness-2026-08-18.json'),
  webhookProof: path.join(repoRoot, 'docs', 'proof', 'p0', 'P0-013-production-parity-webhook-authenticity-2026-08-18.json'),
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
const webhookMigration = read('webhookMigration')
const checklist = read('checklist')
const proof = JSON.parse(read('proof') || '{}')
const webhookProof = JSON.parse(read('webhookProof') || '{}')

expect(migrations.length === 94, `Expected 94 source migrations, found ${migrations.length}.`)
expect(migrations.at(-1) === '20260818220000_lifecycle_webhook_guard.sql', `Unexpected migration tail: ${migrations.at(-1)}`)
expect(readiness.includes('migrationFileCount: 94'), 'Runtime release expectation is not pinned to 94 migrations.')
expect(readiness.includes("lastSourceFile: '20260818220000_lifecycle_webhook_guard.sql'"), 'Runtime release expectation has the wrong migration tail.')
expect(readiness.includes("lastProductionMigrationName: 'lifecycle_webhook_guard'"), 'Runtime release expectation has the wrong production migration name.')

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

expect(webhookMigration.includes('ux_lifecycle_delivery_provider_message_id'), 'Webhook migration must enforce unique provider-message identity.')
expect(webhookMigration.includes('apply_lifecycle_delivery_callback_guarded'), 'Webhook migration must define the guarded lifecycle callback RPC.')
expect(webhookMigration.includes('security definer'), 'Webhook callback RPC must be SECURITY DEFINER.')
expect(webhookMigration.includes('set search_path = pg_catalog, public'), 'Webhook callback RPC must use a fixed safe search path.')
expect(webhookMigration.includes('for update'), 'Webhook callback RPC must serialize transitions per delivery job.')
expect(webhookMigration.includes("v_job.status in ('failed', 'cancelled', 'blocked')"), 'Webhook callback RPC must preserve terminal failed/cancelled/blocked states.')
expect(webhookMigration.includes("v_job.status = 'delivered'"), 'Webhook callback RPC must preserve delivered terminal state.')
expect(webhookMigration.includes('revoke all on function public.apply_lifecycle_delivery_callback_guarded'), 'Browser execute must be revoked from guarded callback RPC.')
expect(webhookMigration.includes('grant execute on function public.apply_lifecycle_delivery_callback_guarded') && webhookMigration.includes('to service_role'), 'Guarded callback RPC must remain service-role executable.')

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

expect(checklist.includes('94 source migrations and 94 production ledger entries'), 'Launch checklist is not reconciled to 94/94 parity.')
expect(!checklist.includes('93 source migrations and 93 production ledger entries'), 'Launch checklist still contains stale 93/93 parity text.')
expect(checklist.includes('Supabase Auth leaked-password protection enabled'), 'Launch checklist lost the external leaked-password requirement.')
expect(checklist.includes('GitHub native Dependabot security alerts enabled'), 'Launch checklist lost the external Dependabot requirement.')
expect(checklist.includes('CSP telemetry stores normalized origin/path only'), 'Launch checklist lost durable CSP privacy evidence.')
expect(checklist.includes('kill switch defaults ON and remains the deliberate final safety lock'), 'Launch checklist lost the autonomy safety-lock rule.')
expect(checklist.includes('WhatsApp Cloud webhook software verifies the subscription token and HMAC-SHA256 signature'), 'Launch checklist lost webhook-authenticity software evidence.')
expect(checklist.includes('External webhook endpoints verified provider-side'), 'Launch checklist lost provider-side webhook verification as an external requirement.')

expect(proof.supabase?.productionLedgerCount === 93, 'Historical release-readiness parity proof must remain the 93-migration snapshot.')
expect(proof.supabase?.productionLedgerLastVersion === '20260818183025', 'Historical release-readiness parity proof has the wrong production ledger version.')
expect(proof.supabase?.productionLedgerLastName === 'release_schema_evidence', 'Historical release-readiness parity proof has the wrong production ledger name.')
expect(proof.liveControls?.schemaEvidenceAnonExecute === false && proof.liveControls?.schemaEvidenceAuthenticatedExecute === false && proof.liveControls?.schemaEvidenceServiceRoleExecute === true, 'Release schema evidence privilege proof is unsafe.')
expect(proof.liveControls?.externalEvidenceAutoCompleted === false, 'External evidence must not be auto-completed.')
expect(proof.liveControls?.growthExecutorKillSwitch === true, 'Release readiness proof must preserve the kill switch.')

expect(webhookProof.supabase?.productionLedgerCount === 94, 'Current release truth does not record 94 production migrations.')
expect(webhookProof.supabase?.productionLedgerLastVersion === '20260818211024', 'Current release truth has the wrong production ledger version.')
expect(webhookProof.supabase?.productionLedgerLastName === 'lifecycle_webhook_guard', 'Current release truth has the wrong production ledger name.')
expect(webhookProof.liveControls?.guardedCallbackAnonExecute === false && webhookProof.liveControls?.guardedCallbackAuthenticatedExecute === false && webhookProof.liveControls?.guardedCallbackServiceRoleExecute === true, 'Current guarded callback privilege proof is unsafe.')
expect(webhookProof.liveControls?.growthExecutorKillSwitch === true, 'Current webhook proof must preserve the kill switch.')

if (failures.length) {
  console.error('Release readiness contract verification failed.')
  failures.forEach(failure => console.error(`- ${failure}`))
  process.exit(1)
}

console.log('Release readiness contract verified: 94/94 schema truth, capability-aware portable ledger evidence, AAL2 platform-owner access, authenticated guarded lifecycle callbacks, no secret-presence readiness signals, provider/funding activation remains evidence-backed, external/human requirements remain fail-closed, CSP enforcement remains evidence-gated, and unrestricted autonomy remains disabled by design.')
