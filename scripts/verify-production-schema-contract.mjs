import fs from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const contractPath = new URL('../config/production-schema-contract.json', import.meta.url)
const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'))
const tables = Array.isArray(contract.requiredPublicTables) ? contract.requiredPublicTables : []

if (!contract.contractVersion || tables.length === 0 || new Set(tables).size !== tables.length) {
  console.error('Invalid production schema contract.')
  process.exit(1)
}

const liveGate = process.env.VERCEL_ENV === 'production' || process.env.OYE_ENFORCE_LIVE_SCHEMA_GATE === '1'
if (!liveGate) {
  console.log(`Schema contract ${contract.contractVersion} validated statically (${tables.length} required tables).`)
  process.exit(0)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceRoleKey) {
  console.error('Production schema gate cannot run because Supabase server configuration is missing.')
  process.exit(1)
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const failures = []
for (const table of tables) {
  const { error } = await supabase.from(table).select('*', { head: true, count: 'exact' }).limit(0)
  if (error) failures.push({ table, code: error.code ?? 'unknown', message: error.message })
}

if (failures.length) {
  console.error(`Production schema contract ${contract.contractVersion} failed.`)
  for (const failure of failures) console.error(`- ${failure.table}: ${failure.code} ${failure.message}`)
  process.exit(1)
}

console.log(`Production schema contract ${contract.contractVersion} passed (${tables.length} tables).`)
