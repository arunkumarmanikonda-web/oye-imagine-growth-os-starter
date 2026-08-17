import Link from 'next/link'

const marketplace = [
  ['01','Strategy & intelligence','Research, positioning, growth architecture, market entry and decision support.'],
  ['02','Creative & content','Brand systems, campaign creative, social, video, editorial and production.'],
  ['03','Performance','Search, paid media, conversion programmes and channel optimisation.'],
  ['04','Lifecycle','CRM, retention, journeys, automation and customer value expansion.'],
  ['05','Web & commerce','Landing systems, experience design, commerce optimisation and experimentation.'],
  ['06','Analytics & martech','Measurement, attribution, dashboards, integrations and operating infrastructure.'],
]

export default function HomePage() {
  return (
    <main className="public-premium">
      <section className="public-hero">
        <div className="public-wrap public-hero-grid">
          <div>
            <p className="public-kicker">AI Growth OS · Curated Marketplace · Managed Growth</p>
            <h1 className="public-display">The operating layer for <em>modern growth.</em></h1>
            <p className="public-lead">Oye !magine brings growth intelligence, governed AI execution and specialist delivery into one operating environment. Build the strategy, source the right capability, control approvals and read performance from a single institutional system.</p>
            <div className="public-actions"><Link href="/platform" className="public-btn-primary">Explore the platform <span>↗</span></Link><Link href="/marketplace" className="public-btn-secondary">Explore the marketplace</Link></div>
          </div>
          <aside className="public-hero-side">
            <span>One environment. Three operating layers.</span>
            <div className="public-index-list">
              <div className="public-index-row"><i>01</i><strong>Intelligence</strong><small>Research · strategy · decisions</small></div>
              <div className="public-index-row"><i>02</i><strong>Execution</strong><small>Create · approve · activate</small></div>
              <div className="public-index-row"><i>03</i><strong>Marketplace</strong><small>Scope · source · deliver</small></div>
              <div className="public-index-row"><i>04</i><strong>Evidence</strong><small>Measure · learn · govern</small></div>
            </div>
          </aside>
        </div>
      </section>

      <section className="public-section">
        <div className="public-wrap">
          <div className="public-section-head"><p className="public-kicker">The institution behind the interface</p><div><h2>Growth should operate with the same discipline as the rest of the enterprise.</h2><p>Oye !magine is designed for organisations that have outgrown disconnected agencies, isolated tools and ungoverned AI experiments. It creates one operating context for the brand, one decision trail for the team and one commercial framework for specialist delivery.</p></div></div>
          <div className="public-card-grid">
            <article className="public-card"><span className="public-card-number">01 / INTELLIGENCE</span><h3>Turn business context into an executable growth thesis.</h3><p>Bring brand truth, products, audiences, competitive context, goals and constraints into a structured intelligence layer that informs every downstream decision.</p><ul><li>Market and competitor intelligence</li><li>Brand and proposition architecture</li><li>Growth planning and scenario design</li><li>SEO, channel and content intelligence</li></ul></article>
            <article className="public-card"><span className="public-card-number">02 / OPERATIONS</span><h3>Move from recommendation to governed execution.</h3><p>Generate work, route human approvals, activate connected channels and maintain evidence of what was authorised, produced and published.</p><ul><li>AI-assisted content and creative workflows</li><li>Campaign and landing-page operations</li><li>Approval-bound publishing and spend</li><li>Audit trails and operating evidence</li></ul></article>
            <article className="public-card"><span className="public-card-number">03 / COMMERCIAL</span><h3>Source specialist capability without losing operating control.</h3><p>Use the marketplace for defined outcomes while the operating system preserves scope, approvals, delivery state, evidence and commercial boundaries.</p><ul><li>Curated capability briefs</li><li>Scoped delivery and service commitments</li><li>Managed-growth operating models</li><li>Enterprise governance and permissions</li></ul></article>
          </div>
        </div>
      </section>

      <section className="marketplace-band">
        <div className="marketplace-band-copy"><p className="public-kicker">Curated specialist marketplace</p><h2>Buy outcomes. Keep control.</h2><p>Engage the capability you need without fragmenting the operating model. Marketplace work begins with a defined brief and remains connected to approvals, delivery state, evidence and performance context.</p><Link href="/marketplace">View marketplace capabilities <span>↗</span></Link></div>
        <div className="marketplace-categories">{marketplace.map(([n,t,b])=><article className="marketplace-category" key={t}><span>{n}</span><h3>{t}</h3><p>{b}</p></article>)}</div>
      </section>

      <section className="public-section soft">
        <div className="public-wrap">
          <div className="public-section-head"><p className="public-kicker">How an engagement operates</p><div><h2>From business problem to accountable delivery.</h2><p>Self-directed teams can operate the platform directly. Organisations that need specialist capacity can add marketplace delivery or a managed-growth model without changing the underlying governance system.</p></div></div>
          <div className="public-flow">
            {[['01','Define','Business objective and operating constraints.'],['02','Diagnose','Evidence, market context and priority gaps.'],['03','Scope','Platform, specialist or managed-delivery model.'],['04','Approve','Human authority before consequential action.'],['05','Deliver','Execution, evidence and performance learning.']].map(([n,t,b])=><div className="public-flow-step" key={n}><span>{n}</span><strong>{t}</strong><p>{b}</p></div>)}
          </div>
        </div>
      </section>

      <section className="public-section dark">
        <div className="public-wrap">
          <div className="public-section-head"><p className="public-kicker">Enterprise control plane</p><div><h2>AI where it creates leverage. Human authority where consequence begins.</h2><p>Oye !magine is built around permissions, approval states, provider verification, commercial limits and audit evidence. Connected activity is represented as live only when the system can verify it.</p></div></div>
          <div className="public-proof"><div><span>Identity</span><strong>Role-scoped access</strong><p>Workspace and user permissions determine what each person can see and do.</p></div><div><span>Authority</span><strong>Approval-bound action</strong><p>High-impact publishing, spend and sensitive mutation remain governed.</p></div><div><span>Evidence</span><strong>Traceable operations</strong><p>Decisions, execution states and provider-side proof stay connected.</p></div><div><span>Commercial</span><strong>Explicit boundaries</strong><p>Platform fees, external spend and specialist services remain separately visible.</p></div></div>
          <div className="public-actions"><Link href="/trust" className="public-btn-secondary" style={{color:'#fff',borderColor:'rgba(255,255,255,.28)'}}>Review trust & governance</Link></div>
        </div>
      </section>

      <section className="public-final"><div className="public-wrap public-final-grid"><div><p className="public-kicker">Build the operating model around the ambition</p><h2>One platform when you want control. One marketplace when you need capacity. One managed model when you want both.</h2></div><div><p>Tell us the business objective, current stack and operating constraints. We will map the appropriate platform, marketplace or managed-growth structure without forcing an artificial package.</p><div className="public-actions"><Link href="/contact" className="public-btn-primary">Discuss a rollout <span>↗</span></Link><Link href="/pricing" className="public-btn-secondary">View commercial model</Link></div></div></div></section>
    </main>
  )
}
