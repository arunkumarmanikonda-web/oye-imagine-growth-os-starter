import Link from 'next/link'
import { buildMetadata } from '@/lib/seo/site'

export const metadata = buildMetadata('/customers', 'Customers', 'See how Oye !magine uses controlled customer pilots and evidence-led operating loops rather than fabricated case-study results.')

export default function CustomersPage() {
  return <div className="oi-page"><section className="oi-container">
    <header className="rounded-[2.25rem] border-2 border-black bg-[var(--oye-yellow)] p-7 shadow-[8px_8px_0_#111] md:p-10"><p className="text-xs font-black uppercase tracking-[0.24em]">Customers & proof</p><h1 className="mt-4 max-w-5xl text-5xl font-black leading-[0.95] tracking-[-0.06em] md:text-7xl">Proof starts with the operating chain, not a vanity logo wall.</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-[#39352f]">Customer stories are published only at the level we can substantiate: starting truth, implemented workflow, verified execution and measurable outcomes.</p></header>
    <article className="mt-10 grid gap-6 rounded-[2rem] border-2 border-black bg-[var(--oye-paper)] p-7 md:p-9 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em]">Reference pilot</p><h2 className="mt-3 text-4xl font-black tracking-[-0.05em]">Neejee</h2><p className="mt-4 max-w-3xl leading-7 text-[#4d4841]">A founder-curated craft discovery and commerce business used to validate brand truth, creative operations, governed campaign execution, analytics and commercial reconciliation as one loop.</p></div><Link href="/customers/neejee" className="rounded-full border-2 border-black bg-black px-5 py-3 font-black text-white">See the pilot architecture</Link></article>
    <section className="mt-10 rounded-[2rem] border-2 border-black bg-black p-7 text-white"><h2 className="text-3xl font-black tracking-[-0.04em]">No fabricated performance claims.</h2><p className="mt-4 max-w-4xl leading-7 text-white/70">Where a provider, revenue source or measured outcome is not yet externally verified, the case study says so. Architecture, configured workflows and provider-executed results remain distinct evidence states.</p></section>
  </section></div>
}
