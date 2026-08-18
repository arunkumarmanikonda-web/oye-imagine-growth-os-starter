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
const fundingPath = path.join(proofDir, 'P0-013-production-parity-media-funding-2026-08-18.json')
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'))
const delta = JSON.parse(fs.readFileSync(deltaPath, 'utf8'))
const scheduler = JSON.parse(fs.readFileSync(schedulerPath, 'utf8'))
const provider = JSON.parse(fs.readFileSync(providerPath, 'utf8'))
const funding = JSON.parse(fs.readFileSync(fundingPath, 'utf8'))
const files = fs.readdirSync(migrationsDir).filter((file) => file.endsWith('.sql')).sort()
const fileSet = new Set(files)
const failures = []

function expect(condition, message) {
  if (!condition) failures.push(message)
}

expect(snapshot.issue === 'P0-013' && snapshot.conclusion === 'parity_reconciled', 'Historical final snapshot is not reconciled P0-013 evidence.')
expect(snapshot.application.gitSha === 'e9c7837c27d50042b247dfc66603fa207b37ba50', `Unexpected historical application Git SHA: ${snapshot.application.gitSha}`)
expect(snapshot.supabase.projectRef === 'bqhaifivpcwwiauiynlv', `Unexpected historical Supabase project ref: ${snapshot.supabase.projectRef}`)
expect(snapshot.supabase.productionLedgerCount === 79 && snapshot.gitMigrations.fileCount === 79, 'Unexpected historical 79-migration parity baseline.')
expect(snapshot.supabase.productionLedgerLastVersion === '20260817211446', `Unexpected historical final production migration: ${snapshot.supabase.productionLedgerLastVersion}`)

expect(delta.issue === 'P0-013' && delta.conclusion === 'parity_reconciled', 'Autonomy release parity delta is not reconciled P0-013 evidence.')
expect(delta.baseSnapshot === path.basename(snapshotPath), `Unexpected autonomy release base snapshot: ${delta.baseSnapshot}`)
expect(delta.supabase.projectRef === snapshot.supabase.projectRef, `Autonomy release delta targets unexpected Supabase project: ${delta.supabase.projectRef}`)
expect(delta.supabase.baseProductionLedgerCount === 79 && delta.supabase.productionLedgerCount === 84 && delta.gitMigrations.baseFileCount === 79 && delta.gitMigrations.fileCount === 84, 'Autonomy release delta does not prove exact 79 -> 84 parity.')
expect(Array.isArray(delta.releaseMigrations) && delta.releaseMigrations.length === 5, `Expected 5 governed autonomy release migrations, found ${delta.releaseMigrations?.length ?? 'invalid'}`)
expect(delta.supabase.productionLedgerLastVersion === '20260818093605' && delta.supabase.productionLedgerLastName === 'integration_account_contract', 'Unexpected autonomy release migration ledger tail.')

expect(scheduler.issue === 'P0-013' && scheduler.conclusion === 'parity_reconciled', 'Scheduler parity delta is not reconciled P0-013 evidence.')
expect(scheduler.baseSnapshot === path.basename(deltaPath), `Unexpected scheduler base snapshot: ${scheduler.baseSnapshot}`)
expect(scheduler.supabase.projectRef === snapshot.supabase.projectRef, `Scheduler delta targets unexpected Supabase project: ${scheduler.supabase.projectRef}`)
expect(scheduler.supabase.baseProductionLedgerCount === 84 && scheduler.supabase.productionLedgerCount === 85 && scheduler.gitMigrations.baseFileCount === 84 && scheduler.gitMigrations.fileCount === 85, 'Scheduler delta does not prove exact 84 -> 85 parity.')
expect(scheduler.supabase.productionLedgerLastVersion === '20260818095047' && scheduler.supabase.productionLedgerLastName === 'autonomy_scheduler', 'Unexpected scheduler production migration ledger tail.')

expect(provider.issue === 'P0-013' && provider.conclusion === 'parity_reconciled', 'Provider activation parity delta is not reconciled P0-013 evidence.')
expect(provider.baseSnapshot === path.basename(schedulerPath), `Unexpected provider activation base snapshot: ${provider.baseSnapshot}`)
expect(provider.supabase.projectRef === snapshot.supabase.projectRef, `Provider activation delta targets unexpected Supabase project: ${provider.supabase.projectRef}`)
expect(provider.supabase.baseProductionLedgerCount === 85 && provider.supabase.productionLedgerCount === 86 && provider.gitMigrations.baseFileCount === 85 && provider.gitMigrations.fileCount === 86, 'Provider activation delta does not prove exact 85 -> 86 parity.')
expect(provider.supabase.productionLedgerLastVersion === '20260818101623' && provider.supabase.productionLedgerLastName === 'google_ads_provider_vault_fields', 'Unexpected provider activation production migration ledger tail.')

expect(funding.issue === 'P0-013' && funding.conclusion === 'parity_reconciled', 'Media funding parity delta is not reconciled P0-013 evidence.')
expect(funding.baseSnapshot === path.basename(providerPath), `Unexpected media funding base snapshot: ${funding.baseSnapshot}`)
expect(funding.supabase.projectRef === snapshot.supabase.projectRef, `Media funding delta targets unexpected Supabase project: ${funding.supabase.projectRef}`)
expect(funding.supabase.baseProductionLedgerCount === 86 && funding.supabase.productionLedgerCount === 87 && funding.gitMigrations.baseFileCount === 86 && funding.gitMigrations.fileCount === 87, 'Media funding delta does not prove exact 86 -> 87 parity.')
expect(funding.supabase.productionLedgerLastVersion === '20260818103021' && funding.supabase.productionLedgerLastName === 'media_funding_controls', 'Unexpected media funding production migration ledger tail.')
expect(files.length === funding.gitMigrations.fileCount, `Git migration file count mismatch: actual=${files.length}, snapshot=${funding.gitMigrations.fileCount}`)

const expectedMappings = [
  [scheduler.schedulerMigration, '20260818081100_autonomy_scheduler.sql', '20260818095047', 'autonomy_scheduler', 'scheduler'],
  [provider.providerActivationMigration, '20260818101000_google_ads_provider_vault_fields.sql', '20260818101623', 'google_ads_provider_vault_fields', 'provider activation'],
  [funding.mediaFundingMigration, '20260818103000_media_funding_controls.sql', '20260818103021', 'media_funding_controls', 'media funding'],
]
for (const [mapping, sourceFile, ledgerVersion, ledgerName, label] of expectedMappings) {
  expect(mapping?.sourceFile === sourceFile && mapping?.productionLedgerVersion === ledgerVersion && mapping?.productionLedgerName === ledgerName, `${label} source/ledger mapping is incomplete or unexpected.`)
  expect(fileSet.has(sourceFile), `Source-controlled ${label} migration is missing.`)
}

const versions = new Map()
for (const file of files) {
  const version = file.split('_', 1)[0]
  const previous = versions.get(version)
  if (previous) failures.push(`Duplicate migration version ${version}: ${previous}, ${file}`)
  versions.set(version, file)
}

for (const source of [snapshot.gitMigrations, delta.gitMigrations, scheduler.gitMigrations, provider.gitMigrations, funding.gitMigrations]) {
  expect(source.productionOnly.length === 0 && source.gitOnly.length === 0, 'A parity proof contains unresolved production-only or Git-only migrations.')
}

for (const alias of snapshot.historicalAliases) {
  expect(fileSet.has(alias.sourceFile), `Historical alias source is missing: ${alias.sourceFile}`)
  expect(alias.productionLedgerName.startsWith('reconcile_20260731_'), `Unexpected historical alias ledger name: ${alias.productionLedgerName}`)
}
expect(snapshot.historicalAliases.length === 15, `Expected 15 P0-014 historical aliases, found ${snapshot.historicalAliases.length}`)
for (const pair of snapshot.reconciledSourceLedgerPairs) expect(fileSet.has(pair.sourceFile), `Reconciled source migration is missing: ${pair.sourceFile}`)
for (const pair of delta.releaseMigrations) {
  expect(fileSet.has(pair.sourceFile), `Governed release migration is missing: ${pair.sourceFile}`)
  expect(/^\d+$/.test(String(pair.productionLedgerVersion || '')), `Invalid production ledger version for ${pair.sourceFile}`)
  expect(Boolean(String(pair.productionLedgerName || '').trim()), `Missing production ledger name for ${pair.sourceFile}`)
}

expect(snapshot.supabase.pgNetSchema === 'extensions', 'pg_net is not captured in the extensions schema.')
expect(snapshot.liveControls.publicTablesWithoutRls === 0, 'Snapshot records public tables without RLS.')
expect(snapshot.liveControls.postReconciliationSearchPathFunctions === 9 && snapshot.liveControls.postReconciliationSearchPath === 'pg_catalog, public', 'Unexpected historical search-path evidence.')
expect(snapshot.liveControls.credentialClientTableGrants.length === 0 && snapshot.liveControls.browserNonCrudTablePrivileges === 0 && snapshot.liveControls.browserExecutablePublicFunctions === 0, 'Historical browser privilege evidence is unsafe.')
expect(JSON.stringify(snapshot.liveControls.publicFunctionDefaultAcl) === JSON.stringify(['postgres', 'service_role']), 'Unexpected public function default ACL evidence.')
const limiter = snapshot.liveControls.publicContactRateLimiter
expect(limiter?.rlsEnabled && limiter.browserTablePrivileges === false && limiter.browserFunctionExecute === false && limiter.serviceRoleFunctionExecute === true && limiter.functionSearchPath === 'pg_catalog, public', 'Public contact rate-limiter security evidence is incomplete or unsafe.')
expect(snapshot.applyHistory.firstAttempt.result === 'failed_atomically' && snapshot.applyHistory.firstAttempt.ledgerRowsCreated === 0 && snapshot.applyHistory.firstAttempt.partialMutation === false && snapshot.applyHistory.sourceExactRetry.result === 'success', 'Historical reconciliation apply evidence is incomplete.')

const boundary = delta.activationBoundary
expect(boundary?.growthExecutorKillSwitch && boundary.autonomousRunCount === 0 && boundary.autonomousQueueCount === 0 && boundary.neejeeMediaBalanceAccountCount === 0 && boundary.neejeeProviderAccountCount === 0 && boundary.schedulerMigrationDeferredUntilWorkerProductionReady === true, 'Autonomy release parity delta does not preserve its safe pre-scheduler boundary.')

const runtime = scheduler.runtimeProof
expect(runtime?.workerEndpoint === 'https://www.oyeimagine.com/api/cron/autonomy' && runtime.cronJobName === 'oye-autonomy-worker' && runtime.schedule === '*/5 * * * *' && runtime.cronActive === true && runtime.manualInvocationHttpStatus === 200 && runtime.manualInvocationClaimed === 0 && runtime.manualInvocationProcessedCount === 0 && runtime.manualInvocationReconciledCount === 0 && runtime.growthExecutorKillSwitch === true, 'Scheduler runtime proof is incomplete or unsafe.')

const providerBoundary = provider.activationBoundary
expect(providerBoundary?.growthExecutorKillSwitch && providerBoundary.autonomousRunCount === 0 && providerBoundary.autonomousQueueCount === 0 && providerBoundary.neejeeMediaBalanceAccountCount === 0 && providerBoundary.neejeeProviderAccountCount === 0 && providerBoundary.migrationIsConfigurationOnly === true && providerBoundary.providerCredentialsCreatedByMigration === false && providerBoundary.mediaFundsCreatedByMigration === false && providerBoundary.providerMutationPerformedByMigration === false, 'Provider activation parity delta does not preserve the safe activation boundary.')

const fundingControls = funding.liveControls
expect(fundingControls?.fundingRequestCount === 0 && fundingControls.neejeeMediaBalanceAccountCount === 0 && fundingControls.neejeeMediaFundingLedgerEntryCount === 0 && fundingControls.growthExecutorKillSwitch === true && fundingControls.creditFunctionBrowserExecute === false && fundingControls.creditFunctionServiceRoleExecute === true && fundingControls.fundingTableBrowserPrivileges === false && fundingControls.fundingTableServiceRoleCrudOnly === true, 'Media funding parity delta does not preserve the safe zero-funding boundary or privilege contract.')

if (failures.length) {
  console.error('P0-013 final parity snapshot verification failed.')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log(`P0-013 parity verified: ${files.length} uniquely versioned Git migrations, ${funding.supabase.productionLedgerCount} captured production ledger entries, ${snapshot.historicalAliases.length} explicit July aliases, ${delta.releaseMigrations.length} autonomy release migrations, scheduler live, provider activation reconciled, media funding controls reconciled with zero credited funds, zero unresolved source/ledger gaps.`)
