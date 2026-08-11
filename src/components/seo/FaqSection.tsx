import type { FaqItem } from '@/lib/seo/site'

type FaqSectionProps = {
  title: string
  items: FaqItem[]
}

export default function FaqSection({ title, items }: FaqSectionProps) {
  return (
    <section className='oi-section' aria-labelledby='faq-heading'>
      <div className='oi-container' style={{ maxWidth: 960 }}>
        <div className='oi-card'>
          <p className='text-xs font-semibold uppercase tracking-[0.3em] text-slate-400'>FAQ</p>
          <h2 id='faq-heading' className='mt-3 text-2xl font-semibold text-white'>{title}</h2>
          <div className='mt-6 space-y-3'>
            {items.map((item) => (
              <details key={item.question} className='rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-slate-200'>
                <summary className='cursor-pointer list-none font-semibold text-white'>{item.question}</summary>
                <p className='mt-3 text-sm leading-7 text-slate-300'>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}