import Link from 'next/link'
import { growthLoop, platformModules } from '@/lib/public/product-catalog'
import { buildMetadata } from '@/lib/seo/site'

export const metadata = buildMetadata('/platform', 'Platform', 'Explore the Oye !magine AI Growth OS across brand intelligence, creative, paid media, SEO, analytics, commercial controls and governed AI.')

export default function PlatformPage() {
  return (
    <div className="oi-page">
      <section className="oi-container">
        <header className="grid gap-6 rounded-[2.25rem] border-2 border-black bg-[var(--oye-paper)] p-7 shadow-[8px_8px_0_#111] md:p-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em]">The platform</p>
            <h1 className="mt-4 text-5xl font-black leading-[0.94] tracking-[-0.06em] text-black md:text-7xl">Growth is not one campaign. It is an operating loop.</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#4d4841]">Oye !magine connects the context, generation, approvals, channel operations, performance evidence and commercial controls that normally live in disconnected tools.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/contact" className="oi-btn oi-btn-primary">Book a walkthrough</Link>
              <Link href="/integrations" className="oi-btn oi-btn-secondary">Integration architecture</Link>
            </div>
          </div>
          <aside className="rounded-[2rem] border-2 border-black bg-black p-6 text-white">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--oye-yellow)]">The governed loop</p>
            <ol className="mt-5 grid gap-3">
              {growthLoop.map((step, index) => <li key={step} className="flex items-center gap-4 rounded-xl border border-white/15 bg-white/10 p-4"><span className={`grid h-9 w-9 place-items-center rounded-full font-black text-black ${index % 2 ? 'bg-[var(--oye-pink)]' : 'bg-[var(--oye-yellow)]'}`}>{index + 1}</span><span className="font-black">{step}</span></li>)}
            </ol>
          </aside>
        </header>

        <section className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {platformModules.map((module, index) => <article key={module.name} className={`rounded-[2rem] border-2 border-black p-7 ${index % 5 === 0 ? 'bg-[var(--oye-yellow)]' : index % 5 === 1 ? 'bg-[var(--oye-pink)]' : 'bg-[var(--oye-paper)]'}`}><p className="text-xs font-black uppercase tracking-[0.18em]">Module {String(index + 1).padStart(2, '0')}</p><h2 className="mt-3 text-2xl font-black tracking-[-0.04em]">{module.name}</h2><p className="mt-4 text-sm leading-7 text-[#39352f]">{module.body}</p></article>)}
        </section>

        <section className="mt-12 rounded-[2.25rem] border-2 border-black bg-[var(--oye-yellow)] p-7 md:p-10">
          <p className="text-xs font-black uppercase tracking-[0.22em]">Controlled autonomy</p>
          <h2 className="mt-3 max-w-4xl text-4xl font-black tracking-[-0.055em]">AI can move faster without becoming invisible or unaccountable.</h2>
          <p className="mt-5 max-w-4xl leading-8 text-[#39352f]">High-impact actions stay behind identity, tenant, permission, approval, budget and provider-readiness checks. The system distinguishes draft capability from configured, connected, verified and production-executed capability.</p>
        </section>
      </section>
    </div>
  )
}
