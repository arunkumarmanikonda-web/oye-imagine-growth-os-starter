import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')
const migrationsDir = path.join(repoRoot, 'supabase', 'migrations')
const proofDir = path.join(repoRoot, 'docs', 'proof', 'p0')
const snapshotPath = path.join(proofDir, 'P0-013-production-parity-final-2026-08-17.json')
const deltaPath = path.join(proofDir, 'P0-013-production-parity-delta-2026-08-18.json')
const schedulerPath = path.join(proofDir, 'P0-013-production-parity-scheduler-2026-08-18.json')
const providerPath = path.join(proofDir, 'P0-013-production-parity-provider-activation-2026-08-18.json')
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'))
const delta = JSON.parse(fs.readFileSync(deltaPath, 'utf8'))
const scheduler = JSON.parse(fs.readFileSync(schedulerPath, 'utf8'))
const provider = JSON.parse(fs.readFileSync(providerPath, 'utf8'))
const files = fs.readdirSync(migrationsDir).filter((file) => file.endsWith('.sql')).sort()
const fileSet = new Set(files)
const failures = []

if (snapshot.issue !== 'P0-013' || snapshot.conclusion !== 'parity_reconciled') failures.push('Historical final snapshot is not reconciled P0-013 evidence.')
if (snapshot.application.gitSha !== 'e9c7837c27d50042b247dfc66603fa207b37ba50') failures.push(`Unexpected historical application Git SHA: ${snapshot.application.gitSha}`)
if (snapshot.supabase.projectRef !== 'bqhaifivpcwwiauiynlv') failures.push(`Unexpected historical Supabase project ref: ${snapshot.supabase.projectRef}`)
if (snapshot.supabase.productionLedgerCount !== 79 || snapshot.gitMigrations.fileCount !== 79) failures.push('Unexpected historical 79-migration parity baseline.')
if (snapshot.supabase.productionLedgerLastVersion !== '20260817211446') failures.push(`Unexpected historical final production migration: ${snapshot.supabase.productionLedgerLastVersion}`)

if (delta.issue !== 'P0-013' || delta.conclusion !== 'parity_reconciled') failures.push('Autonomy release parity delta is not reconciled P0-013 evidence.')
if (delta.baseSnapshot !== path.basename(snapshotPath)) failures.push(`Unexpected autonomy release base snapshot: ${delta.baseSnapshot}`)
if (delta.supabase.projectRef !== snapshot.supabase.projectRef) failures.push(`Autonomy release delta targets unexpected Supabase project: ${delta.supabase.projectRef}`)
if (delta.supabase.baseProductionLedgerCount !== 79 || delta.supabase.productionLedgerCount !== 84 || delta.gitMigrations.baseFileCount !== 79 || delta.gitMigrations.fileCount !== 84) failures.push('Autonomy release delta does not prove exact 79 -> 84 parity.')
if (!Array.isArray(delta.releaseMigrations) || delta.releaseMigrations.length !== 5) failures.push(`Expected 5 governed autonomy release migrations, found ${delta.releaseMigrations?.length ?? 'invalid'}`)
if (delta.supabase.productionLedgerLastVersion !== '20260818093605' || delta.supabase.productionLedgerLastName !== 'integration_account_contract') failures.push('Unexpected autonomy release migration ledger tail.')

if (scheduler.issue !== 'P0-013' || scheduler.conclusion !== 'parity_reconciled') failures.push('Scheduler parity delta is not reconciled P0-013 evidence.')
if (scheduler.baseSnapshot !== path.basename(deltaPath)) failures.push(`Unexpected scheduler base snapshot: ${scheduler.baseSnapshot}`)
if (scheduler.supabase.projectRef !== snapshot.supabase.projectRef) failures.push(`Scheduler delta targets unexpected Supabase project: ${scheduler.supabase.projectRef}`)
if (scheduler.supabase.baseProductionLedgerCount !== 84 || scheduler.supabase.productionLedgerCount !== 85 || scheduler.gitMigrations.baseFileCount !== 84 || scheduler.gitMigrations.fileCount !== 85) failures.push('Scheduler delta does not prove exact 84 -> 85 parity.')
if (scheduler.supabase.productionLedgerLastVersion !== '20260818095047' || scheduler.supabase.productionLedgerLastName !== 'autonomy_scheduler') failures.push('Unexpected scheduler production migration ledger tail.')

if (provider.issue !== 'P0-013' || provider.conclusion !== 'parity_reconciled') failures.push('Provider activation parity delta is not reconciled P0-013 evidence.')
if (provider.baseSnapshot !== path.basename(schedulerPath)) failures.push(`Unexpected provider activation base snapshot: ${provider.baseSnapshot}`)
if (provider.supabase.projectRef !== snapshot.supabase.projectRef) failures.push(`Provider activation delta targets unexpected Supabase project: ${provider.supabase.projectRef}`)
if (provider.supabase.baseProductionLedgerCount !== 85 || provider.supabase.productionLedgerCount !== 86 || provider.gitMigrations.baseFileCount !== 85 || provider.gitMigrations.fileCount !== 86) failures.push('Provider activation delta does not prove exact 85 -> 86 parity.')
if (provider.supabase.productionLedgerLastVersion !== '20260818101623' || provider.supabase.productionLedgerLastName !== 'google_ads_provider_vault_fields') failures.push('Unexpected provider activation production migration ledger tail.')
if (files.length !== provider.gitMigrations.fileCount) failures.push(`Git migration file count mismatch: actual=${files.length}, snapshot=${provider.gitMigrations.fileCount}`)

const schedulerMigration = scheduler.schedulerMigration || {}
if (schedulerMigration.sourceFile !== '20260818081100_autonomy_scheduler.sql' || schedulerMigration.productionLedgerVersion !== '20260818095047' || schedulerMigration.productionLedgerName !== 'autonomy_scheduler') failures.push('Scheduler source/ledger mapping is incomplete or unexpected.')
if (!fileSet.has('20260818081100_autonomy_scheduler.sql')) failures.push('Source-controlled autonomy scheduler migration is missing.')

const providerMigration = provider.providerActivationMigration || {}
if (providerMigration.sourceFile !== '20260818101000_google_ads_provider_vault_fields.sql' || providerMigration.productionLedgerVersion !== '20260818101623' || providerMigration.productionLedgerName !== 'google_ads_provider_vault_fields') failures.push('Provider activation source/ledger mapping is incomplete or unexpected.')
if (!fileSet.has('20260818101000_google_ads_provider_vault_fields.sql')) failures.push('Source-controlled provider activation migration is missing.')

const versions = new Map()
for (const file of files) {
  const version = file.split('_', 1)[0]
  const previous = versions.get(version)
  if (previous) failures.push(`Duplicate migration version ${version}: ${previous}, ${file}`)
  versions.set(version, file)
}

for (const source of [snapshot.gitMigrations, delta.gitMigrations, scheduler.gitMigrations, provider.gitMigrations]) {
  if (source.productionOnly.length !== 0 || source.gitOnly.length !== 0) failures.push('A parity proof contains unresolved production-only or Git-only migrations.')
}

for (const alias of snapshot.historicalAliases) {
  if (!fileSet.has(alias.sourceFile)) failures.push(`Historical alias source is missing: ${alias.sourceFile}`)
  if (!alias.productionLedgerName.startsWith('reconcile_20260731_')) failures.push(`Unexpected historical alias ledger name: ${alias.productionLedgerName}`)
}
if (snapshot.historicalAliases.length !== 15) failures.push(`Expected 15 P0-014 historical aliases, found ${snapshot.historicalAliases.length}`)
for (const pair of snapshot.reconciledSourceLedgerPairs) if (!fileSet.has(pair.sourceFile)) failures.push(`Reconciled source migration is missing: ${pair.sourceFile}`)
for (const pair of delta.releaseMigrations) {
  if (!fileSet.has(pair.sourceFile)) failures.push(`Governed release migration is missing: ${pair.sourceFile}`)
  if (!/^\d+$/.test(String(pair.productionLedgerVersion || ''))) failures.push(`Invalid production ledger version for ${pair.sourceFile}`)
  if (!String(pair.productionLedgerName || '').trim()) failures.push(`Missing production ledger name for ${pair.sourceFile}`)
}

if (snapshot.supabase.pgNetSchema !== 'extensions') failures.push('pg_net is not captured in the extensions schema.')
if (snapshot.liveControls.publicTablesWithoutRls !== 0) failures.push('Snapshot records public tables without RLS.')
if (snapshot.liveControls.postReconciliationSearchPathFunctions !== 9 || snapshot.liveControls.postReconciliationSearchPath !== 'pg_catalog, public') failures.push('Unexpected historical search-path evidence.')
if (snapshot.liveControls.credentialClientTableGrants.length !== 0 || snapshot.liveControls.browserNonCrudTablePrivileges !== 0 || snapshot.liveControls.browserExecutablePublicFunctions !== 0) failures.push('Historical browser privilege evidence is unsafe.')
if (JSON.stringify(snapshot.liveControls.publicFunctionDefaultAcl) !== JSON.stringify(['postgres', 'service_role'])) failures.push('Unexpected public function default ACL evidence.')
const limiter = snapshot.liveControls.publicContactRateLimiter
if (!limiter?.rlsEnabled || limiter.browserTablePrivileges !== false || limiter.browserFunctionExecute !== false || limiter.serviceRoleFunctionExecute !== true || limiter.functionSearchPath !== 'pg_catalog, public') failures.push('Public contact rate-limiter security evidence is incomplete or unsafe.')
if (snapshot.applyHistory.firstAttempt.result !== 'failed_atomically' || snapshot.applyHistory.firstAttempt.ledgerRowsCreated !== 0 || snapshot.applyHistory.firstAttempt.partialMutation !== false || snapshot.applyHistory.sourceExactRetry.result !== 'success') failures.push('Historical reconciliation apply evidence is incomplete.')

const boundary = delta.activationBoundary
if (!boundary?.growthExecutorKillSwitch || boundary.autonomousRunCount !== 0 || boundary.autonomousQueueCount !== 0 || boundary.neejeeMediaBalanceAccountCount !== 0 || boundary.neejeeProviderAccountCount !== 0 || boundary.schedulerMigrationDeferredUntilWorkerProductionReady !== true) failures.push('Autonomy release parity delta does not preserve its safe pre-scheduler boundary.')

const runtime = scheduler.runtimeProof
if (runtime?.workerEndpoint !== 'https://www.oyeimagine.com/api/cron/autonomy' || runtime.cronJobName !== 'oye-autonomy-worker' || runtime.schedule !== '*/5 * * * *' || runtime.cronActive !== true || runtime.manualInvocationHttpStatus !== 200 || runtime.manualInvocationClaimed !== 0 || runtime.manualInvocationProcessedCount !== 0 || runtime.manualInvocationReconciledCount !== 0 || runtime.growthExecutorKillSwitch !== true) failures.push('Scheduler runtime proof is incomplete or unsafe.')

const providerBoundary = provider.activationBoundary
if (!providerBoundary?.growthExecutorKillSwitch || providerBoundary.autonomousRunCount !== 0 || providerBoundary.autonomousQueueCount !== 0 || providerBoundary.neejeeMediaBalanceAccountCount !== 0 || providerBoundary.neejeeProviderAccountCount !== 0 || providerBoundary.migrationIsConfigurationOnly !== true || providerBoundary.providerCredentialsCreatedByMigration !== false || providerBoundary.mediaFundsCreatedByMigration !== false || providerBoundary.providerMutationPerformedByMigration !== false) failures.push('Provider activation parity delta does not preserve the safe activation boundary.')

if (failures.length) {
  console.error('P0-013 final parity snapshot verification failed.')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log(`P0-013 parity verified: ${files.length} uniquely versioned Git migrations, ${provider.supabase.productionLedgerCount} captured production ledger entries, ${snapshot.historicalAliases.length} explicit July aliases, ${delta.releaseMigrations.length} autonomy release migrations, scheduler live, provider activation catalog reconciled, zero unresolved source/ledger gaps.`)
