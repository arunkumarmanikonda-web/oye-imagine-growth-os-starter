import fs from 'node:fs'

const files = {
  migration: 'supabase/migrations/20260819143000_provider_runtime_alignment.sql',
  runtime: 'src/lib/config-control/runtime-provider-config.ts',
  vault: 'src/lib/config-control/provider-vault.ts',
  console: 'src/components/admin/ProviderVaultConsole.tsx',
  delivery: 'src/lib/privacy/delivery.ts',
  webhook: 'src/app/api/webhooks/whatsapp/route.ts',
}
const text = Object.fromEntries(Object.entries(files).map(([key, file]) => [key, fs.readFileSync(file, 'utf8')]))
const failures = []
const expect = (condition, message) => { if (!condition) failures.push(message) }

expect(text.runtime.includes("import 'server-only'"), 'Runtime provider resolver must remain server-only.')
expect(text.runtime.includes('resolveRuntimeProviderConfiguration'), 'Runtime provider configuration resolver is missing.')
expect(text.runtime.includes('resolveRuntimeCapabilityProvider'), 'Runtime capability provider resolver is missing.')
expect(text.runtime.includes("process.env[fieldKey]?.trim()"), 'Runtime resolver must preserve environment-first lookup.')
expect(text.runtime.includes("sources[fieldKey] = 'environment'"), 'Runtime resolver must record safe environment source metadata.')
expect(text.runtime.includes("sources[fieldKey] = 'vault'"), 'Runtime resolver must record safe Vault source metadata.')
expect(text.runtime.includes('requiredFieldKeys.length > 0 && missingRequired.length === 0'), 'Runtime provider readiness must fail closed when no activation contract exists.')

expect(text.vault.includes('configurationSource'), 'Provider Vault response must identify safe configuration source metadata.')
expect(text.vault.includes("environmentPresent ? 'environment' : vaultCredential ? 'vault' : null"), 'Provider Vault must distinguish environment and Vault configuration.')
expect(text.vault.includes('requiredFields.length > 0 && configuredRequired === requiredFields.length'), 'Provider Vault activation core must fail closed.')
expect(!text.console.includes('required.length === 0 ||'), 'Provider Vault UI must not treat zero required fields as ready.')
expect(text.console.includes('provider.activationCore.ready'), 'Provider Vault UI must consume server activation-core truth.')
expect(text.console.includes('Provider authority, machine QA and execution proof are separate gates'), 'Provider Vault UI must distinguish credentials from production readiness.')

const forbiddenDirectSecrets = [
  'process.env.RESEND_API_KEY',
  'process.env.RESEND_FROM_EMAIL',
  'process.env.FAST2SMS_API_KEY',
  'process.env.FAST2SMS_API_URL',
  'process.env.FAST2SMS_ROUTE',
  'process.env.FAST2SMS_SENDER_ID',
  'process.env.WHATSAPP_CLOUD_ACCESS_TOKEN',
  'process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID',
  'process.env.WHATSAPP_GRAPH_VERSION',
]
for (const forbidden of forbiddenDirectSecrets) expect(!text.delivery.includes(forbidden), `Governed lifecycle delivery bypasses provider fabric via ${forbidden}.`)
expect(text.delivery.includes('resolveRuntimeCapabilityProvider'), 'Governed lifecycle delivery must resolve capability routes.')
expect(text.delivery.includes("provider === 'whatsapp_cloud'"), 'WhatsApp Cloud execution path is missing.')
expect(text.delivery.includes("provider === 'aisensy'"), 'AiSensy governed fallback path is missing.')
expect(text.delivery.includes('provider: declaredProvider'), 'Blocked deliveries must remain auditable without provider resolution.')
expect(text.delivery.includes('providerResolution.providerKey'), 'Delivery job must persist the provider actually selected by the capability resolver.')
expect(text.delivery.includes('aisensy_template_mismatch'), 'AiSensy fallback must fail closed on template mismatch.')

for (const field of ['META_GRAPH_API_VERSION','META_APP_ID','META_APP_SECRET','META_OAUTH_REDIRECT_URI']) {
  expect(text.migration.includes(`'${field}'`), `Meta activation core is missing ${field}.`)
}
for (const field of ['LINKEDIN_API_VERSION','LINKEDIN_CLIENT_ID','LINKEDIN_CLIENT_SECRET','LINKEDIN_OAUTH_REDIRECT_URI']) {
  expect(text.migration.includes(`'${field}'`), `LinkedIn activation core is missing ${field}.`)
}
for (const field of ['WHATSAPP_CLOUD_ACCESS_TOKEN','WHATSAPP_CLOUD_PHONE_NUMBER_ID','WHATSAPP_GRAPH_VERSION']) {
  expect(text.migration.includes(`'whatsapp_cloud','${field}'`), `WhatsApp Cloud activation field is missing ${field}.`)
}
expect(text.migration.includes("primary_provider_key = 'whatsapp_cloud'"), 'WhatsApp lifecycle primary must be WhatsApp Cloud.')
expect(text.migration.includes("fallback_provider_keys = '[\"aisensy\"]'::jsonb"), 'WhatsApp lifecycle must retain AiSensy as governed fallback.')

expect(text.webhook.includes("providerKey: 'whatsapp_cloud'"), 'WhatsApp webhook must resolve dedicated Cloud configuration.')
expect(text.webhook.includes("providerKey: 'meta_marketing'"), 'WhatsApp webhook must retain Meta app-secret fallback.')
expect(text.webhook.includes("crypto.createHmac('sha256', secret)"), 'WhatsApp webhook HMAC verification was weakened.')
expect(text.webhook.includes('MAX_WEBHOOK_BYTES = 262_144'), 'WhatsApp webhook body cap was weakened.')
expect(text.webhook.includes('applyGuardedDeliveryCallback'), 'WhatsApp webhook replay-safe callback guard was removed.')

if (failures.length) {
  console.error('Provider runtime alignment contract failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}
console.log('Provider runtime alignment contract passed: env/Vault truth, routed lifecycle, WhatsApp authority, and fail-closed readiness are intact.')
