import type { ReactNode } from 'react'

export type PolicySection = {
  title: string
  body?: ReactNode
  bullets?: string[]
}

export function PolicyPage({
  eyebrow,
  title,
  summary,
  lastUpdated,
  sections,
}: {
  eyebrow: string
  title: string
  summary: string
  lastUpdated: string
  sections: PolicySection[]
}) {
  return (
    <main className="policy-page">
      <section className="policy-hero">
        <div className="policy-hero-inner">
          <p className="public-kicker">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="policy-summary">{summary}</p>
          <p className="policy-date">Last updated: {lastUpdated}</p>
        </div>
      </section>

      <section className="policy-content">
        {sections.map((section) => (
          <article key={section.title} className="policy-section">
            <h2>{section.title}</h2>
            <div>
              {section.body ? <div className="policy-body">{section.body}</div> : null}
              {section.bullets ? <ul>{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul> : null}
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
