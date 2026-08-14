import Link from 'next/link'
import { editions } from '@/lib/public/product-catalog'
import { buildMetadata } from '@/lib/seo/site'

export const metadata = buildMetadata('/pricing', 'Pricing & Editions', 'Explore the seven Oye !magine product editions without invented public pricing or unsupported capability claims.')

export default function PricingPage() {
  return (
    <div className="oi-page">
      <section className="oi-container">
        <header className="rounded-[2.25rem] border-2 border-black bg-[var(--oye-paper)] p-7 shadow-[8px_8px_0_#111] md:p-10">
          <p className="text-xs font-black uppercase tracking-[0.24em]">Pricing & editions</p>
          <h1 className="mt-4 max-w-5xl text-5xl font-black leading-[0.95] tracking-[-0.06em] text-black md:text-7xl">One operating system. Seven ways to deploy it.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#4d4841]">Choose the operating model that matches your growth team, commerce complexity and governance needs. Public rates are not invented here: commercial terms are confirmed against the selected scope, usage and managed-service requirements.</p>
        </header>

        <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {editions.map((edition, index) => (
            <article key={edition.name} className={`rounded-[2rem] border-2 border-black p-7 ${index % 3 === 0 ? 'bg-[var(--oye-yellow)]' : index % 3 === 1 ? 'bg-[var(--oye-pink)]' : 'bg-[var(--oye-paper)]'}`}>
              <p className="text-xs font-black uppercase tracking-[0.2em]">Edition {String(index + 1).padStart(2, '0')}</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.05em]">{edition.name}</h2>
              <p className="mt-4 min-h-20 text-sm leading-7 text-[#39352f]">{edition.forWhom}</p>
              <ul className="mt-5 grid gap-2">
                {edition.includes.map((item) => <li key={item} className="rounded-xl border border-black/25 bg-white/35 px-4 py-3 text-sm font-bold">{item}</li>)}
              </ul>
              <div className="mt-6 flex items-center justify-between gap-4 border-t border-black/20 pt-5">
                <span className="text-sm font-black">{edition.commercial}</span>
                <Link href="/contact" className="rounded-full border-2 border-black bg-black px-4 py-2 text-sm font-black text-white">Discuss scope</Link>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-[2rem] border-2 border-black bg-black p-7 text-white md:p-10">
          <h2 className="text-3xl font-black tracking-[-0.04em]">Commercial clarity before activation.</h2>
          <p className="mt-4 max-w-4xl leading-7 text-white/70">Media spend, AI usage, provider charges, managed-service scope, specialist delivery and enterprise requirements are separated rather than hidden inside a vague platform fee. Restricted capabilities remain unavailable until their identity, provider, financial or legal acceptance gates pass.</p>
        </section>
      </section>
    </div>
  )
}
