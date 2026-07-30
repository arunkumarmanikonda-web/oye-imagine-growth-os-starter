import { getLegalIdentitySummary, getOrganizationProfile, getSupportChannels, getSupportMailboxSummary } from '@/lib/recovery/company-profile'
import { getConfigCommandCenterCards, getProviderConfigProfiles, getProviderConfigSummary } from '@/lib/recovery/provider-config'
import { getNeejeeTruthSignals } from '@/lib/recovery/neejee-canonical'

export default function AdminConfigPage() {
  const legal = getLegalIdentitySummary()
  const profile = getOrganizationProfile()
  const supportChannels = getSupportChannels()
  const mailboxSummary = getSupportMailboxSummary()
  const providerProfiles = getProviderConfigProfiles()
  const providerSummary = getProviderConfigSummary()
  const cards = getConfigCommandCenterCards()
  const neejeeSignals = getNeejeeTruthSignals()

  return (
    <div className="space-y-6 p-6">
      <header className="space-y-2">
        <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Recovery A1</div>
        <h1 className="text-2xl font-semibold">Config and legal identity command center</h1>
        <p className="max-w-3xl text-sm text-neutral-600">
          Central command surface for legal identity, support contact, provider profiles, masked secrets,
          canonical tenant truth and future sync/audit actions.
        </p>
      </header>

      <section className="grid gap-3 md:grid-cols-4">
        {cards.map((card) => (
          <div key={card.id} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-neutral-500">{card.label}</div>
            <div className="mt-2 text-lg font-semibold">{card.value}</div>
            <div className="mt-2 text-sm text-neutral-600">{card.summary}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Company legal profile</div>
          <dl className="mt-4 space-y-3 text-sm text-neutral-700">
            <div><dt className="font-medium">Legal name</dt><dd>{legal.legalName}</dd></div>
            <div><dt className="font-medium">CIN</dt><dd>{legal.cin}</dd></div>
            <div><dt className="font-medium">PAN</dt><dd>{legal.pan}</dd></div>
            <div><dt className="font-medium">TAN</dt><dd>{legal.tan}</dd></div>
            <div><dt className="font-medium">GSTIN</dt><dd>{legal.gstin}</dd></div>
            <div><dt className="font-medium">Address</dt><dd>{legal.principalPlaceOfBusiness}</dd></div>
            <div><dt className="font-medium">Footer identity</dt><dd>{profile.footerIdentityLine}</dd></div>
          </dl>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Support and contact foundation</div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {supportChannels.map((channel) => (
              <div key={channel.id} className="rounded-xl border border-neutral-200 p-3">
                <div className="font-medium">{channel.label}</div>
                <div className="mt-1 text-sm text-neutral-600">{channel.value}</div>
                <div className="mt-1 text-xs uppercase tracking-wide text-neutral-500">{channel.provider}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-neutral-50 p-4 text-sm text-neutral-700">
            {mailboxSummary.inboundCount} inbound · {mailboxSummary.outboundCount} outbound · primary {mailboxSummary.primarySupportEmail}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Provider config state</div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {providerProfiles.map((provider) => (
              <div key={provider.id} className="rounded-xl border border-neutral-200 p-3">
                <div className="font-medium">{provider.label}</div>
                <div className="mt-1 text-sm text-neutral-600">{provider.maskedValue}</div>
                <div className="mt-1 text-xs uppercase tracking-wide text-neutral-500">
                  {provider.status} · {provider.syncState}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-neutral-50 p-4 text-sm text-neutral-700">
            {providerSummary.connectedCount} connected · {providerSummary.seededCount} seeded · {providerSummary.maskedSecretsCount} masked secret-backed profiles
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Neejee canonical truth foundation</div>
          <ul className="mt-4 space-y-3">
            {neejeeSignals.map((signal) => (
              <li key={signal} className="rounded-xl border border-neutral-200 p-3 text-sm text-neutral-700">
                {signal}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}