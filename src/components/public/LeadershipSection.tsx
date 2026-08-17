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

function LeaderLink({ href }: { href: string }) {
  return (
    <a className="leader-link" href={href} target="_blank" rel="noreferrer">
      <span>LinkedIn profile</span><span aria-hidden="true">↗</span>
    </a>
  )
}

export function LeadershipSection() {
  const founders = leaders.slice(0, 2)
  const directors = leaders.slice(2)

  return (
    <section className="leadership-section" aria-labelledby="oye-leadership-heading">
      <div className="leadership-wrap">
        <header className="leadership-intro">
          <div><p className="public-kicker">Founders & Directors</p></div>
          <div>
            <h2 id="oye-leadership-heading">Operating judgement behind the intelligence.</h2>
            <p>Oye !magine is being built by leaders who have carried revenue, customer, operating and commercial accountability in real businesses. The leadership model deliberately combines market-facing growth judgement with execution discipline, enterprise governance and long-horizon institution building.</p>
          </div>
        </header>

        <div className="founder-pair" aria-label="Founders">
          {founders.map((leader, index) => (
            <article className={`leader-feature ${index === 1 ? 'is-reverse' : ''}`} key={leader.name}>
              <div className="leader-image">
                <img src={leader.image} alt={`${leader.name}, ${leader.role}`} loading={index === 0 ? 'eager' : 'lazy'} decoding="async" />
              </div>
              <div className="leader-copy">
                <span className="leader-index">{String(index + 1).padStart(2, '0')} · Founder</span>
                <h3>{leader.name}</h3>
                <p className="leader-role">{leader.role}</p>
                <p className="leader-bio">{leader.bio}</p>
                <LeaderLink href={leader.linkedin} />
              </div>
            </article>
          ))}
        </div>

        <div className="directors-block">
          <header className="directors-head">
            <div><p className="public-kicker">Board leadership</p></div>
            <h3>Execution depth across operations and commercial growth.</h3>
          </header>
          <div className="directors-grid">
            {directors.map((leader, index) => (
              <article className="director-card" key={leader.name}>
                <div className="leader-image">
                  <img src={leader.image} alt={`${leader.name}, ${leader.role}`} loading="lazy" decoding="async" />
                </div>
                <div className="leader-copy">
                  <span className="leader-index">{String(index + 3).padStart(2, '0')} · Director</span>
                  <h4>{leader.name}</h4>
                  <p className="leader-role">{leader.role}</p>
                  <p className="leader-bio">{leader.bio}</p>
                  <LeaderLink href={leader.linkedin} />
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="leadership-strength">
          <div>
            <p className="public-kicker">Operating strength</p>
            <h3>Built from commercial and operating reality.</h3>
          </div>
          <div className="strength-list" aria-label="Leadership operating strengths">
            {operatingStrengths.map((strength) => <span key={strength}>{strength}</span>)}
          </div>
        </div>
      </div>
    </section>
  )
}
