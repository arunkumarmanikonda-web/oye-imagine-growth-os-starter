import Link from 'next/link'
import { integrationFamilies } from '@/lib/public/product-catalog'
import { buildMetadata } from '@/lib/seo/site'

export const metadata = buildMetadata('/integrations', 'Integrations', 'Understand how Oye !magine classifies integrations from implemented capability through production execution evidence.')

const states = ['Code capability', 'Configured', 'Connected', 'Read verified', 'Sandbox executed', 'Production executed'] as const

export default function IntegrationsPage() {
  return (
    <div className="oi-page"><section className="oi-container">
      <header className="rounded-[2.25rem] border-2 border-black bg-[var(--oye-paper)] p-7 shadow-[8px_8px_0_#111] md:p-10"><p className="text-xs font-black uppercase tracking-[0.24em]">Integrations</p><h1 className="mt-4 max-w-5xl text-5xl font-black leading-[0.95] tracking-[-0.06em] text-black md:text-7xl">Connected means connected. Not merely coded.</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-[#4d4841]">Oye !magine uses evidence states so a provider adapter, a configured credential and a production-executed campaign are never represented as the same thing.</p></header>

      <section className="mt-10 rounded-[2rem] border-2 border-black bg-black p-7 text-white"><p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--oye-yellow)]">Evidence ladder</p><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{states.map((state,index)=><div key={state} className="rounded-xl border border-white/15 bg-white/10 p-4"><span className={`inline-grid h-8 w-8 place-items-center rounded-full text-xs font-black text-black ${index%2?'bg-[var(--oye-pink)]':'bg-[var(--oye-yellow)]'}`}>{index+1}</span><p className="mt-3 font-black">{state}</p></div>)}</div></section>

      <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{integrationFamilies.map((item,index)=><article key={item.family} className={`rounded-[2rem] border-2 border-black p-7 ${index%3===0?'bg-[var(--oye-yellow)]':index%3===1?'bg-[var(--oye-pink)]':'bg-[var(--oye-paper)]'}`}><p className="text-xs font-black uppercase tracking-[0.2em]">{item.family}</p><h2 className="mt-3 text-2xl font-black tracking-[-0.04em]">{item.examples}</h2><p className="mt-4 text-sm leading-7 text-[#39352f]">{item.state}</p></article>)}</section>

      <section className="mt-10 rounded-[2rem] border-2 border-black bg-[var(--oye-paper)] p-7 md:p-9"><h2 className="text-3xl font-black tracking-[-0.04em]">Provider proof stays attached to the tenant.</h2><p className="mt-4 max-w-4xl leading-7 text-[#4d4841]">Account identity, external object IDs, readback, callbacks, persisted state and audit events form the proof chain. Provider availability can therefore differ by client without confusing platform capability with a client-specific connection.</p><Link href="/contact" className="mt-5 inline-flex rounded-full border-2 border-black bg-black px-5 py-3 font-black text-white">Discuss your stack</Link></section>
    </section></div>
  )
}
