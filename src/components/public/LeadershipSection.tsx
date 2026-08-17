const leaders = [
  {
    name: 'Arun Kumar Manikonda',
    role: 'Founder & Managing Director',
    context: 'Oye !magine · IndiaGully promoter-group leadership',
    image: '/leadership/arun-kumar-manikonda.jpg',
    linkedin: 'https://www.linkedin.com/in/arun-kumar-manikonda-74056748/',
    bio: 'Founder and enterprise operator with nearly two decades of leadership across hospitality, destination entertainment, real estate, strategic advisory and transaction-led businesses. Arun has carried executive and managing-director responsibility across revenue, growth, commercial strategy, partnerships, governance and business transformation. At Oye !magine, he leads the institutional vision and the development of an AI-native growth operating model built for accountable enterprise execution.',
  },
  {
    name: 'Nidhi Chauhan',
    role: 'Growth Leadership · Sales & Marketing',
    context: 'Oye !magine leadership',
    image: '/leadership/nidhi-chauhan.jpg',
    linkedin: 'https://www.linkedin.com/in/nidhi-chauhan-2a5543168/',
    bio: 'Sales and marketing leader with deep experience across revenue growth, consumer acquisition, partnerships and destination-led businesses. Nidhi has spent the last four years leading Sales & Marketing for Worlds of Wonder at Entertainment City Limited, combining revenue ownership with brand building, channel development, institutional sales and customer-growth strategy. At Oye !magine, she brings the market-facing discipline required to keep the operating system commercially relevant and grounded in real customer behaviour.',
  },
  {
    name: 'Pavan Kumar Manikonda',
    role: 'Executive Leadership · Operations',
    context: 'IndiaGully promoter-group leadership',
    image: '/leadership/pavan-kumar-manikonda.jpg',
    linkedin: 'https://in.linkedin.com/in/pavan-kumar-manikonda-49254421',
    bio: 'Operating leader with 18+ years of experience across hospitality, hotel operations, HORECA, vendor ecosystems, brand onboarding and service delivery. As Executive Director within the IndiaGully leadership bench, Pavan brings process discipline, partner operations and the practical systems required to translate strategy into repeatable delivery at scale.',
  },
  {
    name: 'Amit Jhingan',
    role: 'Commercial Leadership · Real Estate',
    context: 'IndiaGully promoter-group leadership',
    image: '/leadership/amit-jhingan.png',
    linkedin: 'https://www.linkedin.com/in/amit-jhingan-11631451/',
    bio: 'Commercial leader with 15+ years of pan-India experience across real estate, retail leasing, commercial transactions, hospitality asset advisory and relationship-led business development. As President, Real Estate within IndiaGully, Amit contributes institutional depth in enterprise sales, commercial structuring, market development and high-value client engagement.',
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
  return (
    <section className="leadership-section" aria-labelledby="oye-leadership-heading">
      <div className="leadership-wrap">
        <header className="leadership-intro">
          <div><p className="public-kicker">Leadership & promoter group</p></div>
          <div>
            <h2 id="oye-leadership-heading">Operating judgement behind the intelligence.</h2>
            <p>Oye !magine is being built around a senior operating bench with experience carrying revenue, customer, commercial and execution accountability in real businesses. The leadership model brings the established IndiaGully promoter-group bench together with dedicated sales and marketing leadership, creating continuity across enterprise strategy, commercial development, operations and customer growth.</p>
          </div>
        </header>

        <div className="directors-block">
          <header className="directors-head">
            <div><p className="public-kicker">Senior leadership bench</p></div>
            <h3>Market judgement, operating discipline and institutional accountability.</h3>
          </header>
          <div className="directors-grid">
            {leaders.map((leader, index) => (
              <article className="director-card" key={leader.name}>
                <div className="leader-image">
                  <img src={leader.image} alt={`${leader.name}, ${leader.role}`} loading={index < 2 ? 'eager' : 'lazy'} decoding="async" />
                </div>
                <div className="leader-copy">
                  <span className="leader-index">{String(index + 1).padStart(2, '0')} · Leadership</span>
                  <h4>{leader.name}</h4>
                  <p className="leader-role">{leader.role}</p>
                  <p className="leader-context">{leader.context}</p>
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
