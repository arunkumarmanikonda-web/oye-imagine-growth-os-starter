import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const migrationsDir = path.join(repoRoot, 'supabase', 'migrations')
const proofDir = path.join(repoRoot, 'docs', 'proof', 'p0')
const basePath = path.join(proofDir, 'P0-013-production-parity-unsubscribe-guard-2026-08-18.json')
const proofPath = path.join(proofDir, 'P0-013-production-parity-provider-runtime-2026-08-19.json')
const base = JSON.parse(fs.readFileSync(basePath, 'utf8'))
const proof = JSON.parse(fs.readFileSync(proofPath, 'utf8'))
const files = fs.readdirSync(migrationsDir).filter((file) => file.endsWith('.sql')).sort()
const failures = []
const expect = (condition, message) => { if (!condition) failures.push(message) }

expect(base?.issue === 'P0-013' && base?.conclusion === 'parity_reconciled', 'Base 95-migration parity proof is not reconciled.')
expect(base?.supabase?.productionLedgerCount === 95, 'Base proof must close at 95 production migrations.')
expect(base?.gitMigrations?.fileCount === 95, 'Base proof must close at 95 Git migrations.')
expect(base?.supabase?.productionLedgerLastVersion === '20260818212902', 'Unexpected 95-migration production tail version.')
expect(base?.supabase?.productionLedgerLastName === 'privacy_unsubscribe_guard', 'Unexpected 95-migration production tail name.')

expect(proof?.issue === 'P0-013' && proof?.conclusion === 'parity_reconciled', 'Provider-runtime parity proof is not reconciled.')
expect(proof?.baseSnapshot === path.basename(basePath), 'Provider-runtime proof does not chain from the 95-migration closure.')
expect(proof?.supabase?.projectRef === 'bqhaifivpcwwiauiynlv', 'Unexpected Supabase project ref.')
expect(proof?.supabase?.baseProductionLedgerCount === 95, 'Unexpected provider-runtime base ledger count.')
expect(proof?.supabase?.productionLedgerCount === 96, 'Provider-runtime production ledger must be 96.')
expect(proof?.gitMigrations?.baseFileCount === 95, 'Unexpected provider-runtime base Git count.')
expect(proof?.gitMigrations?.fileCount === 96, 'Provider-runtime Git migration count must be 96.')
expect(Array.isArray(proof?.gitMigrations?.productionOnly) && proof.gitMigrations.productionOnly.length === 0, 'Provider-runtime proof has production-only migrations.')
expect(Array.isArray(proof?.gitMigrations?.gitOnly) && proof.gitMigrations.gitOnly.length === 0, 'Provider-runtime proof has Git-only migrations.')
expect(proof?.supabase?.productionLedgerLastVersion === '20260819092907', 'Unexpected provider-runtime production tail version.')
expect(proof?.supabase?.productionLedgerLastName === 'provider_runtime_alignment', 'Unexpected provider-runtime production tail name.')

expect(files.length === 96, `Expected 96 source-controlled migrations, found ${files.length}.`)
const sourceFile = '20260819143000_provider_runtime_alignment.sql'
expect(files.includes(sourceFile), `Missing provider-runtime migration source ${sourceFile}.`)
const mapping = proof?.releaseMigrations?.[0]
expect(Array.isArray(proof?.releaseMigrations) && proof.releaseMigrations.length === 1, 'Provider-runtime proof must contain exactly one release migration.')
expect(mapping?.sourceFile === sourceFile, 'Unexpected provider-runtime source mapping.')
expect(mapping?.productionLedgerVersion === '20260819092907', 'Unexpected provider-runtime ledger mapping version.')
expect(mapping?.productionLedgerName === 'provider_runtime_alignment', 'Unexpected provider-runtime ledger mapping name.')

const seen = new Map()
for (const file of files) {
  const version = file.split('_', 1)[0]
  if (seen.has(version)) failures.push(`Duplicate migration version ${version}: ${seen.get(version)}, ${file}`)
  seen.set(version, file)
}

const boundary = proof?.activationBoundary || {}
expect(boundary.storedProductionProviderCredentials === 0, 'Provider-runtime migration fabricated a production credential.')
expect(boundary.neejeeProviderAccounts === 0, 'Provider-runtime migration fabricated a Neejee provider account.')
expect(boundary.neejeeProviderReadiness === 0, 'Provider-runtime migration fabricated provider readiness.')
expect(boundary.neejeeProviderQaRuns === 0, 'Provider-runtime migration fabricated provider QA.')
expect(boundary.pendingOauthSelectionSessions === 0, 'Provider-runtime migration created an OAuth selection session.')
expect(boundary.lifecycleDeliveryJobs === 0, 'Provider-runtime migration created or sent a lifecycle delivery.')
expect(boundary.neejeeFundingRequests === 0 && boundary.neejeeMediaAccounts === 0, 'Provider-runtime migration created funding or media balance state.')
expect(boundary.neejeeAutonomousRuns === 0 && boundary.neejeeActiveQueue === 0, 'Provider-runtime migration created autonomous work.')
expect(boundary.growthExecutorKillSwitch === true, 'Provider-runtime migration released the growth-executor kill switch.')

expect(proof?.providerContract?.whatsappPrimary === 'whatsapp_cloud', 'WhatsApp primary provider evidence is wrong.')
expect(JSON.stringify(proof?.providerContract?.whatsappFallbacks) === JSON.stringify(['aisensy']), 'WhatsApp fallback evidence is wrong.')
expect(proof?.providerContract?.metaActivationCoreRequired === true, 'Meta activation-core evidence is incomplete.')
expect(proof?.providerContract?.linkedinActivationCoreRequired === true, 'LinkedIn activation-core evidence is incomplete.')
expect(proof?.providerContract?.migrationTriggeredExternalAction === false, 'Provider-runtime migration must be non-triggering.')

if (failures.length) {
  console.error('Provider runtime parity closure failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}
console.log('Provider runtime parity closure passed: 96/96, exact ledger mapping, zero activation side effects.')
