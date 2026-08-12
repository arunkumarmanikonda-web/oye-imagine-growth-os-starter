import Link from 'next/link'

const studies = [
  {
    title: 'Public shell hardening',
    body: 'UI batches improved responsiveness, accessibility, SEO metadata, and governed public presentation.'
  },
  {
    title: 'Conversion-path refinement',
    body: 'Qualification, strategy call, lead capture, and related public routes were standardized for stronger operational consistency.'
  },
  {
    title: 'SEO and trust uplift',
    body: 'Structured metadata, cross-linking, and sitemap coverage improved page depth and crawlability.'
  }
]

export default function CaseStudiesPage() {
  return (
    <main className='oi-section'>
      <div className='oi-container'>
        <div className='oi-card'>
          <p className='text-xs font-semibold uppercase tracking-[0.3em] text-slate-400'>Case studies</p>
          <h1 className='mt-3 text-4xl font-semibold text-white'>Delivery examples across platform, marketplace, and public growth flows</h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-300'>
            These case-study summaries highlight the kinds of public launch improvements teams typically review alongside the
            <Link href='/platform' className='ml-1 text-white underline underline-offset-4'>Platform</Link>,
            <Link href='/solutions' className='ml-1 text-white underline underline-offset-4'>Solutions</Link>,
            and <Link href='/trust' className='ml-1 text-white underline underline-offset-4'>Trust Center</Link>.
          </p>
        </div>

        <div className='mt-8 grid gap-4 md:grid-cols-3'>
          {studies.map((study) => (
            <div key={study.title} className='oi-card'>
              <h2 className='text-lg font-semibold text-white'>{study.title}</h2>
              <p className='mt-3 text-sm leading-7 text-slate-300'>{study.body}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}