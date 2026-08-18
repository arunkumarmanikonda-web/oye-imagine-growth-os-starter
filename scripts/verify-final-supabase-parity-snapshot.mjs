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
  csp: path.join(proofDir, 'P0-013-production-parity-csp-telemetry-2026-08-18.json'),
  release: path.join(proofDir, 'P0-013-production-parity-release-readiness-2026-08-18.json'),
  webhook: path.join(proofDir, 'P0-013-production-parity-webhook-authenticity-2026-08-18.json'),
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
  { name: 'autonomy', baseFile: path.basename(paths.baseline), from: 79, to: 84, tailVersion: '20260818093605', tailName: 'integration_account_contract' },
  { name: 'scheduler', baseFile: path.basename(paths.autonomy), from: 84, to: 85, tailVersion: '20260818095047', tailName: 'autonomy_scheduler' },
  { name: 'provider', baseFile: path.basename(paths.scheduler), from: 85, to: 86, tailVersion: '20260818101623', tailName: 'google_ads_provider_vault_fields' },
  { name: 'funding', baseFile: path.basename(paths.provider), from: 86, to: 87, tailVersion: '20260818103021', tailName: 'media_funding_controls' },
  { name: 'oauth', baseFile: path.basename(paths.funding), from: 87, to: 88, tailVersion: '20260818105118', tailName: 'managed_social_oauth_sessions' },
  { name: 'readiness', baseFile: path.basename(paths.oauth), from: 88, to: 91, tailVersion: '20260818172350', tailName: 'provider_readiness_guard_go' },
  { name: 'csp', baseFile: path.basename(paths.readiness), from: 91, to: 92, tailVersion: '20260818180811', tailName: 'durable_csp_telemetry' },
  { name: 'release', baseFile: path.basename(paths.csp), from: 92, to: 93, tailVersion: '20260818183025', tailName: 'release_schema_evidence' },
  { name: 'webhook', baseFile: path.basename(paths.release), from: 93, to: 94, tailVersion: '20260818211024', tailName: 'lifecycle_webhook_guard' },
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

expect(files.length === 94, `Expected 94 source-controlled migrations, found ${files.length}.`)
expect(proof.webhook.supabase?.productionLedgerCount === files.length, 'Final production/Git migration counts are not exact.')

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

const readinessExpected = [
  ['20260818170000_automated_provider_readiness.sql', '20260818170340', 'automated_provider_readiness'],
  ['20260818171500_provider_readiness_enforcement.sql', '20260818171545', 'provider_readiness_enforcement'],
  ['20260818173500_provider_readiness_guard_go.sql', '20260818172350', 'provider_readiness_guard_go'],
]
expect(Array.isArray(proof.readiness.releaseMigrations) && proof.readiness.releaseMigrations.length === readinessExpected.length, 'Provider readiness proof must contain exactly three release migrations.')
for (const [index, expected] of readinessExpected.entries()) {
  const [sourceFile, ledgerVersion, ledgerName] = expected
  const mapping = proof.readiness.releaseMigrations?.[index]
  expect(fileSet.has(sourceFile), `Missing provider-readiness migration source: ${sourceFile}`)
  expect(mapping?.sourceFile === sourceFile, `Unexpected provider-readiness source mapping for ${sourceFile}`)
  expect(mapping?.productionLedgerVersion === ledgerVersion, `Unexpected provider-readiness ledger version for ${sourceFile}`)
  expect(mapping?.productionLedgerName === ledgerName, `Unexpected provider-readiness ledger name for ${sourceFile}`)
}

const cspMapping = proof.csp.releaseMigrations?.[0]
expect(Array.isArray(proof.csp.releaseMigrations) && proof.csp.releaseMigrations.length === 1, 'CSP telemetry proof must contain exactly one release migration.')
expect(fileSet.has('20260818183000_durable_csp_telemetry.sql'), 'CSP telemetry source migration is missing.')
expect(cspMapping?.sourceFile === '20260818183000_durable_csp_telemetry.sql', 'Unexpected CSP telemetry source mapping.')
expect(cspMapping?.productionLedgerVersion === '20260818180811', 'Unexpected CSP telemetry production ledger version.')
expect(cspMapping?.productionLedgerName === 'durable_csp_telemetry', 'Unexpected CSP telemetry production ledger name.')

const releaseMapping = proof.release.releaseMigrations?.[0]
expect(Array.isArray(proof.release.releaseMigrations) && proof.release.releaseMigrations.length === 1, 'Release-readiness proof must contain exactly one release migration.')
expect(fileSet.has('20260818190000_release_schema_evidence.sql'), 'Release-readiness source migration is missing.')
expect(releaseMapping?.sourceFile === '20260818190000_release_schema_evidence.sql', 'Unexpected release-readiness source mapping.')
expect(releaseMapping?.productionLedgerVersion === '20260818183025', 'Unexpected release-readiness production ledger version.')
expect(releaseMapping?.productionLedgerName === 'release_schema_evidence', 'Unexpected release-readiness production ledger name.')

const webhookMapping = proof.webhook.releaseMigrations?.[0]
expect(Array.isArray(proof.webhook.releaseMigrations) && proof.webhook.releaseMigrations.length === 1, 'Webhook-authenticity proof must contain exactly one release migration.')
expect(fileSet.has('20260818220000_lifecycle_webhook_guard.sql'), 'Webhook-authenticity source migration is missing.')
expect(webhookMapping?.sourceFile === '20260818220000_lifecycle_webhook_guard.sql', 'Unexpected webhook-authenticity source mapping.')
expect(webhookMapping?.productionLedgerVersion === '20260818211024', 'Unexpected webhook-authenticity production ledger version.')
expect(webhookMapping?.productionLedgerName === 'lifecycle_webhook_guard', 'Unexpected webhook-authenticity production ledger name.')

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
expect(scheduler?.cronJobName === 'oye-autonomy-worker' && scheduler?.schedule === '*/5 * * * *' && scheduler?.cronActive === true, 'Autonomy scheduler evidence is incomplete.')
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
expect(readiness?.manualPassingReadinessProbeBlocked === true && readiness?.manualGoReadinessProbeBlocked === true, 'Legacy readiness bypass guards are incomplete.')
expect(readiness?.expiryCronJobName === 'oye-provider-readiness-expiry' && readiness?.expiryCronSchedule === '* * * * *' && readiness?.expiryCronActive === true, 'Provider readiness expiry scheduler evidence is incomplete.')
expect(readiness?.migrationCreatesProviderCredential === false && readiness?.migrationCreatesMediaFunds === false && readiness?.migrationPerformsProviderMutation === false && readiness?.migrationReleasesKillSwitch === false, 'Provider readiness migration performed a forbidden side effect.')

const csp = proof.csp.liveControls
expect(csp?.cspReportBucketRowCount === 0 && csp?.cspReportObservedCount === 0 && csp?.cspRateBucketRowCount === 0, 'CSP proof contains synthetic telemetry.')
expect(csp?.cspReportRlsEnabled === true && csp?.cspRateLimitRlsEnabled === true, 'CSP telemetry tables must retain RLS.')
expect(csp?.cspReportBrowserPrivileges === false && csp?.cspRateLimitBrowserPrivileges === false, 'CSP telemetry exposes browser table privileges.')
expect(csp?.recordFunctionAnonExecute === false && csp?.recordFunctionAuthenticatedExecute === false && csp?.recordFunctionServiceRoleExecute === true, 'CSP recording function privileges are unsafe.')
expect(csp?.retentionCronJobName === 'oye-csp-telemetry-retention' && csp?.retentionCronSchedule === '17 3 * * *' && csp?.retentionCronActive === true, 'CSP retention cron evidence is incomplete.')
expect(csp?.reportRetentionDays === 30 && csp?.rateBucketRetentionDays === 1, 'CSP retention boundaries changed unexpectedly.')
expect(csp?.rawIpPersisted === false && csp?.urlQueryPersisted === false && csp?.urlFragmentPersisted === false, 'CSP telemetry privacy boundary is unsafe.')
expect(csp?.cspEnforcementEnabled === false && csp?.cspReportOnlyPreserved === true, 'CSP was enforced without representative production evidence.')
expect(csp?.providerQaRunCount === 0 && csp?.providerChannelReadinessCount === 0 && csp?.providerAccountCount === 0 && csp?.oauthSelectionSessionCount === 0, 'CSP migration fabricated provider evidence.')
expect(csp?.autonomousRunCount === 0 && csp?.autonomousQueueCount === 0 && csp?.fundingRequestCount === 0 && csp?.mediaBalanceAccountCount === 0, 'CSP migration created execution or funding state.')
expect(csp?.growthExecutorKillSwitch === true, 'CSP proof lost the kill switch.')
expect(csp?.migrationCreatesProviderCredential === false && csp?.migrationCreatesMediaFunds === false && csp?.migrationPerformsProviderMutation === false && csp?.migrationReleasesKillSwitch === false && csp?.syntheticCspEvidenceInserted === false, 'CSP migration performed a forbidden side effect.')

const release = proof.release.liveControls
expect(release?.schemaEvidenceAnonExecute === false && release?.schemaEvidenceAuthenticatedExecute === false && release?.schemaEvidenceServiceRoleExecute === true, 'Release schema-evidence RPC privileges are unsafe.')
expect(release?.cspReportBucketRowCount === 0 && release?.cspReportObservedCount === 0, 'Release-readiness migration fabricated CSP telemetry.')
expect(release?.neejeeProviderAccountCount === 0 && release?.neejeeProviderReadinessCount === 0, 'Release-readiness migration fabricated provider evidence.')
expect(release?.autonomousRunCount === 0 && release?.autonomousActiveQueueCount === 0, 'Release-readiness migration created autonomous work.')
expect(release?.fundingRequestCount === 0 && release?.mediaBalanceAccountCount === 0, 'Release-readiness migration created funding state.')
expect(release?.growthExecutorKillSwitch === true, 'Release-readiness proof lost the kill switch.')
expect(release?.migrationCreatesProviderCredential === false && release?.migrationCreatesMediaFunds === false && release?.migrationPerformsProviderMutation === false && release?.migrationReleasesKillSwitch === false && release?.externalEvidenceAutoCompleted === false, 'Release-readiness migration performed a forbidden side effect.')

const webhook = proof.webhook.liveControls
expect(webhook?.guardedCallbackAnonExecute === false && webhook?.guardedCallbackAuthenticatedExecute === false && webhook?.guardedCallbackServiceRoleExecute === true, 'Webhook callback guard privileges are unsafe.')
expect(webhook?.uniqueProviderMessageIndexCount === 1, 'Webhook callback provider-message uniqueness evidence is missing.')
expect(webhook?.whatsappVerifyTokenFieldCount === 1, 'WhatsApp webhook verify-token provider field evidence is missing.')
expect(webhook?.lifecycleDeliveryJobCount === 0, 'Webhook migration fabricated lifecycle delivery work.')
expect(webhook?.neejeeProviderAccountCount === 0 && webhook?.neejeeProviderReadinessCount === 0 && webhook?.providerQaRunCount === 0 && webhook?.oauthSelectionSessionCount === 0, 'Webhook migration fabricated provider evidence.')
expect(webhook?.fundingRequestCount === 0 && webhook?.mediaBalanceAccountCount === 0, 'Webhook migration created funding state.')
expect(webhook?.autonomousRunCount === 0 && webhook?.autonomousActiveQueueCount === 0, 'Webhook migration created autonomous work.')
expect(webhook?.cspReportObservedCount === 0, 'Webhook migration fabricated CSP telemetry.')
expect(webhook?.growthExecutorKillSwitch === true, 'Webhook proof lost the kill switch.')
expect(webhook?.migrationCreatesProviderCredential === false && webhook?.migrationCreatesMediaFunds === false && webhook?.migrationCreatesLifecycleJob === false && webhook?.migrationPerformsProviderMutation === false && webhook?.migrationReleasesKillSwitch === false, 'Webhook migration performed a forbidden side effect.')

if (failures.length) {
  console.error('P0-013 final parity snapshot verification failed.')
  failures.forEach(failure => console.error(`- ${failure}`))
  process.exit(1)
}

console.log(`P0-013 parity verified: ${files.length} uniquely versioned Git migrations, ${proof.webhook.supabase.productionLedgerCount} captured production ledger entries, historical reconciliation retained, governed autonomy/provider/funding/OAuth/readiness boundaries remain safe, durable CSP telemetry remains privacy-minimized/report-only, release schema evidence remains service-only, and webhook callback guards preserve zero synthetic external proof with the kill switch ON.`)
