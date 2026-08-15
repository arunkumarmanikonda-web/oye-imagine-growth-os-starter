import Link from 'next/link'

export type LegalPolicySection = {
  title: string
  paragraphs?: string[]
  bullets?: string[]
}

type LegalPolicyPageProps = {
  eyebrow: string
  title: string
  summary: string
  effectiveDate: string
  sections: LegalPolicySection[]
  notice?: string
}

export function LegalPolicyPage({ eyebrow, title, summary, effectiveDate, sections, notice }: LegalPolicyPageProps) {
  return (
    <main className="bg-white text-slate-950">
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:px-8 lg:px-10 lg:py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">{eyebrow}</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">{summary}</p>
          <p className="mt-6 text-sm text-slate-500">Effective and last reviewed: {effectiveDate}</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14 sm:px-8 lg:px-10">
        {notice ? (
          <div className="mb-10 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
            {notice}
          </div>
        ) : null}

        <div className="space-y-10">
          {sections.map((section) => (
            <article key={section.title} className="border-b border-slate-200 pb-10 last:border-b-0">
              <h2 className="text-2xl font-semibold tracking-tight">{section.title}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="mt-4 max-w-4xl text-base leading-8 text-slate-700">{paragraph}</p>
              ))}
              {section.bullets?.length ? (
                <ul className="mt-4 max-w-4xl space-y-3 text-base leading-8 text-slate-700">
                  {section.bullets.map((item) => (
                    <li key={item} className="flex gap-3"><span aria-hidden="true">•</span><span>{item}</span></li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>

        <aside className="mt-12 rounded-3xl border border-slate-200 bg-slate-50 p-7">
          <h2 className="text-xl font-semibold">Oye Imagine Private Limited</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">CIN U47190UP2025PTC220916 · GSTIN 09AAECO6856D1Z8</p>
          <p className="text-sm leading-7 text-slate-700">Suite No.11 A-116, Urbtech Trade Centre, Sector-132 Maharishi Nagar, Noida / Greater Noida, Gautambuddha Nagar, Uttar Pradesh 201304, India</p>
          <p className="mt-3 text-sm leading-7 text-slate-700">Privacy, legal and support requests: <a className="font-medium underline underline-offset-4" href="mailto:hello@oyeimagine.com">hello@oyeimagine.com</a></p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-medium">
            <Link className="underline underline-offset-4" href="/privacy">Privacy</Link>
            <Link className="underline underline-offset-4" href="/terms">Terms</Link>
            <Link className="underline underline-offset-4" href="/cookies">Cookies</Link>
            <Link className="underline underline-offset-4" href="/dpa">DPA</Link>
            <Link className="underline underline-offset-4" href="/subprocessors">Subprocessors</Link>
            <Link className="underline underline-offset-4" href="/trust">Trust Center</Link>
          </div>
        </aside>
      </section>
    </main>
  )
}
