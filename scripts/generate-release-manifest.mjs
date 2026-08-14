import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const migrationsDir = path.join(root, 'supabase', 'migrations')
const contract = JSON.parse(fs.readFileSync(path.join(root, 'config', 'production-schema-contract.json'), 'utf8'))
const migrations = fs.readdirSync(migrationsDir).filter((name) => name.endsWith('.sql')).sort()
const digest = crypto.createHash('sha256').update(migrations.join('\n')).digest('hex')
const gitSha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || process.env.COMMIT_SHA || 'local'
const environment = process.env.VERCEL_ENV || process.env.NODE_ENV || 'local'

const manifest = {
  product: 'Oye !magine AI Growth OS',
  gitSha,
  environment,
  schemaContractVersion: contract.contractVersion,
  migrationFileCount: migrations.length,
  migrationManifestSha256: digest,
  generatedAt: new Date().toISOString(),
}

fs.mkdirSync(path.join(root, 'public'), { recursive: true })
fs.writeFileSync(path.join(root, 'public', 'release-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
console.log(`Generated release manifest for ${gitSha} (${environment}).`)
