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
    <div className="bg-white text-slate-950">
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:px-8 lg:px-10 lg:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">{eyebrow}</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">{summary}</p>
          <p className="mt-5 text-sm text-slate-500">Last updated: {lastUpdated}</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-6 px-6 py-14 sm:px-8 lg:px-10">
        {sections.map((section) => (
          <article key={section.title} className="rounded-3xl border border-slate-200 p-7 sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight">{section.title}</h2>
            {section.body ? <div className="mt-4 text-base leading-8 text-slate-700">{section.body}</div> : null}
            {section.bullets ? (
              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
                {section.bullets.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-slate-900" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </section>
    </div>
  )
}
