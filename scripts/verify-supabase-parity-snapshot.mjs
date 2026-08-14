import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')
const migrationsDir = path.join(repoRoot, 'supabase', 'migrations')
const snapshotPath = path.join(repoRoot, 'docs', 'proof', 'p0', 'P0-013-supabase-production-parity.json')

const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'))
const migrationFiles = fs.readdirSync(migrationsDir).filter((file) => file.endsWith('.sql')).sort()
const failures = []

// P0-013 is immutable evidence captured at a point in time. New migrations after that
// evidence cut are expected and are governed by the current schema contract/release gate.
if (migrationFiles.length < snapshot.gitMigrationFileCount) {
  failures.push(`Git migration count regressed below the captured baseline: snapshot=${snapshot.gitMigrationFileCount}, current=${migrationFiles.length}`)
}

for (const entry of snapshot.unledgeredGitMigrations) {
  if (!migrationFiles.includes(entry.file)) {
    failures.push(`Captured schema-gap migration was removed from Git: ${entry.file}`)
  }
}

if (snapshot.productionLedgerCount !== snapshot.ledgeredLogicalNames.length) {
  failures.push(`Captured production ledger count does not match ledgeredLogicalNames length: ${snapshot.productionLedgerCount} vs ${snapshot.ledgeredLogicalNames.length}`)
}

if (snapshot.conclusion !== 'real_schema_gap') {
  failures.push(`Unexpected captured parity conclusion: ${snapshot.conclusion}`)
}

if (!snapshot.capturedAt || !snapshot.gitSha || !snapshot.supabaseProjectRef) {
  failures.push('Captured parity evidence is missing provenance fields.')
}

if (failures.length > 0) {
  console.error('P0-013 Supabase baseline evidence is stale or internally inconsistent.')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

const newMigrationCount = migrationFiles.length - snapshot.gitMigrationFileCount
console.log(`P0-013 baseline verified: ${snapshot.gitMigrationFileCount} captured Git migrations, ${snapshot.productionLedgerCount} captured ledger entries, ${snapshot.unledgeredGitMigrations.length} captured schema-gap migrations; ${newMigrationCount} newer migration(s) are governed by the current release schema contract.`)
