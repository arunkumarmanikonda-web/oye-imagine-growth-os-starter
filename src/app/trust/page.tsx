import Link from 'next/link'
import { trustControls } from '@/lib/public/product-catalog'
import { buildMetadata } from '@/lib/seo/site'

export const metadata = buildMetadata('/trust', 'Trust Center', 'Review the identity, tenant isolation, private storage, commercial containment and release-evidence controls behind Oye !magine.')

const assuranceRoadmap = [
  ['Security assurance', 'Internal hardening, schema contracts, CI evidence and external penetration testing are separate gates. No unearned certification is claimed.'],
  ['Privacy & DPDP', 'Consent, suppression, DSAR, retention and vendor/data-flow operations are developed as persistent workflows rather than policy copy alone.'],
  ['AI governance', 'Provider/model usage, tenant cost, approvals and tool autonomy are explicit. High-impact action classes default to human-controlled states.'],
  ['Reliability', 'Release manifests, runtime evidence, backups, restore tests and operational alerts form the production assurance path.'],
] as const

export default function TrustCenterPage() {
  return (
    <div className="oi-page">
      <section className="oi-container">
        <header className="rounded-[2.25rem] border-2 border-black bg-black p-7 text-white shadow-[8px_8px_0_#fdca5a] md:p-10">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--oye-yellow)]">Trust Center</p>
          <h1 className="mt-4 max-w-5xl text-5xl font-black leading-[0.95] tracking-[-0.06em] md:text-7xl">Trust is a runtime property, not a footer claim.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">This page describes controls we can evidence today and separates them from assurance work still requiring external review, provider activation or certification.</p>
        </header>

        <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {trustControls.map((control, index) => <article key={control.title} className={`rounded-[2rem] border-2 border-black p-7 ${index % 3 === 0 ? 'bg-[var(--oye-yellow)]' : index % 3 === 1 ? 'bg-[var(--oye-pink)]' : 'bg-[var(--oye-paper)]'}`}><p className="text-xs font-black uppercase tracking-[0.2em]">Control {String(index + 1).padStart(2, '0')}</p><h2 className="mt-3 text-2xl font-black tracking-[-0.04em]">{control.title}</h2><p className="mt-4 text-sm leading-7 text-[#39352f]">{control.body}</p></article>)}
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-2">
          {assuranceRoadmap.map(([title, body]) => <article key={title} className="rounded-[2rem] border-2 border-black bg-[var(--oye-paper)] p-7"><h2 className="text-2xl font-black tracking-[-0.04em]">{title}</h2><p className="mt-4 leading-7 text-[#4d4841]">{body}</p></article>)}
        </section>

        <section className="mt-10 rounded-[2rem] border-2 border-black bg-[var(--oye-yellow)] p-7 md:p-9">
          <h2 className="text-3xl font-black tracking-[-0.04em]">Need diligence evidence?</h2>
          <p className="mt-4 max-w-4xl leading-7 text-[#39352f]">Commercial buyers can request the applicable architecture, privacy, security and operating evidence during diligence. Certification or provider-status statements are disclosed only at the level actually achieved.</p>
          <div className="mt-5 flex flex-wrap gap-3"><Link href="/contact" className="rounded-full border-2 border-black bg-black px-5 py-3 font-black text-white">Contact the team</Link><Link href="/integrations" className="rounded-full border-2 border-black bg-white/40 px-5 py-3 font-black text-black">Integration evidence states</Link></div>
        </section>
      </section>
    </div>
  )
}
