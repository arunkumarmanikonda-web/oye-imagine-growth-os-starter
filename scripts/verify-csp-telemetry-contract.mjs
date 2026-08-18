import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const files = {
  config: path.join(repoRoot, 'next.config.ts'),
  migration: path.join(repoRoot, 'supabase', 'migrations', '20260818183000_durable_csp_telemetry.sql'),
  service: path.join(repoRoot, 'src', 'lib', 'security', 'csp-telemetry.ts'),
  collector: path.join(repoRoot, 'src', 'app', 'api', 'security', 'csp-report', 'route.ts'),
  adminApi: path.join(repoRoot, 'src', 'app', 'api', 'admin', 'security', 'csp', 'route.ts'),
  cockpit: path.join(repoRoot, 'src', 'app', 'admin', 'security', 'csp', 'page.tsx'),
}

const failures = []
function expect(condition, message) { if (!condition) failures.push(message) }
function read(key) {
  const target = files[key]
  expect(fs.existsSync(target), `${key}: required file is missing`)
  return fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : ''
}

const config = read('config')
const migration = read('migration')
const service = read('service')
const collector = read('collector')
const adminApi = read('adminApi')
const cockpit = read('cockpit')

expect(config.includes("Content-Security-Policy-Report-Only"), 'CSP must remain report-only until representative telemetry is approved.')
expect(!/key:\s*['\"]Content-Security-Policy['\"]/.test(config), 'Enforced CSP header was introduced without release evidence.')
expect(config.includes('report-uri /api/security/csp-report'), 'CSP report endpoint is not configured.')

expect(migration.includes('security_csp_report_buckets'), 'Durable CSP report table is missing.')
expect(migration.includes('security_csp_report_rate_limits'), 'CSP rate-limit table is missing.')
expect(migration.includes('alter table public.security_csp_report_buckets enable row level security'), 'CSP report table must have RLS enabled.')
expect(migration.includes('alter table public.security_csp_report_rate_limits enable row level security'), 'CSP rate-limit table must have RLS enabled.')
expect(migration.includes('revoke all on table public.security_csp_report_buckets from anon, authenticated'), 'Browser roles must be revoked from CSP reports.')
expect(migration.includes('revoke all on table public.security_csp_report_rate_limits from anon, authenticated'), 'Browser roles must be revoked from CSP rate limits.')
expect(migration.includes("now() - interval '30 days'"), 'CSP telemetry must have bounded 30-day retention.')
expect(migration.includes("now() - interval '1 day'"), 'CSP rate buckets must have bounded one-day retention.')
expect(migration.includes("'oye-csp-telemetry-retention'"), 'CSP retention cron must be source-controlled.')
expect(!/\b(ip|ip_address|remote_addr|client_ip)\b/i.test(migration), 'CSP database schema must not store raw IP-address fields.')
expect(!/query|string_query|search_params|fragment|hash_value/i.test(migration), 'CSP database schema must not store query strings or fragments.')

expect(service.includes("new URL(raw)"), 'CSP URL normalization must parse URLs before persistence.')
expect(service.includes('url.origin.toLowerCase()'), 'CSP telemetry must store normalized origin rather than raw URL.')
expect(service.includes('url.pathname.slice'), 'CSP telemetry may store bounded pathname only.')
expect(!service.includes('url.search'), 'CSP telemetry must not persist URL query strings.')
expect(!service.includes('url.hash'), 'CSP telemetry must not persist URL fragments.')
expect(service.includes("createHmac('sha256'"), 'Network abuse-control key must be HMAC-derived.')
expect(service.includes("createHash('sha256'"), 'CSP report fingerprint must be deterministic and hashed.')
expect(service.includes("import 'server-only'"), 'CSP telemetry service must remain server-only.')

expect(collector.includes('MAX_REPORT_BYTES = 32 * 1024'), 'Collector body bound changed unexpectedly.')
expect(collector.includes('MAX_REPORTS_PER_REQUEST = 10'), 'Collector batch bound changed unexpectedly.')
expect(collector.includes("return new NextResponse(null, { status: 204"), 'Collector must fail closed without exposing storage detail to browsers.')
expect(!collector.includes("console.info('csp_report_only_violation', report)"), 'Collector must not log raw CSP report payloads.')

expect(adminApi.includes("requireApiAccess({ lane: 'admin' })"), 'CSP admin API must use the admin AAL2 access boundary.')
expect(adminApi.includes("access.membership.role_key !== 'platform_owner'"), 'CSP telemetry must be platform-owner only.')
expect(adminApi.includes("'Cache-Control': 'private, no-store'"), 'CSP admin API must be private/no-store.')
expect(cockpit.includes('Keep CSP report-only'), 'Cockpit must not imply enforcement from empty telemetry.')
expect(!/enforce\s+csp/i.test(cockpit.replace('Enforcement remains a separate release decision.', '')), 'Cockpit must not expose an enforcement mutation control.')

if (failures.length) {
  console.error('CSP telemetry contract verification failed.')
  failures.forEach(failure => console.error(`- ${failure}`))
  process.exit(1)
}

console.log('CSP telemetry contract verified: report-only policy preserved, durable privacy-minimized storage bounded by RLS/rate limits/retention, no raw URL query-fragment or IP storage, and AAL2 platform-owner read access only.')
