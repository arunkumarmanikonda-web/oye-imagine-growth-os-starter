const leaders = [
  {
    name: 'Arun Kumar Manikonda',
    role: 'Founder & Managing Director',
    image: '/leadership/arun-kumar-manikonda.jpg',
    linkedin: 'https://www.linkedin.com/in/arun-kumar-manikonda-74056748/',
    bio: 'Founder and enterprise operator with nearly two decades of leadership across hospitality, destination entertainment, real estate, strategic advisory and transaction-led businesses. Arun has led complex consumer-facing operations at executive and managing-director level, with direct responsibility across revenue, growth, commercial strategy, partnerships, governance and business transformation. At Oye !magine, he leads the company vision, institutional strategy and the development of an AI-native growth operating model built for accountable enterprise execution.',
  },
  {
    name: 'Nidhi Chauhan',
    role: 'Co-Founder',
    image: '/leadership/nidhi-chauhan.webp',
    linkedin: 'https://www.linkedin.com/in/nidhi-chauhan-2a5543168/',
    bio: 'Co-Founder and growth leader with deep experience across sales, marketing, consumer acquisition, partnerships and destination-led businesses. Nidhi has spent the last four years leading Sales & Marketing for Worlds of Wonder at Entertainment City Limited, combining revenue ownership with brand building, channel development, institutional sales and customer-growth strategy. At Oye !magine, she brings the market-facing discipline required to ensure the platform remains commercially relevant, customer-led and grounded in the realities of modern growth execution.',
  },
  {
    name: 'Pavan Kumar Manikonda',
    role: 'Director',
    image: '/leadership/pavan-kumar-manikonda.jpg',
    linkedin: 'https://in.linkedin.com/in/pavan-kumar-manikonda-49254421',
    bio: 'Director and operating leader with 18+ years of experience across hospitality, hotel operations, HORECA, vendor ecosystems, brand onboarding and service delivery. Pavan brings a strong execution lens to Oye !magine, with particular depth in process discipline, partner operations, commercial coordination and the practical systems required to translate strategy into repeatable delivery at scale.',
  },
  {
    name: 'Amit Jhingan',
    role: 'Director',
    image: '/leadership/amit-jhingan.png',
    linkedin: 'https://www.linkedin.com/in/amit-jhingan-11631451/',
    bio: 'Director and commercial leader with 15+ years of pan-India experience across real estate, retail leasing, commercial transactions, asset advisory and relationship-led business development. Amit contributes a strong institutional perspective on enterprise sales, commercial structuring, market development and high-value client engagement, strengthening Oye !magine’s ability to serve complex businesses and large operating mandates.',
  },
] as const

const operatingStrengths = [
  'Enterprise strategy',
  'Sales & marketing',
  'Consumer growth',
  'Hospitality & operations',
  'Commercial transactions',
  'Partnerships & market development',
  'AI growth & governance',
]

export function LeadershipSection() {
  return (
    <section className="border-y border-black/10 bg-[#e9e3d8] py-20 md:py-28" aria-labelledby="oye-leadership-heading">
      <div className="mx-auto w-[min(1460px,calc(100%-48px))] px-6 md:px-0">
        <div className="grid gap-10 border-b border-black/10 pb-12 lg:grid-cols-[0.68fr_1.32fr] lg:gap-20">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#786d57]">Founders & Directors</p>
          </div>
          <div>
            <h2 id="oye-leadership-heading" className="max-w-[16ch] text-4xl font-semibold leading-[0.98] tracking-[-0.055em] text-[#101417] md:text-6xl">
              Built by leaders who understand growth as an operating responsibility, not a marketing abstraction.
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-8 text-[#5c6569]">
              Oye !magine brings together leadership experience across enterprise strategy, sales and marketing, hospitality, destination entertainment, real estate, commercial transactions and operating delivery. The leadership group combines market-facing growth judgement with the institutional discipline required to build a governed AI platform for serious businesses.
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
            <h3 className="mt-4 max-w-[14ch] text-3xl font-semibold leading-[1.02] tracking-[-0.045em] text-[#101417] md:text-4xl">Technology informed by real operating experience.</h3>
          </div>
          <div>
            <p className="max-w-3xl text-sm leading-7 text-[#5f686c]">The leadership team has worked in businesses where growth is inseparable from revenue accountability, customer experience, operational execution, budgets, partnerships and governance. That operating perspective shapes Oye !magine’s product philosophy: AI should accelerate judgement and execution while preserving human authority, commercial control and traceable evidence.</p>
            <div className="mt-7 flex flex-wrap gap-2">
              {operatingStrengths.map((strength) => <span key={strength} className="rounded-full border border-black/15 bg-[#f8f5ee] px-4 py-2 text-[11px] font-bold text-[#404a4f]">{strength}</span>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
