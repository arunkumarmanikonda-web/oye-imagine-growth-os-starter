import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')
const migrationsDir = path.join(repoRoot, 'supabase', 'migrations')
const snapshotPath = path.join(
  repoRoot,
  'docs',
  'proof',
  'p0',
  'P0-013-supabase-production-parity.json',
)

const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'))
const migrationFiles = fs
  .readdirSync(migrationsDir)
  .filter((file) => file.endsWith('.sql'))
  .sort()

const logicalName = (file) => file.replace(/\.sql$/i, '').replace(/^\d+_/, '')
const ledgered = new Set(snapshot.ledgeredLogicalNames)
const unledgered = new Map(
  snapshot.unledgeredGitMigrations.map((entry) => [entry.file, entry]),
)
const productionTables = new Set(snapshot.productionPublicTables)
const failures = []

if (migrationFiles.length !== snapshot.gitMigrationFileCount) {
  failures.push(
    `Git migration count changed: snapshot=${snapshot.gitMigrationFileCount}, current=${migrationFiles.length}`,
  )
}

for (const file of migrationFiles) {
  const logical = logicalName(file)
  if (!ledgered.has(logical) && !unledgered.has(file)) {
    failures.push(`Migration is not classified by the parity snapshot: ${file}`)
  }
}

for (const entry of snapshot.unledgeredGitMigrations) {
  if (!migrationFiles.includes(entry.file)) {
    failures.push(`Snapshot references missing Git migration: ${entry.file}`)
  }

  if (entry.productionObjectState === 'absent') {
    for (const table of entry.expectedTables) {
      if (productionTables.has(table)) {
        failures.push(
          `Snapshot contradiction: ${table} is listed as a production table but ${entry.file} is classified absent`,
        )
      }
    }
  }
}

if (snapshot.productionLedgerCount !== snapshot.ledgeredLogicalNames.length) {
  failures.push(
    `Production ledger count does not match ledgeredLogicalNames length: ${snapshot.productionLedgerCount} vs ${snapshot.ledgeredLogicalNames.length}`,
  )
}

if (snapshot.conclusion !== 'real_schema_gap') {
  failures.push(`Unexpected parity conclusion: ${snapshot.conclusion}`)
}

if (failures.length > 0) {
  console.error('P0-013 Supabase parity snapshot is stale or internally inconsistent.')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log(
  `P0-013 parity snapshot verified: ${migrationFiles.length} Git migrations, ${snapshot.productionLedgerCount} ledgered, ${snapshot.unledgeredGitMigrations.length} confirmed schema-gap migrations.`,
)
