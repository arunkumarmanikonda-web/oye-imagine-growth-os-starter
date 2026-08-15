import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

type ProviderRow = {
  provider_key: string
  display_name: string
  provider_category: string
  enabled: boolean
}

function labelState(input: { enabled: boolean; credentials: number; accounts: number; healthy: boolean }) {
  if (!input.enabled) return { label: 'Unavailable', description: 'Not enabled in the production provider catalogue.' }
  if (input.healthy && input.accounts > 0) return { label: 'Healthy', description: 'A current provider health signal and connected account evidence exist.' }
  if (input.accounts > 0) return { label: 'Connected', description: 'At least one provider account record exists; current health evidence is not shown as healthy.' }
  if (input.credentials > 0) return { label: 'Configured', description: 'Production credential metadata exists, but connected-account/health evidence is not yet complete.' }
  return { label: 'Supported', description: 'The provider path is supported, but no production credential or connected account is currently evidenced.' }
}

export async function IntegrationEvidenceMatrix() {
  const admin = createSupabaseAdminClient()
  const [definitions, credentials, accounts, health] = await Promise.all([
    admin.from('config_provider_definitions').select('provider_key,display_name,provider_category,enabled').order('provider_category').order('display_name'),
    admin.from('config_provider_credentials').select('provider_key,status'),
    admin.from('integration_accounts').select('provider,status'),
    admin.from('config_provider_health_events').select('provider_key,status,created_at').order('created_at', { ascending: false }).limit(250),
  ])

  if (definitions.error) return null

  const credentialCount = new Map<string, number>()
  for (const row of credentials.data ?? []) credentialCount.set(String(row.provider_key), (credentialCount.get(String(row.provider_key)) ?? 0) + 1)

  const accountCount = new Map<string, number>()
  for (const row of accounts.data ?? []) accountCount.set(String(row.provider), (accountCount.get(String(row.provider)) ?? 0) + 1)

  const latestHealth = new Map<string, string>()
  for (const row of health.data ?? []) if (!latestHealth.has(String(row.provider_key))) latestHealth.set(String(row.provider_key), String(row.status).toLowerCase())

  const rows = (definitions.data ?? []) as ProviderRow[]
  if (!rows.length) return null

  return (
    <section className="oi-container mt-10" aria-labelledby="integration-evidence-heading">
      <div className="rounded-[2.5rem] border-2 border-black bg-white p-7 shadow-[7px_7px_0_#111] md:p-10">
        <p className="text-xs font-black uppercase tracking-[0.22em]">Live production evidence</p>
        <h2 id="integration-evidence-heading" className="mt-3 max-w-4xl text-4xl font-black tracking-[-0.05em] md:text-5xl">What is supported is not automatically presented as connected.</h2>
        <p className="mt-4 max-w-4xl text-base leading-8 text-black/65">This matrix is generated from the production provider registry and evidence tables. It never exposes credentials. A provider advances only when the corresponding production evidence exists.</p>

        <div className="mt-7 overflow-x-auto rounded-[1.75rem] border-2 border-black">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-black text-white"><tr><th className="px-5 py-4">Provider</th><th className="px-5 py-4">Category</th><th className="px-5 py-4">Evidence state</th><th className="px-5 py-4">Meaning</th></tr></thead>
            <tbody>
              {rows.map((provider) => {
                const key = provider.provider_key
                const state = labelState({
                  enabled: provider.enabled,
                  credentials: credentialCount.get(key) ?? 0,
                  accounts: accountCount.get(key) ?? 0,
                  healthy: ['healthy','ok','success','ready','connected'].includes(latestHealth.get(key) ?? ''),
                })
                return (
                  <tr key={key} className="border-t border-black/15 align-top">
                    <td className="px-5 py-4"><strong className="block text-base">{provider.display_name}</strong><span className="mt-1 block font-mono text-xs text-black/45">{key}</span></td>
                    <td className="px-5 py-4 capitalize">{provider.provider_category.replaceAll('_', ' ')}</td>
                    <td className="px-5 py-4"><span className="inline-flex rounded-full border-2 border-black bg-[#fdca5a] px-3 py-1 text-xs font-black">{state.label}</span></td>
                    <td className="max-w-xl px-5 py-4 leading-7 text-black/65">{state.description}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-5 text-xs leading-6 text-black/50">Advertising, analytics, payment, electronic-signature or publishing providers not present in the production provider registry are not represented here as active integrations.</p>
      </div>
    </section>
  )
}
