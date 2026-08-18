import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')
const migrationsDir = path.join(repoRoot, 'supabase', 'migrations')
const proofDir = path.join(repoRoot, 'docs', 'proof', 'p0')

const paths = {
  baseline: path.join(proofDir, 'P0-013-production-parity-final-2026-08-17.json'),
  autonomy: path.join(proofDir, 'P0-013-production-parity-delta-2026-08-18.json'),
  scheduler: path.join(proofDir, 'P0-013-production-parity-scheduler-2026-08-18.json'),
  provider: path.join(proofDir, 'P0-013-production-parity-provider-activation-2026-08-18.json'),
  funding: path.join(proofDir, 'P0-013-production-parity-media-funding-2026-08-18.json'),
  oauth: path.join(proofDir, 'P0-013-production-parity-managed-social-oauth-2026-08-18.json'),
  readiness: path.join(proofDir, 'P0-013-production-parity-provider-readiness-2026-08-18.json'),
}

const proof = Object.fromEntries(Object.entries(paths).map(([key, value]) => [key, JSON.parse(fs.readFileSync(value, 'utf8'))]))
const files = fs.readdirSync(migrationsDir).filter(file => file.endsWith('.sql')).sort()
const fileSet = new Set(files)
const failures = []

function expect(condition, message) {
  if (!condition) failures.push(message)
}

function reconciled(name, value) {
  expect(value?.issue === 'P0-013', `${name}: unexpected issue identifier.`)
  expect(value?.conclusion === 'parity_reconciled', `${name}: parity is not reconciled.`)
  expect(value?.supabase?.projectRef === 'bqhaifivpcwwiauiynlv', `${name}: unexpected Supabase project.`)
  expect(Array.isArray(value?.gitMigrations?.productionOnly) && value.gitMigrations.productionOnly.length === 0, `${name}: unresolved production-only migrations.`)
  expect(Array.isArray(value?.gitMigrations?.gitOnly) && value.gitMigrations.gitOnly.length === 0, `${name}: unresolved Git-only migrations.`)
}

for (const [name, value] of Object.entries(proof)) reconciled(name, value)

expect(proof.baseline.application?.gitSha === 'e9c7837c27d50042b247dfc66603fa207b37ba50', 'Baseline application Git SHA changed unexpectedly.')
expect(proof.baseline.supabase?.productionLedgerCount === 79 && proof.baseline.gitMigrations?.fileCount === 79, 'Baseline must prove exact 79/79 parity.')
expect(proof.baseline.supabase?.productionLedgerLastVersion === '20260817211446', 'Unexpected baseline production ledger tail.')

const chain = [
  { name: 'autonomy', base: 'baseline', baseFile: path.basename(paths.baseline), from: 79, to: 84, tailVersion: '20260818093605', tailName: 'integration_account_contract' },
  { name: 'scheduler', base: 'autonomy', baseFile: path.basename(paths.autonomy), from: 84, to: 85, tailVersion: '20260818095047', tailName: 'autonomy_scheduler' },
  { name: 'provider', base: 'scheduler', baseFile: path.basename(paths.scheduler), from: 85, to: 86, tailVersion: '20260818101623', tailName: 'google_ads_provider_vault_fields' },
  { name: 'funding', base: 'provider', baseFile: path.basename(paths.provider), from: 86, to: 87, tailVersion: '20260818103021', tailName: 'media_funding_controls' },
  { name: 'oauth', base: 'funding', baseFile: path.basename(paths.funding), from: 87, to: 88, tailVersion: '20260818105118', tailName: 'managed_social_oauth_sessions' },
  { name: 'readiness', base: 'oauth', baseFile: path.basename(paths.oauth), from: 88, to: 90, tailVersion: '20260818171545', tailName: 'provider_readiness_enforcement' },
]

for (const step of chain) {
  const value = proof[step.name]
  expect(value.baseSnapshot === step.baseFile, `${step.name}: unexpected parity base snapshot.`)
  expect(value.supabase?.baseProductionLedgerCount === step.from, `${step.name}: unexpected base production ledger count.`)
  expect(value.supabase?.productionLedgerCount === step.to, `${step.name}: unexpected production ledger count.`)
  expect(value.gitMigrations?.baseFileCount === step.from, `${step.name}: unexpected base Git migration count.`)
  expect(value.gitMigrations?.fileCount === step.to, `${step.name}: unexpected Git migration count.`)
  expect(value.supabase?.productionLedgerLastVersion === step.tailVersion, `${step.name}: unexpected production ledger tail version.`)
  expect(value.supabase?.productionLedgerLastName === step.tailName, `${step.name}: unexpected production ledger tail name.`)
}

expect(files.length === 90, `Expected 90 source-controlled migrations, found ${files.length}.`)
expect(proof.readiness.supabase?.productionLedgerCount === files.length, 'Final production/Git migration counts are not exact.')

const versions = new Map()
for (const file of files) {
  const version = file.split('_', 1)[0]
  const previous = versions.get(version)
  if (previous) failures.push(`Duplicate migration version ${version}: ${previous}, ${file}`)
  versions.set(version, file)
}

const requiredMappings = [
  ['20260818081100_autonomy_scheduler.sql', '20260818095047', 'autonomy_scheduler', proof.scheduler.schedulerMigration],
  ['20260818101000_google_ads_provider_vault_fields.sql', '20260818101623', 'google_ads_provider_vault_fields', proof.provider.providerActivationMigration],
  ['20260818103000_media_funding_controls.sql', '20260818103021', 'media_funding_controls', proof.funding.mediaFundingMigration],
  ['20260818110000_managed_social_oauth_sessions.sql', '20260818105118', 'managed_social_oauth_sessions', proof.oauth.managedOauthMigration],
]

for (const [sourceFile, ledgerVersion, ledgerName, mapping] of requiredMappings) {
  expect(fileSet.has(sourceFile), `Missing mapped migration source: ${sourceFile}`)
  expect(mapping?.sourceFile === sourceFile, `Unexpected source mapping for ${sourceFile}`)
  expect(mapping?.productionLedgerVersion === ledgerVersion, `Unexpected ledger version for ${sourceFile}`)
  expect(mapping?.productionLedgerName === ledgerName, `Unexpected ledger name for ${sourceFile}`)
}

const readinessMigrations = proof.readiness.releaseMigrations
expect(Array.isArray(readinessMigrations) && readinessMigrations.length === 2, 'Provider readiness proof must contain exactly two release migrations.')
const readinessExpected = [
  ['20260818170000_automated_provider_readiness.sql', '20260818170340', 'automated_provider_readiness'],
  ['20260818171500_provider_readiness_enforcement.sql', '20260818171545', 'provider_readiness_enforcement'],
]
for (const [index, expected] of readinessExpected.entries()) {
  const [sourceFile, ledgerVersion, ledgerName] = expected
  const mapping = readinessMigrations?.[index]
  expect(fileSet.has(sourceFile), `Missing provider-readiness migration source: ${sourceFile}`)
  expect(mapping?.sourceFile === sourceFile, `Unexpected provider-readiness source mapping for ${sourceFile}`)
  expect(mapping?.productionLedgerVersion === ledgerVersion, `Unexpected provider-readiness ledger version for ${sourceFile}`)
  expect(mapping?.productionLedgerName === ledgerName, `Unexpected provider-readiness ledger name for ${sourceFile}`)
}

expect(Array.isArray(proof.autonomy.releaseMigrations) && proof.autonomy.releaseMigrations.length === 5, 'Autonomy proof must contain five release migrations.')
for (const item of proof.autonomy.releaseMigrations || []) {
  expect(fileSet.has(item.sourceFile), `Missing autonomy migration source: ${item.sourceFile}`)
  expect(/^\d+$/.test(String(item.productionLedgerVersion || '')), `Invalid autonomy ledger version for ${item.sourceFile}`)
  expect(Boolean(String(item.productionLedgerName || '').trim()), `Missing autonomy ledger name for ${item.sourceFile}`)
}

expect(Array.isArray(proof.baseline.historicalAliases) && proof.baseline.historicalAliases.length === 15, 'Baseline historical alias evidence must contain 15 explicit aliases.')
for (const alias of proof.baseline.historicalAliases || []) {
  expect(fileSet.has(alias.sourceFile), `Historical alias source missing: ${alias.sourceFile}`)
  expect(String(alias.productionLedgerName || '').startsWith('reconcile_20260731_'), `Unexpected historical alias ledger name: ${alias.productionLedgerName}`)
}
for (const pair of proof.baseline.reconciledSourceLedgerPairs || []) expect(fileSet.has(pair.sourceFile), `Reconciled source migration missing: ${pair.sourceFile}`)

expect(proof.baseline.supabase?.pgNetSchema === 'extensions', 'Historical pg_net schema evidence changed unexpectedly.')
expect(proof.baseline.liveControls?.publicTablesWithoutRls === 0, 'Historical proof records public tables without RLS.')
expect(proof.baseline.liveControls?.postReconciliationSearchPathFunctions === 9, 'Historical function search-path evidence changed unexpectedly.')
expect(proof.baseline.liveControls?.postReconciliationSearchPath === 'pg_catalog, public', 'Historical function search-path evidence is unsafe.')
expect(Array.isArray(proof.baseline.liveControls?.credentialClientTableGrants) && proof.baseline.liveControls.credentialClientTableGrants.length === 0, 'Historical credential browser grants are unsafe.')
expect(proof.baseline.liveControls?.browserNonCrudTablePrivileges === 0, 'Historical browser non-CRUD privileges are unsafe.')
expect(proof.baseline.liveControls?.browserExecutablePublicFunctions === 0, 'Historical browser-executable public functions are unsafe.')
expect(JSON.stringify(proof.baseline.liveControls?.publicFunctionDefaultAcl) === JSON.stringify(['postgres', 'service_role']), 'Historical public function default ACL changed unexpectedly.')

const limiter = proof.baseline.liveControls?.publicContactRateLimiter
expect(limiter?.rlsEnabled === true, 'Public contact rate limiter must retain RLS.')
expect(limiter?.browserTablePrivileges === false, 'Public contact rate limiter must not grant browser table privileges.')
expect(limiter?.browserFunctionExecute === false, 'Public contact rate limiter must not grant browser function execute.')
expect(limiter?.serviceRoleFunctionExecute === true, 'Public contact rate limiter service-role execute evidence is missing.')
expect(limiter?.functionSearchPath === 'pg_catalog, public', 'Public contact rate limiter search path is unsafe.')

expect(proof.baseline.applyHistory?.firstAttempt?.result === 'failed_atomically', 'Historical reconciliation first attempt must remain atomically failed.')
expect(proof.baseline.applyHistory?.firstAttempt?.ledgerRowsCreated === 0, 'Historical failed reconciliation created ledger rows.')
expect(proof.baseline.applyHistory?.firstAttempt?.partialMutation === false, 'Historical failed reconciliation recorded partial mutation.')
expect(proof.baseline.applyHistory?.sourceExactRetry?.result === 'success', 'Historical source-exact reconciliation retry evidence is missing.')

const autonomy = proof.autonomy.activationBoundary
expect(autonomy?.growthExecutorKillSwitch === true, 'Autonomy boundary lost the kill switch.')
expect(autonomy?.autonomousRunCount === 0 && autonomy?.autonomousQueueCount === 0, 'Autonomy boundary created execution work.')
expect(autonomy?.neejeeMediaBalanceAccountCount === 0 && autonomy?.neejeeProviderAccountCount === 0, 'Autonomy boundary created funds or providers.')
expect(autonomy?.schedulerMigrationDeferredUntilWorkerProductionReady === true, 'Autonomy scheduler sequencing evidence changed unexpectedly.')

const scheduler = proof.scheduler.runtimeProof
expect(scheduler?.workerEndpoint === 'https://www.oyeimagine.com/api/cron/autonomy', 'Scheduler worker endpoint evidence changed unexpectedly.')
expect(scheduler?.cronJobName === 'oye-autonomy-worker' && scheduler?.schedule === '*/5 * * * *' && scheduler?.cronActive === true, 'Autonomy scheduler is not captured as active on the expected cadence.')
expect(scheduler?.manualInvocationHttpStatus === 200 && scheduler?.manualInvocationClaimed === 0 && scheduler?.manualInvocationProcessedCount === 0 && scheduler?.manualInvocationReconciledCount === 0, 'Autonomy scheduler manual proof is incomplete or unsafe.')
expect(scheduler?.growthExecutorKillSwitch === true, 'Scheduler proof lost the kill switch.')

const provider = proof.provider.activationBoundary
expect(provider?.growthExecutorKillSwitch === true, 'Provider activation boundary lost the kill switch.')
expect(provider?.autonomousRunCount === 0 && provider?.autonomousQueueCount === 0, 'Provider activation boundary created execution work.')
expect(provider?.neejeeMediaBalanceAccountCount === 0 && provider?.neejeeProviderAccountCount === 0, 'Provider activation boundary created money or provider accounts.')
expect(provider?.migrationIsConfigurationOnly === true && provider?.providerCredentialsCreatedByMigration === false && provider?.mediaFundsCreatedByMigration === false && provider?.providerMutationPerformedByMigration === false, 'Provider activation migration safety evidence changed unexpectedly.')

const funding = proof.funding.liveControls
expect(funding?.fundingRequestCount === 0 && funding?.neejeeMediaBalanceAccountCount === 0 && funding?.neejeeMediaFundingLedgerEntryCount === 0, 'Media funding proof contains synthetic money.')
expect(funding?.growthExecutorKillSwitch === true, 'Media funding proof lost the kill switch.')
expect(funding?.creditFunctionBrowserExecute === false && funding?.creditFunctionServiceRoleExecute === true, 'Media funding credit function privilege evidence is unsafe.')
expect(funding?.fundingTableBrowserPrivileges === false && funding?.fundingTableServiceRoleCrudOnly === true, 'Media funding table privilege evidence is unsafe.')

const oauth = proof.oauth.liveControls
expect(oauth?.oauthSelectionSessionCount === 0 && oauth?.neejeeProviderAccountCount === 0, 'Managed OAuth proof contains fabricated provider connections.')
expect(oauth?.autonomousRunCount === 0 && oauth?.autonomousQueueCount === 0, 'Managed OAuth proof created execution work.')
expect(oauth?.fundingRequestCount === 0 && oauth?.neejeeMediaBalanceAccountCount === 0, 'Managed OAuth proof created funding state.')
expect(oauth?.growthExecutorKillSwitch === true, 'Managed OAuth proof lost the kill switch.')
expect(oauth?.selectionTableBrowserPrivileges === false && oauth?.selectionTableServiceRoleCrudOnly === true, 'Managed OAuth selection-table privilege evidence is unsafe.')
expect(oauth?.migrationCreatesProviderCredential === false && oauth?.migrationPerformsProviderMutation === false, 'Managed OAuth migration performed a forbidden side effect.')

const readiness = proof.readiness.liveControls
expect(readiness?.providerQaRunCount === 0 && readiness?.providerChannelReadinessCount === 0, 'Provider readiness migration fabricated QA evidence.')
expect(readiness?.neejeeProviderAccountCount === 0, 'Provider readiness migration fabricated provider accounts.')
expect(readiness?.autonomousRunCount === 0 && readiness?.autonomousQueueCount === 0, 'Provider readiness migration created autonomous execution work.')
expect(readiness?.fundingRequestCount === 0 && readiness?.neejeeMediaBalanceAccountCount === 0, 'Provider readiness migration created money.')
expect(readiness?.growthExecutorKillSwitch === true, 'Provider readiness proof lost the kill switch.')
expect(readiness?.providerQaBrowserPrivileges === false && readiness?.providerReadinessBrowserPrivileges === false, 'Machine QA tables expose browser privileges.')
expect(readiness?.legacyReadinessBrowserWritePrivileges === false, 'Legacy readiness still permits browser writes.')
expect(readiness?.manualPassingReadinessProbeBlocked === true, 'Manual passing readiness guard was not exercised successfully.')
expect(readiness?.expiryCronJobName === 'oye-provider-readiness-expiry' && readiness?.expiryCronSchedule === '* * * * *' && readiness?.expiryCronActive === true, 'Provider readiness expiry scheduler evidence is incomplete.')
expect(readiness?.migrationCreatesProviderCredential === false && readiness?.migrationCreatesMediaFunds === false && readiness?.migrationPerformsProviderMutation === false && readiness?.migrationReleasesKillSwitch === false, 'Provider readiness migration performed a forbidden side effect.')

if (failures.length) {
  console.error('P0-013 final parity snapshot verification failed.')
  failures.forEach(failure => console.error(`- ${failure}`))
  process.exit(1)
}

console.log(`P0-013 parity verified: ${files.length} uniquely versioned Git migrations, ${proof.readiness.supabase.productionLedgerCount} captured production ledger entries, historical reconciliation retained, autonomy scheduler live, provider activation/funding/OAuth boundaries safe, and machine provider readiness enforced with zero fabricated provider, funding or execution state.`)
