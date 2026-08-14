import type { CSSProperties } from 'react'
import Link from 'next/link'
import { getPublicHomepageExperience } from '../lib/recovery/public-premium-experience'

const storyItems = [
  ['Brand','Truth'],['Strategy','Plan'],['Creative','Studio'],['Campaigns','Live'],['Analytics','Learn'],['Finance','Control'],['Agents','Assist']
]

export default function HomePage() {
  const experience = getPublicHomepageExperience()
  return (
    <main className="premium-home">
      <section className="social-hero-shell">
        <div className="social-hero-copy">
          <p className="premium-eyebrow">The AI Growth Operating System</p>
          <h1>Everything your brand needs to grow.<br /><span>Finally in one living system.</span></h1>
          <p>{experience.hero.body}</p>
          <div className="premium-hero-actions"><Link href="/signup" className="premium-primary-cta">Start your workspace</Link><Link href="/platform" className="premium-secondary-cta">See how it works</Link></div>
          <div className="social-proof-line"><span className="proof-avatars"><i>AI</i><i>CM</i><i>DM</i><i>AN</i></span><p><strong>One workspace.</strong> Brand, creative, growth, data and approvals working from the same truth.</p></div>
        </div>

        <div className="product-stage" aria-label="Oye !magine product experience illustration">
          <div className="product-window">
            <header><span className="mini-logo"><img src="/brand/oye-imagine-logo.webp" alt="" /></span><div className="mini-search">⌕ Ask Oye anything about this brand</div><span className="mini-avatar">NC</span></header>
            <div className="product-body">
              <aside className="product-mini-rail"><span className="active">✦</span><span>◎</span><span>◐</span><span>↗</span><span>⌘</span><span>≋</span></aside>
              <section className="product-feed">
                <div className="product-greeting"><div><small>Good morning</small><h2>What should Neejee do next?</h2></div><button>＋ Create</button></div>
                <div className="product-stories">{storyItems.map(([a,b],i)=><div key={a}><span className={i%2?'pink':'yellow'}><i /></span><strong>{a}</strong><small>{b}</small></div>)}</div>
                <article className="product-post feature"><div className="post-head"><span className="post-avatar">✺</span><div><strong>Oye intelligence</strong><small>Grounded in approved brand truth</small></div><b>•••</b></div><h3>Your next growth move should connect storytelling, discovery and commerce.</h3><p>Build a creator-led craft discovery campaign, then route high-intent traffic into product collections while preserving provenance-led messaging.</p><div className="post-tags"><span>Strategy</span><span>Creative</span><span>Search</span><span>Commerce</span></div><div className="post-actions"><button>Review plan</button><button>Open evidence</button></div></article>
                <div className="product-two-col"><article className="product-mini-card yellow"><small>Creative queue</small><strong>12</strong><span>4 awaiting approval</span></article><article className="product-mini-card pink"><small>Growth signal</small><strong>+18%</strong><span>qualified product discovery</span></article></div>
              </section>
              <aside className="product-right-rail"><small>Today</small><h3>Growth pulse</h3><div className="pulse-ring"><strong>74</strong><span>health</span></div><div className="pulse-row"><span>Brand truth</span><b>Current</b></div><div className="pulse-row"><span>Approvals</span><b>4</b></div><div className="pulse-row"><span>Sources</span><b>Fresh</b></div><button>View full report</button></aside>
            </div>
          </div>
          <p className="product-proof-note">Illustrative product surface. External provider activity is shown as live only after provider-side verification.</p>
        </div>
      </section>

      <section className="home-story-strip"><div className="home-story-inner">{storyItems.map(([label,sub],index)=><Link href={index===2?'/platform':'/solutions'} key={label}><span className={`story-orb ${index%3===0?'yellow':index%3===1?'pink':'ink'}`}><i>{index===6?'✺':'✦'}</i></span><strong>{label}</strong><small>{sub}</small></Link>)}</div></section>

      <section className="premium-section-block home-system-section"><div className="premium-section-intro"><p className="premium-eyebrow">Not a stack. A loop.</p><h2>From understanding the brand to learning what worked, without dropping the context in between.</h2></div><div className="growth-loop-premium">{experience.growthLoop.map((step,index)=><div key={step}><span>{String(index+1).padStart(2,'0')}</span><strong>{step}</strong>{index<experience.growthLoop.length-1?<b>→</b>:null}</div>)}</div></section>

      <section className="home-capability-grid">{experience.sections.map((section,index)=><article key={section.id} className={index===0?'yellow':index===1?'pink':'paper'}><small>{section.eyebrow}</small><h3>{section.title}</h3><p>{section.body}</p><ul>{section.bullets.slice(0,4).map((bullet)=><li key={bullet}>{bullet}</li>)}</ul><Link href="/platform">Explore capability <span>→</span></Link></article>)}</section>

      <section className="home-persona-section"><div className="persona-copy"><p className="premium-eyebrow">One door. Different workspaces.</p><h2>Every role sees the part of growth they are responsible for.</h2><p>Super users, marketers, designers, approvers, analysts, partners and clients sign in through the same identity layer. Oye !magine resolves their permissions and routes them to the right workspace automatically.</p><Link href="/login" className="premium-secondary-cta">See the sign-in experience</Link></div><div className="persona-stack">{['Super User','Digital Marketer','Designer','Account Manager','Finance Approver','Partner','Client Admin','Viewer'].map((role,index)=><div key={role} style={{'--i':index} as CSSProperties}><span>{role.split(' ').map(x=>x[0]).join('').slice(0,2)}</span><strong>{role}</strong><small>{index<4?'Create & operate':'Review & govern'}</small></div>)}</div></section>

      <section className="premium-cta-panel home-final-cta"><div><p className="premium-eyebrow">Start with your own business</p><h2>Bring the website, catalogue, brand assets and goals. Build the operating context from there.</h2></div><div className="premium-hero-actions"><Link href="/signup" className="premium-primary-cta">Create customer workspace</Link><Link href="/contact" className="premium-secondary-cta">Book a conversation</Link></div></section>
    </main>
  )
}
