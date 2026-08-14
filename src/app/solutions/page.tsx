import Link from 'next/link'
import { solutionGroups } from '@/lib/public/product-catalog'
import { buildMetadata } from '@/lib/seo/site'

export const metadata = buildMetadata('/solutions', 'Solutions', 'See how Oye !magine applies its governed Growth OS to commerce, SMEs, enterprise teams, agencies, managed growth and white-label deployments.')

export default function SolutionsPage() {
  return (
    <div className="oi-page">
      <section className="oi-container">
        <header className="rounded-[2.25rem] border-2 border-black bg-[var(--oye-paper)] p-7 shadow-[8px_8px_0_#111] md:p-10">
          <p className="text-xs font-black uppercase tracking-[0.24em]">Solutions</p>
          <h1 className="mt-4 max-w-5xl text-5xl font-black leading-[0.95] tracking-[-0.06em] text-black md:text-7xl">Same operating system. Different growth realities.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#4d4841]">Oye !magine adapts its tenant, workflow, approval, reporting and commercial layers to the operating model around the brand rather than selling a separate disconnected product for every use case.</p>
        </header>

        <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {solutionGroups.map((solution, index) => (
            <article key={solution.title} className={`rounded-[2rem] border-2 border-black p-7 ${index % 3 === 0 ? 'bg-[var(--oye-yellow)]' : index % 3 === 1 ? 'bg-[var(--oye-pink)]' : 'bg-[var(--oye-paper)]'}`}>
              <p className="text-xs font-black uppercase tracking-[0.2em]">Solution {String(index + 1).padStart(2, '0')}</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.05em]">{solution.title}</h2>
              <p className="mt-4 min-h-28 text-sm leading-7 text-[#39352f]">{solution.body}</p>
              <Link href={solution.href} className="mt-5 inline-flex rounded-full border-2 border-black bg-black px-4 py-2 text-sm font-black text-white">Explore</Link>
            </article>
          ))}
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-2">
          <article className="rounded-[2rem] border-2 border-black bg-black p-7 text-white md:p-9">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--oye-yellow)]">SaaS + managed execution</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">Use the system yourself, operate it with us, or combine both.</h2>
            <p className="mt-4 leading-7 text-white/70">Feature entitlements, operator roles, marketplace specialists and managed delivery are designed around the same tenant and audit trail so responsibility does not disappear when the service model changes.</p>
          </article>
          <article className="rounded-[2rem] border-2 border-black bg-[var(--oye-paper)] p-7 md:p-9">
            <p className="text-xs font-black uppercase tracking-[0.22em]">Evidence before automation</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">Channels become active only after identity, provider and commercial gates pass.</h2>
            <p className="mt-4 leading-7 text-[#4d4841]">The product can carry a capability from draft architecture through configured, connected, verified and production-executed states without presenting an unverified dependency as live.</p>
          </article>
        </section>
      </section>
    </div>
  )
}
