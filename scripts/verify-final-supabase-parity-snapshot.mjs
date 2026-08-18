import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')
const migrationsDir = path.join(repoRoot, 'supabase', 'migrations')
const snapshotPath = path.join(repoRoot, 'docs', 'proof', 'p0', 'P0-013-production-parity-final-2026-08-17.json')
const deltaPath = path.join(repoRoot, 'docs', 'proof', 'p0', 'P0-013-production-parity-delta-2026-08-18.json')
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'))
const delta = JSON.parse(fs.readFileSync(deltaPath, 'utf8'))
const files = fs.readdirSync(migrationsDir).filter((file) => file.endsWith('.sql')).sort()
const fileSet = new Set(files)
const failures = []

if (snapshot.issue !== 'P0-013' || snapshot.conclusion !== 'parity_reconciled') {
  failures.push('Historical final snapshot is not marked as reconciled P0-013 evidence.')
}
if (snapshot.application.gitSha !== 'e9c7837c27d50042b247dfc66603fa207b37ba50') {
  failures.push(`Unexpected historical application Git SHA: ${snapshot.application.gitSha}`)
}
if (snapshot.supabase.projectRef !== 'bqhaifivpcwwiauiynlv') {
  failures.push(`Unexpected historical Supabase project ref: ${snapshot.supabase.projectRef}`)
}
if (snapshot.supabase.productionLedgerCount !== 79) {
  failures.push(`Unexpected historical production ledger count: ${snapshot.supabase.productionLedgerCount}`)
}
if (snapshot.supabase.productionLedgerLastVersion !== '20260817211446') {
  failures.push(`Unexpected historical final production migration: ${snapshot.supabase.productionLedgerLastVersion}`)
}
if (snapshot.gitMigrations.fileCount !== 79) {
  failures.push(`Unexpected historical Git migration count: ${snapshot.gitMigrations.fileCount}`)
}

if (delta.issue !== 'P0-013' || delta.conclusion !== 'parity_reconciled') {
  failures.push('Current parity delta is not marked as reconciled P0-013 evidence.')
}
if (delta.baseSnapshot !== path.basename(snapshotPath)) {
  failures.push(`Unexpected parity delta base snapshot: ${delta.baseSnapshot}`)
}
if (delta.supabase.projectRef !== snapshot.supabase.projectRef) {
  failures.push(`Parity delta targets an unexpected Supabase project: ${delta.supabase.projectRef}`)
}
if (delta.supabase.baseProductionLedgerCount !== snapshot.supabase.productionLedgerCount) {
  failures.push('Parity delta does not extend the captured historical production ledger count.')
}
if (!Array.isArray(delta.releaseMigrations) || delta.releaseMigrations.length !== 5) {
  failures.push(`Expected 5 governed release migrations in parity delta, found ${delta.releaseMigrations?.length ?? 'invalid'}`)
}
if (delta.supabase.productionLedgerCount !== snapshot.supabase.productionLedgerCount + delta.releaseMigrations.length) {
  failures.push('Current production ledger count does not equal historical count plus governed release migrations.')
}
if (delta.gitMigrations.fileCount !== snapshot.gitMigrations.fileCount + delta.releaseMigrations.length) {
  failures.push('Current Git migration count does not equal historical count plus governed release migrations.')
}
if (files.length !== delta.gitMigrations.fileCount) {
  failures.push(`Git migration file count mismatch: actual=${files.length}, snapshot=${delta.gitMigrations.fileCount}`)
}
if (delta.supabase.productionLedgerLastVersion !== '20260818093605' || delta.supabase.productionLedgerLastName !== 'integration_account_contract') {
  failures.push('Unexpected current production migration ledger tail in parity delta.')
}
if (fileSet.has('20260818081100_autonomy_scheduler.sql')) {
  failures.push('Autonomy scheduler migration must remain deferred until the production worker route is live.')
}

const versions = new Map()
for (const file of files) {
  const version = file.split('_', 1)[0]
  const previous = versions.get(version)
  if (previous) failures.push(`Duplicate migration version ${version}: ${previous}, ${file}`)
  versions.set(version, file)
}

if (snapshot.gitMigrations.productionOnly.length !== 0 || snapshot.gitMigrations.gitOnly.length !== 0) {
  failures.push('Historical final snapshot contains unresolved production-only or Git-only migrations.')
}
if (delta.gitMigrations.productionOnly.length !== 0 || delta.gitMigrations.gitOnly.length !== 0) {
  failures.push('Current parity delta contains unresolved production-only or Git-only migrations.')
}

for (const alias of snapshot.historicalAliases) {
  if (!fileSet.has(alias.sourceFile)) failures.push(`Historical alias source is missing: ${alias.sourceFile}`)
  if (!alias.productionLedgerName.startsWith('reconcile_20260731_')) {
    failures.push(`Unexpected historical alias ledger name: ${alias.productionLedgerName}`)
  }
}
if (snapshot.historicalAliases.length !== 15) {
  failures.push(`Expected 15 P0-014 historical aliases, found ${snapshot.historicalAliases.length}`)
}

for (const pair of snapshot.reconciledSourceLedgerPairs) {
  if (!fileSet.has(pair.sourceFile)) failures.push(`Reconciled source migration is missing: ${pair.sourceFile}`)
}
for (const pair of delta.releaseMigrations) {
  if (!fileSet.has(pair.sourceFile)) failures.push(`Governed release migration is missing: ${pair.sourceFile}`)
  if (!/^\d+$/.test(String(pair.productionLedgerVersion || ''))) failures.push(`Invalid production ledger version for ${pair.sourceFile}`)
  if (!String(pair.productionLedgerName || '').trim()) failures.push(`Missing production ledger name for ${pair.sourceFile}`)
}

if (snapshot.supabase.pgNetSchema !== 'extensions') failures.push('pg_net is not captured in the extensions schema.')
if (snapshot.liveControls.publicTablesWithoutRls !== 0) failures.push('Snapshot records public tables without RLS.')
if (snapshot.liveControls.postReconciliationSearchPathFunctions !== 9) failures.push('Unexpected search-path function verification count.')
if (snapshot.liveControls.postReconciliationSearchPath !== 'pg_catalog, public') failures.push('Unexpected captured trigger search_path.')
if (snapshot.liveControls.credentialClientTableGrants.length !== 0) failures.push('Snapshot records client grants on credential tables.')
if (snapshot.liveControls.browserNonCrudTablePrivileges !== 0) failures.push('Snapshot records browser-facing non-CRUD table privileges.')
if (snapshot.liveControls.browserExecutablePublicFunctions !== 0) failures.push('Snapshot records browser-executable public functions.')
if (JSON.stringify(snapshot.liveControls.publicFunctionDefaultAcl) !== JSON.stringify(['postgres', 'service_role'])) {
  failures.push('Unexpected public function default ACL evidence.')
}
const limiter = snapshot.liveControls.publicContactRateLimiter
if (!limiter?.rlsEnabled || limiter.browserTablePrivileges !== false || limiter.browserFunctionExecute !== false || limiter.serviceRoleFunctionExecute !== true || limiter.functionSearchPath !== 'pg_catalog, public') {
  failures.push('Public contact rate-limiter security evidence is incomplete or unsafe.')
}
if (snapshot.applyHistory.firstAttempt.result !== 'failed_atomically' || snapshot.applyHistory.firstAttempt.ledgerRowsCreated !== 0 || snapshot.applyHistory.firstAttempt.partialMutation !== false) {
  failures.push('Failed first apply attempt is not captured as atomic/no-ledger/no-partial-mutation.')
}
if (snapshot.applyHistory.sourceExactRetry.result !== 'success') failures.push('Exact-source reconciliation retry is not captured as successful.')

const boundary = delta.activationBoundary
if (!boundary?.growthExecutorKillSwitch || boundary.autonomousRunCount !== 0 || boundary.autonomousQueueCount !== 0 || boundary.neejeeMediaBalanceAccountCount !== 0 || boundary.neejeeProviderAccountCount !== 0 || boundary.schedulerMigrationDeferredUntilWorkerProductionReady !== true) {
  failures.push('Current parity delta does not preserve the safe autonomy activation boundary.')
}

if (failures.length) {
  console.error('P0-013 final parity snapshot verification failed.')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log(`P0-013 parity verified: ${files.length} uniquely versioned Git migrations, ${delta.supabase.productionLedgerCount} captured production ledger entries, ${snapshot.historicalAliases.length} explicit July aliases, ${delta.releaseMigrations.length} governed Aug-18 release migrations, zero unresolved source/ledger gaps.`)
