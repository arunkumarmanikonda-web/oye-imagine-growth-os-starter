const leaders = [
  {
    name: 'Arun Kumar Manikonda',
    role: 'Managing Director',
    image: 'https://indiagully.com/static/team/arun-manikonda.jpg',
    linkedin: 'https://www.linkedin.com/in/arun-kumar-manikonda-74056748/',
    bio: 'Founder-operator with two decades of experience across hospitality, real estate, entertainment and transaction-led businesses. Former Managing Director of Entertainment City Limited. Arun leads the enterprise vision and operating model behind Oye !magine.',
  },
  {
    name: 'Pavan Kumar Manikonda',
    role: 'Executive Director',
    image: 'https://indiagully.com/static/team/pavan-manikonda.jpg',
    linkedin: 'https://in.linkedin.com/in/pavan-kumar-manikonda-49254421',
    bio: 'Hospitality and operations leader with 18+ years across hotel management, HORECA supply, brand onboarding and operating delivery. Pavan brings execution discipline, service depth and partner operations to the group.',
  },
  {
    name: 'Amit Jhingan',
    role: 'President, Real Estate',
    image: 'https://indiagully.com/static/team/amit-jhingan.png',
    linkedin: 'https://www.linkedin.com/in/amit-jhingan-11631451/',
    bio: 'Commercial and real-estate leader with 15+ years of pan-India experience spanning retail leasing, commercial transactions and hospitality asset advisory. Amit strengthens the group’s asset, commercial and market-development perspective.',
  },
  {
    name: 'Nidhi Chauhan',
    role: 'Leadership, Sales & Marketing',
    image: '/leadership/nidhi-chauhan.webp',
    linkedin: 'https://www.linkedin.com/in/nidhi-chauhan-2a5543168/',
    bio: 'Seasoned sales and marketing professional across hospitality and destination entertainment. For the past four years, Nidhi has led Sales & Marketing for Worlds of Wonder at Entertainment City Limited, bringing hands-on revenue, partnerships, consumer acquisition and brand-growth leadership to Oye !magine.',
  },
] as const

const operatingStrengths = [
  'Hospitality & operations',
  'Real estate & transactions',
  'Destination entertainment',
  'Sales & marketing',
  'Consumer growth & partnerships',
  'AI growth & governance',
]

export function LeadershipSection() {
  return (
    <section className="border-y border-black/10 bg-[#e9e3d8] py-20 md:py-28" aria-labelledby="oye-leadership-heading">
      <div className="mx-auto w-[min(1460px,calc(100%-48px))] px-6 md:px-0">
        <div className="grid gap-10 border-b border-black/10 pb-12 lg:grid-cols-[0.68fr_1.32fr] lg:gap-20">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#786d57]">Promoter & leadership group</p>
          </div>
          <div>
            <h2 id="oye-leadership-heading" className="max-w-[16ch] text-4xl font-semibold leading-[0.98] tracking-[-0.055em] text-[#101417] md:text-6xl">
              Built by operators who have carried revenue, assets, destinations and customer growth.
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-8 text-[#5c6569]">
              Oye !magine is backed by the same promoter group and core leadership behind India Gully, expanded with dedicated Sales & Marketing leadership for the Growth OS. The operating experience spans hospitality, real estate, entertainment, commercial transactions, consumer acquisition and partnership-led growth.
            </p>
          </div>
        </div>

        <div className="grid items-stretch border-x border-b border-black/10 bg-[#f4f1e9] md:grid-cols-2 xl:grid-cols-4">
          {leaders.map((leader, index) => (
            <article key={leader.name} className="group flex min-h-full flex-col border-b border-black/10 last:border-b-0 md:[&:nth-child(odd)]:border-r md:[&:nth-child(-n+2)]:border-b xl:border-b-0 xl:border-r xl:last:border-r-0">
              <div className="aspect-[4/5] overflow-hidden bg-[#d9d2c4]">
                <img
                  src={leader.image}
                  alt={`${leader.name}, ${leader.role}`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-top grayscale-[8%] transition duration-500 group-hover:scale-[1.015] group-hover:grayscale-0"
                />
              </div>
              <div className="flex flex-1 flex-col p-6 md:p-7">
                <span className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#8a8273]">{String(index + 1).padStart(2, '0')} · Leadership</span>
                <h3 className="mt-5 text-2xl font-semibold tracking-[-0.035em] text-[#101417]">{leader.name}</h3>
                <p className="mt-1 text-sm font-bold text-[#7b1e3b]">{leader.role}</p>
                <p className="mt-5 text-[13px] leading-6 text-[#616b6f]">{leader.bio}</p>
                <a
                  href={leader.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-auto inline-flex items-center justify-between border-t border-black/10 pt-5 text-xs font-extrabold text-[#101417]"
                >
                  <span>LinkedIn profile</span><span aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#786d57]">Operating strength</p>
            <h3 className="mt-4 max-w-[14ch] text-3xl font-semibold leading-[1.02] tracking-[-0.045em] text-[#101417] md:text-4xl">Software is only one part of the proposition.</h3>
          </div>
          <div>
            <p className="max-w-3xl text-sm leading-7 text-[#5f686c]">The leadership group brings operating judgement from businesses where execution, revenue, customer experience and commercial accountability are inseparable. That experience informs how Oye !magine is designed, especially around approvals, evidence, budgets and real-world delivery.</p>
            <div className="mt-7 flex flex-wrap gap-2">
              {operatingStrengths.map((strength) => <span key={strength} className="rounded-full border border-black/15 bg-[#f8f5ee] px-4 py-2 text-[11px] font-bold text-[#404a4f]">{strength}</span>)}
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col justify-between gap-6 border-t border-black/10 pt-8 md:flex-row md:items-end">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#8a8273]">Promoter group reference</p>
            <a href="https://indiagully.com" target="_blank" rel="noreferrer" className="mt-2 inline-flex items-end gap-4 text-[#101417]">
              <strong className="text-3xl font-semibold tracking-[-0.05em]">INDIA GULLY</strong>
              <span className="pb-1 text-xs font-bold text-[#6a7275]">Visit group operating business ↗</span>
            </a>
          </div>
          <p className="max-w-xl text-xs leading-5 text-[#747b7e]">Oye Imagine Private Limited and India Gully operate through their respective legal entities. The reference above identifies the shared promoter and core leadership group, not a parent-subsidiary representation.</p>
        </div>
      </div>
    </section>
  )
}
