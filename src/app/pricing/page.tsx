const pricingHighlights = [
  {
    title: 'Modular rollout',
    body: 'Start with one governed public flow, then expand into qualification, demo, marketplace, and partner-facing experiences.'
  },
  {
    title: 'Enterprise alignment',
    body: 'Pricing guidance reflects implementation complexity, governance needs, brand alignment, and rollout support.'
  },
  {
    title: 'Implementation support',
    body: 'Teams can include SEO setup, accessibility hardening, design-system alignment, and delivery planning in the launch scope.'
  }
]

export default function PricingPage() {
  return (
    <main className='oi-section'>
      <div className='oi-container'>
        <div className='oi-card'>
          <p className='text-xs font-semibold uppercase tracking-[0.3em] text-slate-400'>Pricing</p>
          <h1 className='mt-3 text-4xl font-semibold text-white'>
            Enterprise pricing guidance for governed public experiences
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-300'>
            OYE Imagine pricing is shaped by the public journeys you launch, the governance standards you need,
            and the level of implementation support required to move from starter surface to enterprise-ready rollout.
          </p>
        </div>

        <div className='mt-8 grid gap-4 md:grid-cols-3'>
          {pricingHighlights.map((item) => (
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