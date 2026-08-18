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
  expect(fs.existsSync(absolute), `${relativePath}: required webhook control is missing.`)
  return fs.existsSync(absolute) ? fs.readFileSync(absolute, 'utf8') : ''
}

const whatsapp = read('src/app/api/webhooks/whatsapp/route.ts')
const lifecycle = read('src/app/api/public/lifecycle/callback/route.ts')
const guardedService = read('src/lib/privacy/delivery-callback.ts')
const boundedBody = read('src/lib/security/bounded-json.ts')
const migration = read('supabase/migrations/20260818220000_lifecycle_webhook_guard.sql')
const proof = JSON.parse(read('docs/proof/p0/P0-013-production-parity-webhook-authenticity-2026-08-18.json') || '{}')

expect(whatsapp.includes("providerKey: 'meta_marketing'"), 'WhatsApp webhook must resolve governed Meta provider configuration.')
expect(whatsapp.includes("fieldKeys: ['META_APP_SECRET', 'WHATSAPP_WEBHOOK_VERIFY_TOKEN']"), 'WhatsApp webhook must resolve app secret and verify token from governed runtime config.')
expect(whatsapp.includes('WHATSAPP_CLOUD_APP_SECRET'), 'WhatsApp webhook may accept the dedicated Cloud app-secret environment alias.')
expect(whatsapp.includes("mode !== 'subscribe'"), 'WhatsApp verification must require hub.mode=subscribe.')
expect(whatsapp.includes("hub.verify_token"), 'WhatsApp verification must read the provider verify token.')
expect(whatsapp.includes('timingSafeStringEqual'), 'WhatsApp verification token comparison must be timing-safe.')
expect(whatsapp.includes("code: 'verification_failed'"), 'WhatsApp verification failure must be generic.')
expect(!whatsapp.includes('Webhook endpoint is reachable'), 'Legacy unauthenticated webhook reachability response must not return.')
expect(!whatsapp.toLowerCase().includes('aisensy'), 'Legacy AiSensy placeholder marker must not remain in the WhatsApp Cloud webhook.')

expect(whatsapp.includes('const MAX_WEBHOOK_BYTES = 262_144'), 'WhatsApp webhook must retain a 256 KiB actual-body ceiling.')
expect(whatsapp.includes('readBoundedBody(request, MAX_WEBHOOK_BYTES)'), 'WhatsApp webhook must read an actually bounded raw body.')
expect(whatsapp.includes("x-hub-signature-256"), 'WhatsApp webhook must require X-Hub-Signature-256.')
expect(whatsapp.includes("createHmac('sha256', secret).update(rawBody)"), 'WhatsApp webhook must compute HMAC-SHA256 over exact raw bytes.')
expect(whatsapp.includes("/^sha256=([a-f0-9]{64})$/i"), 'WhatsApp webhook must require the expected sha256 signature shape.')
expect(whatsapp.includes('crypto.timingSafeEqual(expected, actual)'), 'WhatsApp HMAC comparison must be timing-safe.')
const signatureCheckIndex = whatsapp.indexOf('if (!signatureValid(rawBody.bytes, signature, appSecret))')
const jsonParseIndex = whatsapp.indexOf('JSON.parse(new TextDecoder().decode(rawBody.bytes))')
expect(signatureCheckIndex >= 0 && jsonParseIndex > signatureCheckIndex, 'WhatsApp HMAC verification must occur before JSON parsing.')
expect(!whatsapp.includes('console.log'), 'WhatsApp webhook must not log raw or parsed provider payloads.')
expect(whatsapp.includes("root.object !== 'whatsapp_business_account'"), 'WhatsApp webhook must scope parsed events to WhatsApp Business Account payloads.')
expect(whatsapp.includes('entry.slice(0, 50)') && whatsapp.includes('changes.slice(0, 50)') && whatsapp.includes('statuses.slice(0, 100)'), 'WhatsApp webhook must bound provider event traversal.')
expect(whatsapp.includes('return events.slice(0, 200)'), 'WhatsApp webhook must cap callback work per request.')
expect(whatsapp.includes("provider: 'whatsapp_cloud'"), 'WhatsApp callback metadata must identify the Cloud provider.')
expect(whatsapp.includes('applyGuardedDeliveryCallback(event)'), 'WhatsApp status events must use the guarded callback service.')

expect(lifecycle.includes('OYE_PROVIDER_CALLBACK_SECRET'), 'Generic lifecycle callback must retain its bearer-secret boundary.')
expect(lifecycle.includes('crypto.timingSafeEqual'), 'Generic lifecycle callback bearer-secret comparison must remain timing-safe.')
expect(lifecycle.includes('readBoundedJson<Record<string, unknown>>(request, 32_768)'), 'Generic lifecycle callback must retain a 32 KiB actual-body bound.')
expect(lifecycle.includes('applyGuardedDeliveryCallback'), 'Generic lifecycle callback must use the guarded transition service.')
expect(!lifecycle.includes('applyDeliveryCallback'), 'Generic lifecycle callback must not use the legacy unguarded updater.')

expect(guardedService.includes("import 'server-only'"), 'Guarded lifecycle callback service must remain server-only.')
expect(guardedService.includes("admin.rpc('apply_lifecycle_delivery_callback_guarded'"), 'Guarded lifecycle callback service must call the atomic database RPC.')
expect(!guardedService.includes('from(\'lifecycle_delivery_jobs\').update'), 'Guarded lifecycle callback service must not bypass the atomic RPC with a direct update.')

expect(boundedBody.includes('export async function readBoundedBody'), 'Shared security helper must expose bounded raw-body reading.')
expect(boundedBody.includes('request.body.getReader()'), 'Raw-body reader must enforce limits on streamed bytes.')
expect(boundedBody.includes('totalBytes > maxBytes'), 'Raw-body reader must stop oversized streams.')
expect(boundedBody.includes("reader.cancel('payload_too_large')"), 'Raw-body reader must cancel oversized streams before parsing.')

expect(migration.includes('create unique index if not exists ux_lifecycle_delivery_provider_message_id'), 'Lifecycle callback guard must enforce provider-message uniqueness.')
expect(migration.includes('apply_lifecycle_delivery_callback_guarded'), 'Lifecycle callback guard RPC is missing.')
expect(migration.includes('security definer'), 'Lifecycle callback guard RPC must be SECURITY DEFINER.')
expect(migration.includes('set search_path = pg_catalog, public'), 'Lifecycle callback guard RPC must use a fixed safe search path.')
expect(migration.includes('for update'), 'Lifecycle callback guard RPC must lock the delivery job before transition.')
expect(migration.includes("v_job.status in ('failed', 'cancelled', 'blocked')"), 'Lifecycle callback guard must preserve failed/cancelled/blocked terminal states.')
expect(migration.includes("v_job.status = 'delivered'"), 'Lifecycle callback guard must preserve delivered terminal state.')
expect(migration.includes("v_incoming = 'read'"), 'Lifecycle callback guard must allow read receipts to enrich delivered state without regression.')
expect(migration.includes('callback_metadata = coalesce(callback_metadata'), 'Lifecycle callback guard must merge bounded callback metadata rather than replacing blindly.')
expect(migration.includes('revoke all on function public.apply_lifecycle_delivery_callback_guarded'), 'Browser execute must be revoked from callback guard RPC.')
expect(migration.includes('from public, anon, authenticated'), 'Callback guard RPC revoke must explicitly cover browser roles.')
expect(migration.includes('grant execute on function public.apply_lifecycle_delivery_callback_guarded') && migration.includes('to service_role'), 'Callback guard RPC must remain service-role executable.')
expect(migration.includes("'WHATSAPP_WEBHOOK_VERIFY_TOKEN'"), 'Provider Vault catalog must include the WhatsApp webhook verify token.')
expect(migration.includes("'secret'"), 'WhatsApp webhook verify token must remain a secret field.')

expect(proof.supabase?.productionLedgerCount === 94, 'Webhook proof must record 94 production migrations.')
expect(proof.supabase?.productionLedgerLastVersion === '20260818211024', 'Webhook proof has the wrong production migration version.')
expect(proof.supabase?.productionLedgerLastName === 'lifecycle_webhook_guard', 'Webhook proof has the wrong production migration name.')
expect(proof.liveControls?.guardedCallbackAnonExecute === false && proof.liveControls?.guardedCallbackAuthenticatedExecute === false && proof.liveControls?.guardedCallbackServiceRoleExecute === true, 'Webhook proof records unsafe callback-RPC privileges.')
expect(proof.liveControls?.lifecycleDeliveryJobCount === 0, 'Webhook proof contains synthetic lifecycle jobs.')
expect(proof.liveControls?.neejeeProviderAccountCount === 0 && proof.liveControls?.providerQaRunCount === 0 && proof.liveControls?.neejeeProviderReadinessCount === 0, 'Webhook proof contains fabricated provider evidence.')
expect(proof.liveControls?.fundingRequestCount === 0 && proof.liveControls?.mediaBalanceAccountCount === 0, 'Webhook proof contains fabricated funding.')
expect(proof.liveControls?.autonomousRunCount === 0 && proof.liveControls?.autonomousActiveQueueCount === 0, 'Webhook proof contains autonomous execution work.')
expect(proof.liveControls?.growthExecutorKillSwitch === true, 'Webhook proof lost the autonomy kill switch.')

if (failures.length) {
  console.error('Webhook authenticity contract verification failed.')
  failures.forEach(failure => console.error(`- ${failure}`))
  process.exit(1)
}

console.log('Webhook authenticity contract verified: WhatsApp Cloud subscription and POST authenticity are fail-closed, HMAC is checked over bounded raw bytes before parsing, raw payload logging is absent, lifecycle callbacks are uniquely keyed and monotonic under row lock, callback RPC execute remains service-role only, and no synthetic provider/funding/autonomy evidence exists.')
