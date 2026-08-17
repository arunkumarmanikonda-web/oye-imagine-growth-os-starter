import type { Route } from 'next'
import Link from 'next/link'
import type { CmsMarketingPage, MarketingSection } from '@/lib/public/cms-marketing'

function Action({ link, primary = false }: { link: { label: string; href: string }; primary?: boolean }) {
  return <Link href={link.href as Route} className={primary ? 'public-btn-primary' : 'public-btn-secondary'}>{link.label}<span aria-hidden="true">{primary ? '↗' : '→'}</span></Link>
}

function Section({ section, index }: { section: MarketingSection; index: number }) {
  const ink = section.tone === 'ink'
  if (section.type === 'cta') return (
    <section className="cms-section" key={index}>
      <div className="cms-cta"><div><p className="public-kicker">{section.eyebrow ?? 'Next step'}</p><h2>{section.title}</h2>{section.body ? <p>{section.body}</p> : null}</div><div className="public-actions">{section.primary ? <Action link={section.primary} primary /> : null}{section.secondary ? <Action link={section.secondary} /> : null}</div></div>
    </section>
  )
  if (section.type === 'split') return (
    <section className={`cms-section ${ink ? 'ink' : ''}`} key={index}>
      <div className="cms-split"><div><p className="public-kicker">{section.eyebrow ?? 'Operating model'}</p><h2>{section.title}</h2>{section.body ? <p>{section.body}</p> : null}{section.bullets?.length ? <ul className="cms-bullets">{section.bullets.map((item)=><li key={item}>{item}</li>)}</ul> : null}<div className="public-actions">{section.primary ? <Action link={section.primary} primary /> : null}</div></div><div>{section.asset ? <img src={section.asset.src} alt={section.asset.alt} style={{width:'100%',height:'100%',minHeight:320,objectFit:'cover'}} /> : <><p className="public-kicker">Operating principle</p><h2>One context. Explicit authority. Verifiable delivery.</h2><p>Oye !magine is designed so strategy, specialist work, connected execution and evidence can remain part of the same accountable operating record.</p></>}</div></div>
    </section>
  )

  const cards = section.cards ?? []
  return (
    <section className={`cms-section ${ink ? 'ink' : ''}`} key={index}>
      <div className="cms-section-head"><div><p className="public-kicker">{section.eyebrow ?? String(index + 1).padStart(2,'0')}</p></div><div>{section.title ? <h2>{section.title}</h2> : null}{section.body ? <p>{section.body}</p> : null}</div></div>
      {cards.length ? <div className="cms-card-grid">{cards.map((card,cardIndex)=><article className="cms-card" key={`${card.title}-${cardIndex}`}><small>{card.eyebrow ?? `${String(index+1).padStart(2,'0')}.${String(cardIndex+1).padStart(2,'0')}`}</small><h3>{card.title}</h3><p>{card.body}</p>{card.bullets?.length ? <ul>{card.bullets.map((bullet)=><li key={bullet}>{bullet}</li>)}</ul> : null}{card.href ? <Link href={card.href as Route}>{card.linkLabel ?? 'Explore'} →</Link> : null}</article>)}</div> : null}
      {section.bullets?.length ? <ul className="cms-bullets">{section.bullets.map((item)=><li key={item}>{item}</li>)}</ul> : null}
      {(section.primary || section.secondary) ? <div className="public-actions">{section.primary ? <Action link={section.primary} primary /> : null}{section.secondary ? <Action link={section.secondary} /> : null}</div> : null}
    </section>
  )
}

export function CmsMarketingPageView({ page }: { page: CmsMarketingPage }) {
  const { data } = page
  return (
    <main className="cms-institutional public-premium">
      <section className="cms-institutional-hero">
        <div className="cms-institutional-hero-inner">
          <div><p className="public-kicker">{data.eyebrow}</p><h1>{data.title}</h1><p className="cms-lead">{data.body}</p>{data.badges?.length ? <div className="cms-badges">{data.badges.map((badge)=><span key={badge}>{badge}</span>)}</div> : null}<div className="public-actions">{data.primary ? <Action link={data.primary} primary /> : null}{data.secondary ? <Action link={data.secondary} /> : null}</div></div>
          <aside className="cms-hero-aside"><p className="public-kicker">Oye !magine operating model</p><strong>Intelligence, execution and specialist delivery under one governance layer.</strong><p>The customer-facing site describes verified product capabilities and governed engagement models. Consequential actions remain subject to configured permissions and approvals.</p></aside>
        </div>
      </section>
      <div className="cms-sections">{data.sections.map((section,index)=><Section section={section} index={index} key={`${section.type}-${index}`} />)}</div>
    </main>
  )
}
