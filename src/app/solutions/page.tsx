import Link from 'next/link'
import { getNeejeeCanonicalAudit } from '@/lib/recovery/neejee-canonical-truth-foundation'
import { getContentPublishingExperience } from '@/lib/recovery/content-governance-foundation'
import { getPublishingSystemAudit } from '@/lib/recovery/publishing-system-closure-foundation'

const proofStages = [
  'Onboarding and workspace truth',
  'Audit and intelligence readiness',
  'Strategy and operating plan generation',
  'Governed page system and route publication',
  'Client/operator visibility and launch readiness',
]

export default function SolutionsPage() {
  const neejee = getNeejeeCanonicalAudit()
  const publishing = getContentPublishingExperience()
  const audit = getPublishingSystemAudit()

  const unresolved = [
    ...audit.plans.public.unresolvedBlockers,
    ...audit.plans.client.unresolvedBlockers,
    ...audit.plans.operator.unresolvedBlockers,
  ]

  return (
    <main className='min-h-screen bg-slate-950 px-6 py-10 text-white md:px-10'>
      <section className='mx-auto flex w-full max-w-7xl flex-col gap-8'>
        <header className='grid gap-6 rounded-[2rem] border border-white/10 bg-white/5 p-8 lg:grid-cols-[1.15fr_0.85fr]'>
          <div>
            <p className='text-sm uppercase tracking-[0.35em] text-cyan-300'>Mega Batch C4 launch surface</p>
            <h1 className='mt-4 text-4xl font-semibold'>Neejee end-to-end readiness across governed platform surfaces</h1>
            <p className='mt-4 max-w-4xl text-base leading-8 text-slate-300'>
              This route ties canonical identity, governed publishing, and workspace evidence into one visible closure path for C4.
            </p>
            <div className='mt-6 flex flex-wrap gap-3'>
              <Link href='/platform' className='rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950'>Open platform surface</Link>
              <Link href='/admin/summary' className='rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white'>Open Neejee summary</Link>
              <Link href='/client' className='rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white'>Open client route</Link>
            </div>
          </div>

          <aside className='rounded-[1.5rem] border border-white/10 bg-black/20 p-6'>
            <p className='text-xs uppercase tracking-[0.3em] text-slate-400'>Canonical identity</p>
            <div className='mt-4 space-y-3 text-sm text-slate-300'>
              <div><strong className='text-white'>Brand:</strong> {neejee.publicIdentity.brandName}</div>
              <div><strong className='text-white'>Domain:</strong> {neejee.publicIdentity.domain}</div>
              <div><strong className='text-white'>Email:</strong> {neejee.publicIdentity.contactEmail}</div>
              <div><strong className='text-white'>Phone:</strong> {neejee.publicIdentity.contactPhone}</div>
              <div><strong className='text-white'>Identity valid:</strong> {neejee.validation.isValid ? 'yes' : 'no'}</div>
            </div>
          </aside>
        </header>

        <section className='grid gap-5 lg:grid-cols-2'>
          <article className='rounded-[1.5rem] border border-white/10 bg-white/5 p-6'>
            <p className='text-sm uppercase tracking-[0.35em] text-cyan-300'>Launch stages</p>
            <ol className='mt-5 space-y-3 text-sm text-slate-300'>
              {proofStages.map((stage, index) => (
                <li key={stage} className='rounded-xl border border-white/10 bg-black/20 px-4 py-3'>
                  <span className='mr-2 font-semibold text-cyan-300'>0{index + 1}.</span>{stage}
                </li>
              ))}
            </ol>
          </article>

          <article className='rounded-[1.5rem] border border-white/10 bg-white/5 p-6'>
            <p className='text-sm uppercase tracking-[0.35em] text-cyan-300'>Publishing readiness</p>
            <div className='mt-5 grid gap-4 sm:grid-cols-2'>
              {publishing.summaryCards.map((card) => (
                <div key={card.label} className='rounded-xl border border-white/10 bg-black/20 px-4 py-4'>
                  <p className='text-xs uppercase tracking-[0.25em] text-slate-400'>{card.label}</p>
                  <p className='mt-2 text-3xl font-semibold text-white'>{card.value}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className='grid gap-5 lg:grid-cols-[1fr_1fr]'>
          <article className='rounded-[1.5rem] border border-white/10 bg-white/5 p-6'>
            <p className='text-sm uppercase tracking-[0.35em] text-cyan-300'>Launch readiness ledger</p>
            <div className='mt-5 space-y-3 text-sm text-slate-300'>
              {unresolved.length ? (
                unresolved.map((item) => (
                  <div key={item} className='rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-amber-100'>{item}</div>
                ))
              ) : (
                <div className='rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-emerald-100'>No unresolved blockers in the current publishing audit.</div>
              )}
            </div>
          </article>

          <article className='rounded-[1.5rem] border border-white/10 bg-white/5 p-6'>
            <p className='text-sm uppercase tracking-[0.35em] text-cyan-300'>Neejee public launch footer</p>
            <div className='mt-5 rounded-xl border border-white/10 bg-black/20 px-4 py-4 text-sm leading-7 text-slate-300'>
              {neejee.publicIdentity.legalFooter}
            </div>
          </article>
        </section>
      </section>
    </main>
  )
}
