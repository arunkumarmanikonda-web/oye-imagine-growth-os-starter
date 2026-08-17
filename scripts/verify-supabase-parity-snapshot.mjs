import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')
const migrationsDir = path.join(repoRoot, 'supabase', 'migrations')
const snapshotPath = path.join(repoRoot, 'docs', 'proof', 'p0', 'P0-013-supabase-production-parity.json')
const repairManifestPath = path.join(repoRoot, 'docs', 'proof', 'p0', 'P0-014-migration-history-repair-2026-08-17.json')

const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'))
const repairManifest = fs.existsSync(repairManifestPath)
  ? JSON.parse(fs.readFileSync(repairManifestPath, 'utf8'))
  : { renames: [] }
const migrationFiles = fs.readdirSync(migrationsDir).filter((file) => file.endsWith('.sql')).sort()
const migrationFileSet = new Set(migrationFiles)
const failures = []

const renameMap = new Map(repairManifest.renames.map((entry) => [entry.oldFile, entry]))
const renameTargets = new Set()

function gitBlobSha(filePath) {
  const content = fs.readFileSync(filePath)
  const header = Buffer.from(`blob ${content.length}\0`)
  return crypto.createHash('sha1').update(header).update(content).digest('hex')
}

// P0-013 is immutable evidence captured at a point in time. New migrations after that
// evidence cut are expected and are governed by the current schema contract/release gate.
// P0-014 may rename captured gap files, but only through an explicit machine-readable
// manifest whose target content still hashes to the original Git blob SHA.
if (migrationFiles.length < snapshot.gitMigrationFileCount) {
  failures.push(`Git migration count regressed below the captured baseline: snapshot=${snapshot.gitMigrationFileCount}, current=${migrationFiles.length}`)
}

if (repairManifest.renames.length > 0) {
  if (repairManifest.issue !== 'P0-014' || repairManifest.repairType !== 'filename_only_reversioning') {
    failures.push('P0-014 repair manifest has an unexpected issue or repairType.')
  }
  if (repairManifest.productionMutationAuthorized !== false) {
    failures.push('P0-014 repair manifest must explicitly keep production mutation unauthorized.')
  }
  if (!migrationFileSet.has(repairManifest.canonicalFile)) {
    failures.push(`P0-014 canonical migration is missing: ${repairManifest.canonicalFile}`)
  }
}

for (const entry of repairManifest.renames) {
  if (!entry.oldFile || !entry.newFile || !entry.gitBlobSha) {
    failures.push(`P0-014 repair manifest entry is incomplete: ${JSON.stringify(entry)}`)
    continue
  }
  if (renameTargets.has(entry.newFile)) {
    failures.push(`P0-014 repair target is duplicated: ${entry.newFile}`)
  }
  renameTargets.add(entry.newFile)
  if (migrationFileSet.has(entry.oldFile)) {
    failures.push(`P0-014 old migration filename still exists after repair: ${entry.oldFile}`)
  }
  if (!migrationFileSet.has(entry.newFile)) {
    failures.push(`P0-014 repaired migration target is missing: ${entry.newFile}`)
    continue
  }
  const actualBlobSha = gitBlobSha(path.join(migrationsDir, entry.newFile))
  if (actualBlobSha !== entry.gitBlobSha) {
    failures.push(`P0-014 repaired migration content changed: ${entry.newFile}; expected Git blob ${entry.gitBlobSha}, got ${actualBlobSha}`)
  }
}

for (const entry of snapshot.unledgeredGitMigrations) {
  if (migrationFileSet.has(entry.file)) continue

  const repair = renameMap.get(entry.file)
  if (!repair) {
    failures.push(`Captured schema-gap migration was removed from Git without a P0-014 repair mapping: ${entry.file}`)
    continue
  }
  if (!migrationFileSet.has(repair.newFile)) {
    failures.push(`Captured schema-gap migration repair target is missing from Git: ${entry.file} -> ${repair.newFile}`)
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
  console.error('P0-013/P0-014 Supabase baseline evidence is stale or internally inconsistent.')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

const newMigrationCount = migrationFiles.length - snapshot.gitMigrationFileCount
console.log(`P0-013 baseline verified with P0-014 history repair: ${snapshot.gitMigrationFileCount} captured Git migrations, ${snapshot.productionLedgerCount} captured ledger entries, ${snapshot.unledgeredGitMigrations.length} captured schema-gap migrations, ${repairManifest.renames.length} content-identical rename mapping(s); ${newMigrationCount} newer migration(s) are governed by the current release schema contract.`)
