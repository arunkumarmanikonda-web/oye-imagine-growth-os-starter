import Link from 'next/link'
import { getCmsControllerSummary } from '@/lib/foundation/cms-controller'
import { getContentPublishingExperience, getGovernedPagePaths } from '@/lib/recovery/content-governance-foundation'
import { getPublishingSystemAudit } from '@/lib/recovery/publishing-system-closure-foundation'

export default function PlatformPage() {
  const controller = getCmsControllerSummary()
  const publishing = getContentPublishingExperience()
  const audit = getPublishingSystemAudit()
  const governedPaths = getGovernedPagePaths()

  const surfaces = [
    { label: 'Public surface', summary: audit.plans.public.summary },
    { label: 'Client surface', summary: audit.plans.client.summary },
    { label: 'Operator surface', summary: audit.plans.operator.summary },
  ]

  return (
    <main className='min-h-screen bg-slate-950 px-6 py-10 text-white md:px-10'>
      <section className='mx-auto flex w-full max-w-7xl flex-col gap-8'>
        <header className='grid gap-6 rounded-[2rem] border border-white/10 bg-white/5 p-8 lg:grid-cols-[1.2fr_0.8fr]'>
          <div>
            <p className='text-sm uppercase tracking-[0.35em] text-cyan-300'>Mega Batch C4</p>
            <h1 className='mt-4 text-4xl font-semibold'>Platform operating system and governed publication control</h1>
            <p className='mt-4 max-w-4xl text-base leading-8 text-slate-300'>
              The platform route closes the public gap and exposes governed page operations, publication state, and runtime proof readiness.
            </p>
            <div className='mt-6 flex flex-wrap gap-3'>
              <Link href='/admin/content' className='rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950'>Open content governance</Link>
              <Link href='/admin/runtime' className='rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white'>Open runtime audit</Link>
              <Link href='/solutions' className='rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white'>Open Neejee proof surface</Link>
            </div>
          </div>
          <aside className='rounded-[1.5rem] border border-white/10 bg-black/20 p-6'>
            <p className='text-xs uppercase tracking-[0.3em] text-slate-400'>Governed asset summary</p>
            <div className='mt-5 grid gap-4 sm:grid-cols-2'>
              <div className='rounded-2xl border border-white/10 bg-white/5 p-4'><p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Pages</p><p className='mt-2 text-3xl font-semibold'>{controller.pageCount}</p></div>
              <div className='rounded-2xl border border-white/10 bg-white/5 p-4'><p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Sections</p><p className='mt-2 text-3xl font-semibold'>{controller.sectionCount}</p></div>
              <div className='rounded-2xl border border-white/10 bg-white/5 p-4'><p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Promotions</p><p className='mt-2 text-3xl font-semibold'>{controller.promotionCount}</p></div>
              <div className='rounded-2xl border border-white/10 bg-white/5 p-4'><p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Editable surfaces</p><p className='mt-2 text-3xl font-semibold'>{controller.editableSurfaceCount}</p></div>
            </div>
          </aside>
        </header>

        <section className='grid gap-5 lg:grid-cols-3'>
          {publishing.summaryCards.map((card) => (
            <article key={card.label} className='rounded-[1.5rem] border border-white/10 bg-white/5 p-6'>
              <p className='text-xs uppercase tracking-[0.3em] text-cyan-300'>{card.label}</p>
              <p className='mt-4 text-4xl font-semibold'>{card.value}</p>
            </article>
          ))}
        </section>

        <section className='grid gap-5 lg:grid-cols-3'>
          {surfaces.map((surface) => (
            <article key={surface.label} className='rounded-[1.5rem] border border-white/10 bg-white/5 p-6'>
              <p className='text-xs uppercase tracking-[0.3em] text-slate-400'>{surface.label}</p>
              <div className='mt-5 space-y-3 text-sm text-slate-300'>
                <div className='flex items-center justify-between gap-3'><span>Published</span><strong className='text-white'>{surface.summary.publishedCount}</strong></div>
                <div className='flex items-center justify-between gap-3'><span>Ready</span><strong className='text-white'>{surface.summary.readyCount}</strong></div>
                <div className='flex items-center justify-between gap-3'><span>Blocked</span><strong className='text-white'>{surface.summary.blockedCount}</strong></div>
              </div>
            </article>
          ))}
        </section>

        <section className='grid gap-6 lg:grid-cols-[0.9fr_1.1fr]'>
          <article className='rounded-[1.75rem] border border-white/10 bg-white/5 p-6'>
            <p className='text-sm uppercase tracking-[0.35em] text-cyan-300'>Publishing workflow</p>
            <ol className='mt-5 space-y-3 text-sm text-slate-300'>
              {publishing.workflowStages.map((stage, index) => (
                <li key={stage} className='rounded-xl border border-white/10 bg-black/20 px-4 py-3'>
                  <span className='mr-2 font-semibold text-cyan-300'>0{index + 1}.</span>{stage}
                </li>
              ))}
            </ol>
          </article>

          <article className='rounded-[1.75rem] border border-white/10 bg-white/5 p-6'>
            <p className='text-sm uppercase tracking-[0.35em] text-cyan-300'>Governed page paths</p>
            <div className='mt-5 grid gap-3 md:grid-cols-2'>
              {governedPaths.map((item) => (
                <div key={item.slug} className='rounded-xl border border-white/10 bg-black/20 px-4 py-3'>
                  <p className='text-xs uppercase tracking-[0.25em] text-slate-400'>{item.slug}</p>
                  <p className='mt-2 text-sm text-white'>{item.path}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </section>
    </main>
  )
}
