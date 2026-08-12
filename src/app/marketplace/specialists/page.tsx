import Link from 'next/link'

const specialistHighlights = [
  {
    title: 'Specialist discovery',
    body: 'Showcase curated specialists through a governed public listing experience with clear positioning and cleaner navigation depth.'
  },
  {
    title: 'Submission review',
    body: 'Support operator-reviewed specialist onboarding flows that align with marketplace governance and public trust expectations.'
  },
  {
    title: 'Cross-linked conversion',
    body: 'Connect specialist discovery to platform, solutions, pricing, and Trust Center pages to reduce isolation and improve crawl depth.'
  }
]

export default function MarketplaceSpecialistsPage() {
  return (
    <main className='oi-section'>
      <div className='oi-container'>
        <div className='oi-card'>
          <p className='text-xs font-semibold uppercase tracking-[0.3em] text-slate-400'>Marketplace category</p>
          <h1 className='mt-3 text-4xl font-semibold text-white'>Marketplace specialists</h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-300'>
            The specialists category helps teams present vetted specialist capabilities in a public marketplace surface while
            preserving governed navigation, stronger cross-linking, and trust-oriented browsing paths.
          </p>
          <p className='mt-4 text-sm leading-7 text-slate-300'>
            Continue into the <Link href='/marketplace' className='text-white underline underline-offset-4'>Marketplace</Link>,
            <Link href='/platform' className='ml-1 text-white underline underline-offset-4'>Platform</Link>,
            <Link href='/solutions' className='ml-1 text-white underline underline-offset-4'>Solutions</Link>,
            <Link href='/pricing' className='ml-1 text-white underline underline-offset-4'>Pricing</Link>,
            and <Link href='/trust' className='ml-1 text-white underline underline-offset-4'>Trust Center</Link>.
          </p>
        </div>

        <div className='mt-8 grid gap-4 md:grid-cols-3'>
          {specialistHighlights.map((item) => (
            <div key={item.title} className='oi-card'>
              <h2 className='text-lg font-semibold text-white'>{item.title}</h2>
              <p className='mt-3 text-sm leading-7 text-slate-300'>{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}