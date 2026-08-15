import type { Route } from 'next'
import Link from 'next/link'
import type { CmsMarketingPage, MarketingSection } from '@/lib/public/cms-marketing'

function toneClass(tone: MarketingSection['tone']) {
  if (tone === 'yellow') return 'bg-[var(--oye-yellow)]'
  if (tone === 'pink') return 'bg-[var(--oye-pink)]'
  if (tone === 'ink') return 'bg-[#111] text-white'
  return 'bg-[var(--oye-paper)]'
}

function Button({ link, dark = false }: { link: { label: string; href: string }; dark?: boolean }) {
  return <Link href={link.href as Route} className={`inline-flex items-center gap-3 rounded-full border-2 border-black px-5 py-3 text-sm font-black transition hover:-translate-y-0.5 ${dark ? 'bg-white text-black' : 'bg-black text-white'}`}>{link.label}<span aria-hidden="true">→</span></Link>
}

export function CmsMarketingPageView({ page }: { page: CmsMarketingPage }) {
  const { data } = page
  return (
    <main className="oi-page">
      <section className="oi-container">
        <header className="relative overflow-hidden rounded-[2.75rem] border-2 border-black bg-[var(--oye-paper)] p-7 shadow-[10px_10px_0_#111] md:p-12">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-2 border-black bg-[var(--oye-yellow)]" aria-hidden="true" />
          <div className="absolute -bottom-20 right-20 h-44 w-44 rotate-12 rounded-[2.5rem] border-2 border-black bg-[var(--oye-pink)]" aria-hidden="true" />
          <div className="relative max-w-5xl">
            <p className="text-xs font-black uppercase tracking-[0.24em]">{data.eyebrow}</p>
            <h1 className="mt-4 max-w-5xl text-5xl font-black leading-[0.92] tracking-[-0.065em] md:text-7xl">{data.title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#4d4841]">{data.body}</p>
            {data.badges?.length ? <div className="mt-6 flex flex-wrap gap-2">{data.badges.map((badge) => <span key={badge} className="rounded-full border-2 border-black bg-white px-4 py-2 text-xs font-black">{badge}</span>)}</div> : null}
            {(data.primary || data.secondary) ? <div className="mt-7 flex flex-wrap gap-3">{data.primary ? <Button link={data.primary} /> : null}{data.secondary ? <Link href={data.secondary.href as Route} className="inline-flex items-center gap-3 rounded-full border-2 border-black bg-white px-5 py-3 text-sm font-black">{data.secondary.label}<span aria-hidden="true">↗</span></Link> : null}</div> : null}
          </div>
          {data.heroAsset ? <img src={data.heroAsset.src} alt={data.heroAsset.alt} className="relative mt-8 max-h-[420px] w-full rounded-[2rem] border-2 border-black object-cover md:mt-10" /> : null}
        </header>

        <div className="mt-12 grid gap-8">
          {data.sections.map((section, sectionIndex) => {
            const dark = section.tone === 'ink'
            if (section.type === 'cta') return (
              <section key={`${section.type}-${sectionIndex}`} className={`rounded-[2.5rem] border-2 border-black p-8 shadow-[7px_7px_0_#111] md:flex md:items-center md:justify-between md:gap-8 md:p-10 ${toneClass(section.tone ?? 'pink')}`}>
                <div className="max-w-4xl">{section.eyebrow ? <p className="text-xs font-black uppercase tracking-[0.22em]">{section.eyebrow}</p> : null}<h2 className="mt-3 text-4xl font-black tracking-[-0.05em] md:text-5xl">{section.title}</h2>{section.body ? <p className={`mt-4 text-base leading-8 ${dark ? 'text-white/65' : 'text-black/65'}`}>{section.body}</p> : null}</div>
                <div className="mt-6 flex shrink-0 flex-wrap gap-3 md:mt-0">{section.primary ? <Button link={section.primary} dark={dark} /> : null}{section.secondary ? <Link href={section.secondary.href as Route} className={`rounded-full border-2 px-5 py-3 text-sm font-black ${dark ? 'border-white/30 text-white' : 'border-black bg-white'}`}>{section.secondary.label}</Link> : null}</div>
              </section>
            )

            if (section.type === 'split') return (
              <section key={`${section.type}-${sectionIndex}`} className={`grid overflow-hidden rounded-[2.5rem] border-2 border-black lg:grid-cols-2 ${toneClass(section.tone ?? 'paper')}`}>
                <div className="p-8 md:p-10">{section.eyebrow ? <p className="text-xs font-black uppercase tracking-[0.22em]">{section.eyebrow}</p> : null}<h2 className="mt-3 text-4xl font-black tracking-[-0.05em]">{section.title}</h2>{section.body ? <p className={`mt-5 text-base leading-8 ${dark ? 'text-white/65' : 'text-black/65'}`}>{section.body}</p> : null}{section.bullets?.length ? <ul className="mt-6 grid gap-3">{section.bullets.map((item) => <li key={item} className={`rounded-2xl border p-4 text-sm font-bold ${dark ? 'border-white/15 bg-white/[0.04]' : 'border-black/15 bg-white/45'}`}>✓ {item}</li>)}</ul> : null}{section.primary ? <div className="mt-7"><Button link={section.primary} dark={dark} /></div> : null}</div>
                <div className={`min-h-[320px] border-t-2 border-black p-6 lg:border-l-2 lg:border-t-0 ${dark ? 'bg-white/[0.03]' : 'bg-white/45'}`}>{section.asset ? <img src={section.asset.src} alt={section.asset.alt} className="h-full min-h-[280px] w-full rounded-[1.75rem] border-2 border-black object-cover" /> : <div className="flex h-full min-h-[280px] items-center justify-center rounded-[1.75rem] border-2 border-dashed border-black/30 p-8 text-center"><span className="max-w-xs text-3xl font-black tracking-[-0.04em]">Oye turns fragmented work into one remembered operating loop.</span></div>}</div>
              </section>
            )

            const cards = section.cards ?? []
            return (
              <section key={`${section.type}-${sectionIndex}`} className={`rounded-[2.5rem] border-2 border-black p-7 md:p-10 ${toneClass(section.tone ?? 'paper')}`}>
                <div className="max-w-4xl">{section.eyebrow ? <p className="text-xs font-black uppercase tracking-[0.22em]">{section.eyebrow}</p> : null}{section.title ? <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] md:text-5xl">{section.title}</h2> : null}{section.body ? <p className={`mt-4 text-base leading-8 ${dark ? 'text-white/65' : 'text-black/65'}`}>{section.body}</p> : null}</div>
                {cards.length ? <div className={`mt-7 grid gap-4 ${cards.length >= 4 ? 'md:grid-cols-2 xl:grid-cols-4' : cards.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>{cards.map((card, cardIndex) => <article key={`${card.title}-${cardIndex}`} className={`rounded-[1.75rem] border-2 p-5 ${dark ? 'border-white/15 bg-white/[0.05]' : 'border-black bg-white/70'}`}>{card.eyebrow ? <p className="text-[11px] font-black uppercase tracking-[0.18em] opacity-60">{card.eyebrow}</p> : null}<h3 className="mt-2 text-2xl font-black tracking-[-0.04em]">{card.title}</h3><p className={`mt-3 text-sm leading-7 ${dark ? 'text-white/60' : 'text-black/60'}`}>{card.body}</p>{card.bullets?.length ? <ul className="mt-4 grid gap-2 text-xs font-bold">{card.bullets.map((bullet) => <li key={bullet}>• {bullet}</li>)}</ul> : null}{card.href ? <Link href={card.href as Route} className="mt-5 inline-flex text-sm font-black underline">{card.linkLabel ?? 'Explore'} →</Link> : null}</article>)}</div> : null}
                {section.bullets?.length ? <div className="mt-7 grid gap-3 md:grid-cols-2">{section.bullets.map((item, itemIndex) => <div key={item} className={`rounded-2xl border-2 p-4 text-sm font-bold ${dark ? 'border-white/15 bg-white/[0.04]' : 'border-black/15 bg-white/55'}`}><span className="mr-3 opacity-50">{String(itemIndex + 1).padStart(2, '0')}</span>{item}</div>)}</div> : null}
              </section>
            )
          })}
        </div>
      </section>
    </main>
  )
}
