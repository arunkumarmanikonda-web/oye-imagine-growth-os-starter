import { ProviderVaultConsole } from '@/components/admin/ProviderVaultConsole';
import { PricingCatalogConsole } from '@/components/admin/PricingCatalogConsole';
import { getOperatorControlPlaneExperience } from '@/lib/recovery/operator-control-plane-foundation';

export default function AdminConfigPage() {
  const experience = getOperatorControlPlaneExperience();

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white md:px-10">
      <section className="mx-auto max-w-7xl">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Super Admin · Platform control</p>
        <h1 className="mt-4 max-w-5xl text-4xl font-semibold tracking-tight md:text-5xl">
          Configure Oye once. Let the platform wire the operating stack.
        </h1>
        <p className="mt-5 max-w-4xl text-base leading-8 text-slate-300">
          Provider credentials, capability routing, public pricing, integration requests and production readiness belong here. Client experiences remain provider-neutral and continue to present Oye !magine as the operating layer.
        </p>

        <div className="mt-10">
          <ProviderVaultConsole />
        </div>

        <PricingCatalogConsole />

        <section className="mt-10 grid gap-5 md:grid-cols-2">
          {experience.configOperations.map((card) => (
            <article key={card.title} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7">
              <h2 className="text-xl font-semibold">{card.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{card.summary}</p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-400">
                {card.checkpoints.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-[2rem] border border-white/10 bg-black/20 p-7">
          <h2 className="text-xl font-semibold">Platform bootstrap boundary</h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">
            Application-provider credentials can be managed from this vault. The minimum infrastructure bootstrap secrets that allow Oye to reach its database and decrypt this vault must remain outside the vault itself. This prevents the platform from holding the key that protects its own master key.
          </p>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-400">
            {experience.cleanupChecklist.map((item) => (
              <li key={item.label}>
                {item.label}: <span className="font-semibold text-cyan-300">{item.result}</span>
              </li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
}
