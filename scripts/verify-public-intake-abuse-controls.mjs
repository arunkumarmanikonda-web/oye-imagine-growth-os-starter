import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const failures = []

function expect(condition, message) {
  if (!condition) failures.push(message)
}

function read(relativePath) {
  const absolute = path.join(repoRoot, relativePath)
  expect(fs.existsSync(absolute), `${relativePath}: required public intake control is missing.`)
  return fs.existsSync(absolute) ? fs.readFileSync(absolute, 'utf8') : ''
}

const marketplace = read('src/app/api/marketplace/requests/route.ts')
const contact = read('src/app/api/public/contact/route.ts')
const boundedJson = read('src/lib/security/bounded-json.ts')
const limiterMigration = read('supabase/migrations/20260817211446_public_contact_abuse_rate_limits.sql')

expect(marketplace.includes('const MAX_BODY_BYTES = 32_768'), 'Marketplace intake must retain a 32 KiB request ceiling.')
expect(marketplace.includes('readBoundedJson<RequestBody>(request, MAX_BODY_BYTES)'), 'Marketplace intake must enforce its byte limit using the bounded stream reader.')
expect(marketplace.includes('companyFax'), 'Marketplace intake must retain the honeypot field.')
expect(marketplace.includes('text(body.brief, 5000)'), 'Marketplace brief must remain bounded to 5,000 characters.')
expect(marketplace.includes('text(body.email, 320)'), 'Marketplace email must remain bounded.')
expect(marketplace.includes('text(body.website, 500)'), 'Marketplace website must remain bounded.')
expect(marketplace.includes('brief.length < 10'), 'Marketplace intake must reject empty/trivial briefs.')

const marketplaceLimiterCalls = marketplace.match(/claim_public_contact_rate_limit/g) || []
expect(marketplaceLimiterCalls.length === 2, `Marketplace intake must use exactly two durable limiter claims; found ${marketplaceLimiterCalls.length}.`)
expect(marketplace.includes('p_limit: 12'), 'Marketplace network limiter must remain 12 requests per window.')
expect(marketplace.includes('p_limit: 3'), 'Marketplace identity limiter must remain 3 requests per window.')
expect(marketplace.includes('marketplace|network|'), 'Marketplace network limiter must use a marketplace-scoped fingerprint.')
expect(marketplace.includes('marketplace|identity|'), 'Marketplace identity limiter must use a marketplace-scoped fingerprint.')
expect(marketplace.includes("'Retry-After': String(RATE_WINDOW_SECONDS)"), 'Marketplace 429 response must advertise Retry-After.')
expect(marketplace.includes("code: 'marketplace_unavailable'"), 'Marketplace failure response must be generic and fail closed.')
expect(!marketplace.includes('error instanceof Error ? error.message'), 'Marketplace route must not expose provider/database error messages.')
expect(!marketplace.includes('error.message :'), 'Marketplace route must not expose raw internal error messages.')

const contactLimiterCalls = contact.match(/claim_public_contact_rate_limit/g) || []
expect(contactLimiterCalls.length === 2, `Public contact must retain exactly two durable limiter claims; found ${contactLimiterCalls.length}.`)
expect(contact.includes('readBoundedJson<Record<string, unknown>>(request, 16_384)'), 'Public contact must enforce its 16 KiB ceiling using the bounded stream reader.')
expect(contact.includes('p_limit: 12'), 'Public contact network limiter changed unexpectedly.')
expect(contact.includes('p_limit: 3'), 'Public contact identity limiter changed unexpectedly.')

expect(boundedJson.includes("content-length"), 'Bounded JSON reader must keep the cheap Content-Length precheck.')
expect(boundedJson.includes('request.body.getReader()'), 'Bounded JSON reader must enforce limits on actual streamed bytes.')
expect(boundedJson.includes('totalBytes > maxBytes'), 'Bounded JSON reader must stop when actual bytes exceed the limit.')
expect(boundedJson.includes("reader.cancel('payload_too_large')"), 'Bounded JSON reader must cancel oversized streams.')
expect(boundedJson.includes('JSON.parse'), 'Bounded JSON reader must parse only after the byte boundary is enforced.')

expect(limiterMigration.includes('PRIMARY KEY'), 'Durable public intake limiter must remain atomic on request fingerprint.')
expect(limiterMigration.includes('ON CONFLICT (request_fingerprint) DO UPDATE'), 'Durable public intake limiter must retain race-safe upsert semantics.')
expect(limiterMigration.includes('SECURITY DEFINER'), 'Durable public intake limiter must remain SECURITY DEFINER.')
expect(limiterMigration.includes('SET search_path = pg_catalog, public'), 'Durable public intake limiter must retain a fixed safe search path.')
expect(limiterMigration.includes('REVOKE EXECUTE ON FUNCTION public.claim_public_contact_rate_limit'), 'Browser execute must remain revoked from the durable limiter RPC.')
expect(limiterMigration.includes('GRANT EXECUTE ON FUNCTION public.claim_public_contact_rate_limit') && limiterMigration.includes('TO service_role'), 'Durable limiter RPC must remain service-role executable.')

if (failures.length) {
  console.error('Public intake abuse-control verification failed.')
  failures.forEach(failure => console.error(`- ${failure}`))
  process.exit(1)
}

console.log('Public intake abuse controls verified: actual streamed bytes are bounded, marketplace uses a honeypot, both persistent public writes use two-layer race-safe durable throttling, browser roles cannot call the limiter directly, and marketplace failures do not leak internal errors.')
