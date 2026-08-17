import type { FaqItem } from '@/lib/seo/site'

type FaqSectionProps = {
  title: string
  items: FaqItem[]
}

export default function FaqSection({ title, items }: FaqSectionProps) {
  return (
    <section className='border-t border-black/10 bg-[#f4f1e9] px-6 py-24' aria-labelledby='faq-heading'>
      <div className='mx-auto grid w-full max-w-[1460px] gap-12 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20'>
        <div>
          <p className='text-[0.68rem] font-extrabold uppercase tracking-[0.19em] text-[#786d57]'>FAQ</p>
          <h2 id='faq-heading' className='mt-4 max-w-[12ch] text-4xl font-semibold leading-[0.98] tracking-[-0.05em] text-[#101417] md:text-5xl'>
            {title}
          </h2>
          <p className='mt-6 max-w-[42ch] text-sm leading-7 text-[#626b6f]'>
            Practical answers for teams evaluating the operating model, governance and rollout of Oye !magine.
          </p>
        </div>
        <div className='border-t border-black/10'>
          {items.map((item, index) => (
            <details key={item.question} className='group border-b border-black/10 py-1'>
              <summary className='grid cursor-pointer list-none grid-cols-[42px_1fr_auto] items-center gap-3 py-6 text-[#101417]'>
                <span className='text-[0.68rem] font-semibold text-[#949087]'>{String(index + 1).padStart(2, '0')}</span>
                <span className='text-base font-semibold tracking-[-0.02em] md:text-lg'>{item.question}</span>
                <span aria-hidden='true' className='text-xl font-light text-[#786d57] transition-transform group-open:rotate-45'>+</span>
              </summary>
              <p className='ml-[55px] max-w-[72ch] pb-7 pr-8 text-sm leading-7 text-[#626b6f]'>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
