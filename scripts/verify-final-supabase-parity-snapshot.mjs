import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')
const migrationsDir = path.join(repoRoot, 'supabase', 'migrations')
const snapshotPath = path.join(repoRoot, 'docs', 'proof', 'p0', 'P0-013-production-parity-final-2026-08-17.json')
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'))
const files = fs.readdirSync(migrationsDir).filter((file) => file.endsWith('.sql')).sort()
const fileSet = new Set(files)
const failures = []

if (snapshot.issue !== 'P0-013' || snapshot.conclusion !== 'parity_reconciled') {
  failures.push('Final snapshot is not marked as reconciled P0-013 evidence.')
}
if (snapshot.application.gitSha !== '349dd91ccdd5025530d0023a7a4be088202aed48') {
  failures.push(`Unexpected application Git SHA: ${snapshot.application.gitSha}`)
}
if (snapshot.supabase.projectRef !== 'bqhaifivpcwwiauiynlv') {
  failures.push(`Unexpected Supabase project ref: ${snapshot.supabase.projectRef}`)
}
if (snapshot.supabase.productionLedgerCount !== 78) {
  failures.push(`Unexpected captured production ledger count: ${snapshot.supabase.productionLedgerCount}`)
}
if (snapshot.supabase.productionLedgerLastVersion !== '20260817205833') {
  failures.push(`Unexpected captured final production migration: ${snapshot.supabase.productionLedgerLastVersion}`)
}
if (files.length !== snapshot.gitMigrations.fileCount || files.length !== 78) {
  failures.push(`Git migration file count mismatch: actual=${files.length}, snapshot=${snapshot.gitMigrations.fileCount}`)
}

const versions = new Map()
for (const file of files) {
  const version = file.split('_', 1)[0]
  const previous = versions.get(version)
  if (previous) failures.push(`Duplicate migration version ${version}: ${previous}, ${file}`)
  versions.set(version, file)
}

if (snapshot.gitMigrations.productionOnly.length !== 0 || snapshot.gitMigrations.gitOnly.length !== 0) {
  failures.push('Final snapshot contains unresolved production-only or Git-only migrations.')
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
if (snapshot.applyHistory.firstAttempt.result !== 'failed_atomically' || snapshot.applyHistory.firstAttempt.ledgerRowsCreated !== 0 || snapshot.applyHistory.firstAttempt.partialMutation !== false) {
  failures.push('Failed first apply attempt is not captured as atomic/no-ledger/no-partial-mutation.')
}
if (snapshot.applyHistory.sourceExactRetry.result !== 'success') failures.push('Exact-source reconciliation retry is not captured as successful.')

if (failures.length) {
  console.error('P0-013 final parity snapshot verification failed.')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log(`P0-013 final parity snapshot verified: ${files.length} uniquely versioned Git migrations, ${snapshot.supabase.productionLedgerCount} production ledger entries, ${snapshot.historicalAliases.length} explicit July aliases, zero unresolved source/ledger gaps.`)
