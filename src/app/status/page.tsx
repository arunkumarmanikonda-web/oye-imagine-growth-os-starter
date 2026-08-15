import Link from 'next/link'
import { buildMetadata } from '@/lib/seo/site'

export const metadata = buildMetadata(
  '/status',
  'Service Status | Oye !magine',
  'Service-status and incident communication information for Oye !magine public and authenticated product surfaces.'
)

const services = [
  ['Public website', 'Operational', 'Public marketing, pricing, contact and trust surfaces'],
  ['Authentication', 'Operational', 'Customer and operator sign-in through the configured identity service'],
  ['Growth OS application', 'Operational', 'Authenticated workspace and governed operating surfaces'],
  ['External providers', 'Tenant dependent', 'Availability depends on each tenant’s configured and verified provider connections'],
]

export default function StatusPage() {
  return (
    <main className="bg-white text-slate-950">
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:px-8 lg:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Service operations</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Oye !magine service status</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">
            This page communicates the operating posture of the core Oye !magine service. External advertising, analytics, messaging, payment and other providers remain subject to their own availability and to each tenant’s verified connection state.
          </p>
          <p className="mt-5 text-sm text-slate-500">Last reviewed: 15 August 2026</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14 sm:px-8 lg:px-10">
        <div className="overflow-hidden rounded-3xl border border-slate-200">
          {services.map(([name, state, description]) => (
            <div key={name} className="grid gap-3 border-b border-slate-200 p-6 last:border-b-0 md:grid-cols-[1fr_auto] md:items-center">
              <div><h2 className="text-lg font-semibold">{name}</h2><p className="mt-1 text-sm leading-6 text-slate-600">{description}</p></div>
              <span className="w-fit rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">{state}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-7">
          <h2 className="text-xl font-semibold">Incident communication</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">Material customer-impacting incidents should be communicated to affected customers through the applicable support and account channels. Security-sensitive matters may follow a restricted disclosure path while investigation is active.</p>
          <div className="mt-5 flex flex-wrap gap-3"><Link href="/trust" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium">Trust Center</Link><Link href="/contact" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white">Report an issue</Link></div>
        </div>
      </section>
    </main>
  )
}
