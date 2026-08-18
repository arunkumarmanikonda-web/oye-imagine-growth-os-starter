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
  expect(fs.existsSync(absolute), `${relativePath}: required unsubscribe control is missing.`)
  return fs.existsSync(absolute) ? fs.readFileSync(absolute, 'utf8') : ''
}

function functionSlice(source, exportName, nextExportName) {
  const start = source.indexOf(`export async function ${exportName}`)
  const end = nextExportName ? source.indexOf(`export async function ${nextExportName}`, start + 1) : source.length
  expect(start >= 0, `${exportName}: function is missing.`)
  return start >= 0 ? source.slice(start, end > start ? end : source.length) : ''
}

const route = read('src/app/api/public/privacy/unsubscribe/route.ts')
const consent = read('src/lib/privacy/consent.ts')
const delivery = read('src/lib/privacy/delivery.ts')
const boundedBody = read('src/lib/security/bounded-json.ts')
const migration = read('supabase/migrations/20260818230000_privacy_unsubscribe_guard.sql')
const proof = JSON.parse(read('docs/proof/p0/P0-013-production-parity-unsubscribe-guard-2026-08-18.json') || '{}')

const getRoute = functionSlice(route, 'GET', 'POST')
const postRoute = functionSlice(route, 'POST')
const applyUnsubscribe = functionSlice(consent, 'applyPublicUnsubscribe', 'listPrivacyState')

expect(getRoute.includes('verifyUnsubscribeToken(token)'), 'GET must validate the signed/expiring unsubscribe token.')
expect(!getRoute.includes('applyPublicUnsubscribe('), 'GET must never mutate consent or suppression state.')
expect(getRoute.includes('method="post"'), 'GET confirmation page must submit via POST.')
expect(getRoute.includes('List-Unsubscribe'), 'GET confirmation form must include the one-click form field.')
expect(getRoute.includes('One-Click'), 'GET confirmation form must include the One-Click signal.')
expect(route.includes("'X-Robots-Tag': 'noindex, nofollow, noarchive'"), 'Unsubscribe confirmation must prevent indexing/caching by crawlers.')
expect(route.includes("'Cache-Control': 'no-store'"), 'Unsubscribe responses must remain no-store.')

expect(route.includes('const MAX_ONE_CLICK_BODY_BYTES = 2_048'), 'One-click POST must retain a 2 KiB body ceiling.')
expect(postRoute.includes('readBoundedBody(request, MAX_ONE_CLICK_BODY_BYTES)'), 'One-click POST must enforce the limit on actual streamed bytes.')
expect(postRoute.includes("params.get('List-Unsubscribe') !== 'One-Click'"), 'One-click POST must require List-Unsubscribe=One-Click.')
expect(postRoute.includes('applyPublicUnsubscribe(token)'), 'POST must invoke the signed unsubscribe mutation path.')
expect(postRoute.includes('result.alreadyApplied'), 'POST must handle replay/idempotent success without duplicating state.')
expect(!postRoute.includes('console.log'), 'Unsubscribe POST must not log recipient/token data.')

expect(applyUnsubscribe.includes('verifyUnsubscribeToken(token)'), 'Mutation path must verify the signed/expiring unsubscribe token.')
expect(applyUnsubscribe.includes("admin.rpc('apply_public_unsubscribe_guarded'"), 'Mutation path must use the atomic database unsubscribe guard.')
expect(!applyUnsubscribe.includes("from('privacy_suppressions').insert"), 'Mutation path must not bypass the guarded RPC with a direct suppression insert.')
expect(!applyUnsubscribe.includes("from('privacy_consent_events').insert"), 'Mutation path must not bypass the guarded RPC with a direct consent-event insert.')

expect(delivery.includes("'List-Unsubscribe': `<${input.unsubscribeUrl}>`"), 'Email delivery must retain the List-Unsubscribe URL header.')
expect(delivery.includes("'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'"), 'Email delivery must retain standards-compatible one-click POST signaling.')
expect(delivery.includes('/api/public/privacy/unsubscribe?token='), 'Lifecycle email delivery must keep the signed unsubscribe endpoint.')

expect(boundedBody.includes('export async function readBoundedBody'), 'Shared bounded raw-body reader must remain available.')
expect(boundedBody.includes('request.body.getReader()'), 'Bounded body reader must enforce actual streamed bytes.')
expect(boundedBody.includes('totalBytes > maxBytes'), 'Bounded body reader must reject oversized streamed requests.')
expect(boundedBody.includes("reader.cancel('payload_too_large')"), 'Bounded body reader must cancel oversized streams.')

expect(migration.includes('apply_public_unsubscribe_guarded'), 'Unsubscribe guard RPC is missing.')
expect(migration.includes('security definer'), 'Unsubscribe guard RPC must be SECURITY DEFINER.')
expect(migration.includes('set search_path = pg_catalog, public'), 'Unsubscribe guard RPC must retain a fixed safe search path.')
expect(migration.includes('pg_advisory_xact_lock'), 'Unsubscribe guard must serialize repeated/parallel semantic opt-outs.')
expect(migration.includes('hashtextextended'), 'Unsubscribe advisory lock must be scoped to the semantic unsubscribe key.')
expect(migration.includes("coalesce(p_workspace_id::text, '<null>')"), 'Unsubscribe advisory lock must include workspace scope.')
expect(migration.includes('workspace_id is not distinct from p_workspace_id'), 'Unsubscribe consent matching must be workspace-correct including null workspace.')
expect(migration.includes("scope = 'global'"), 'Unsubscribe suppression lookup must honor applicable global suppressions.')
expect(migration.includes("scope = 'channel'"), 'Unsubscribe suppression lookup must honor applicable channel suppressions.')
expect(migration.includes("v_latest_decision is distinct from 'withdrawn'"), 'Unsubscribe guard must not create duplicate withdrawal events when already withdrawn.')
expect(migration.includes("'alreadyApplied', not (v_suppression_created or v_consent_created)"), 'Unsubscribe guard must explicitly report idempotent replay.')
expect(migration.includes('revoke all on function public.apply_public_unsubscribe_guarded'), 'Browser execute must remain revoked from the unsubscribe guard RPC.')
expect(migration.includes('from public, anon, authenticated'), 'Unsubscribe guard revoke must explicitly cover browser roles.')
expect(migration.includes('grant execute on function public.apply_public_unsubscribe_guarded') && migration.includes('to service_role'), 'Unsubscribe guard RPC must remain service-role executable.')

expect(proof.supabase?.productionLedgerCount === 95, 'Unsubscribe proof must record 95 production migrations.')
expect(proof.supabase?.productionLedgerLastVersion === '20260818212902', 'Unsubscribe proof has the wrong production migration version.')
expect(proof.supabase?.productionLedgerLastName === 'privacy_unsubscribe_guard', 'Unsubscribe proof has the wrong production migration name.')
expect(proof.liveControls?.guardedUnsubscribeAnonExecute === false && proof.liveControls?.guardedUnsubscribeAuthenticatedExecute === false && proof.liveControls?.guardedUnsubscribeServiceRoleExecute === true, 'Unsubscribe proof records unsafe RPC privileges.')
expect(proof.liveControls?.suppressionCount === 0 && proof.liveControls?.consentEventCount === 0, 'Unsubscribe proof contains synthetic privacy state.')
expect(proof.liveControls?.lifecycleDeliveryJobCount === 0 && proof.liveControls?.neejeeProviderAccountCount === 0 && proof.liveControls?.autonomousRunCount === 0, 'Unsubscribe proof contains unrelated execution/provider state.')
expect(proof.liveControls?.growthExecutorKillSwitch === true, 'Unsubscribe proof lost the autonomy kill switch.')

if (failures.length) {
  console.error('Unsubscribe intent/replay contract verification failed.')
  failures.forEach(failure => console.error(`- ${failure}`))
  process.exit(1)
}

console.log('Unsubscribe intent/replay contract verified: GET is confirmation-only, one-click POST is actual-body bounded and explicitly signaled, signed token mutation uses a service-role-only advisory-locked workspace-correct guard, repeated/parallel requests are idempotent, and no synthetic privacy/provider/autonomy state exists.')
