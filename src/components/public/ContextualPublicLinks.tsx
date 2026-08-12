'use client'

import Link from 'next/link'
import type { Route } from 'next'
import { usePathname } from 'next/navigation'

type RelatedLink = {
  href: string
  title: string
  description: string
}

type RelatedConfig = {
  intro: string
  links: RelatedLink[]
}

const relatedMap: Record<string, RelatedConfig> = {
  '/': {
    intro: 'Explore the platform, browse solutions, review marketplace surfaces, or visit the Trust Center for governance details.',
    links: [
      { href: '/platform', title: 'Platform', description: 'See the operating model and public system foundations.' },
      { href: '/solutions', title: 'Solutions', description: 'Review solution patterns for governed launch surfaces.' },
      { href: '/marketplace', title: 'Marketplace', description: 'Explore public discovery and catalog presentation flows.' },
      { href: '/trust', title: 'Trust Center', description: 'Review governance, support, and operational trust signals.' }
    ]
  },
  '/platform': {
    intro: 'Teams comparing the platform usually review solutions, marketplace operations, pricing, and the Trust Center together.',
    links: [
      { href: '/solutions', title: 'Solutions', description: 'Compare packaged public journey patterns.' },
      { href: '/marketplace', title: 'Marketplace', description: 'See marketplace discovery and submission surfaces.' },
      { href: '/pricing', title: 'Pricing', description: 'Review rollout and implementation guidance.' },
      { href: '/trust', title: 'Trust Center', description: 'Validate governance and support commitments.' }
    ]
  },
  '/solutions': {
    intro: 'Solution buyers usually compare platform capabilities, marketplace patterns, case studies, and trust documentation.',
    links: [
      { href: '/platform', title: 'Platform', description: 'Review the foundation behind the solutions layer.' },
      { href: '/marketplace', title: 'Marketplace', description: 'See a major surface where solutions are applied.' },
      { href: '/case-studies', title: 'Case studies', description: 'Read implementation-oriented results and examples.' },
      { href: '/trust', title: 'Trust Center', description: 'Review governance, delivery, and support signals.' }
    ]
  },
  '/marketplace': {
    intro: 'Marketplace planning often connects to platform governance, solution framing, pricing, and trust review.',
    links: [
      { href: '/platform', title: 'Platform', description: 'Understand the shared foundation behind marketplace operations.' },
      { href: '/solutions', title: 'Solutions', description: 'Compare marketplace-adjacent launch patterns.' },
      { href: '/pricing', title: 'Pricing', description: 'Review rollout and implementation guidance.' },
      { href: '/trust', title: 'Trust Center', description: 'Validate governance and public trust coverage.' }
    ]
  },
  '/pricing': {
    intro: 'Pricing decisions usually depend on platform scope, marketplace complexity, guided consultation needs, and trust requirements.',
    links: [
      { href: '/platform', title: 'Platform', description: 'Map pricing to platform scope and governance.' },
      { href: '/marketplace', title: 'Marketplace', description: 'See a high-complexity public surface that affects rollout size.' },
      { href: '/demo', title: 'Book a demo', description: 'Review the guided experience live with the team.' },
      { href: '/trust', title: 'Trust Center', description: 'Confirm operational and governance expectations.' }
    ]
  },
  '/trust': {
    intro: 'Trust review is strongest when paired with platform scope, solution coverage, marketplace needs, and pricing context.',
    links: [
      { href: '/platform', title: 'Platform', description: 'See the operating foundation behind the public shell.' },
      { href: '/solutions', title: 'Solutions', description: 'Review the governed patterns teams deploy.' },
      { href: '/marketplace', title: 'Marketplace', description: 'Understand discovery and submission governance needs.' },
      { href: '/pricing', title: 'Pricing', description: 'Review rollout and support planning.' }
    ]
  },
  '/case-studies': {
    intro: 'Case studies are most useful when read alongside platform capabilities, solution mapping, marketplace needs, and trust guidance.',
    links: [
      { href: '/platform', title: 'Platform', description: 'Connect delivery examples back to the platform foundation.' },
      { href: '/solutions', title: 'Solutions', description: 'Map case-study outcomes to solution patterns.' },
      { href: '/marketplace', title: 'Marketplace', description: 'Review a common public launch surface.' },
      { href: '/trust', title: 'Trust Center', description: 'Validate governance and support commitments.' }
    ]
  },
  '/contact': {
    intro: 'Before reaching out, many teams compare platform scope, pricing, consultation availability, and trust signals.',
    links: [
      { href: '/platform', title: 'Platform', description: 'Review the public system foundation.' },
      { href: '/pricing', title: 'Pricing', description: 'Understand rollout and implementation guidance.' },
      { href: '/demo', title: 'Book a demo', description: 'Schedule a guided walkthrough.' },
      { href: '/trust', title: 'Trust Center', description: 'Review governance and support identity.' }
    ]
  },
  '/demo': {
    intro: 'Strategy call evaluation often continues into pricing, qualification logic, platform scope, and trust review.',
    links: [
      { href: '/pricing', title: 'Pricing', description: 'Review delivery scope and rollout guidance.' },
      { href: '/qualification', title: 'Qualification flows', description: 'See how guided intake works alongside demos.' },
      { href: '/platform', title: 'Platform', description: 'Understand the shared system behind the strategy call journey.' },
      { href: '/trust', title: 'Trust Center', description: 'Validate governance and support posture.' }
    ]
  },
  '/qualification': {
    intro: 'Qualification planning is usually reviewed together with demos, lead capture, platform operations, and trust requirements.',
    links: [
      { href: '/demo', title: 'Book a demo', description: 'See qualification in the broader guided journey.' },
      { href: '/lead-capture', title: 'Lead capture', description: 'Compare intake flows and conversion patterns.' },
      { href: '/platform', title: 'Platform', description: 'Review the system layer behind qualification logic.' },
      { href: '/trust', title: 'Trust Center', description: 'Review governance and public trust signals.' }
    ]
  },
  '/lead-capture': {
    intro: 'Lead capture decisions usually connect to qualification, demos, pricing, and Trust Center review.',
    links: [
      { href: '/qualification', title: 'Qualification flows', description: 'See how higher-intent paths are structured.' },
      { href: '/demo', title: 'Book a demo', description: 'Review a related high-intent journey.' },
      { href: '/pricing', title: 'Pricing', description: 'Understand rollout and support guidance.' },
      { href: '/trust', title: 'Trust Center', description: 'Validate governance and support details.' }
    ]
  },
  '/accessibility': {
    intro: 'Accessibility review often sits alongside trust, platform governance, contact paths, and public rollout planning.',
    links: [
      { href: '/trust', title: 'Trust Center', description: 'Review governance, support, and trust details.' },
      { href: '/platform', title: 'Platform', description: 'See the system layer behind public experience standards.' },
      { href: '/contact', title: 'Contact', description: 'Reach out with support or accessibility questions.' },
      { href: '/pricing', title: 'Pricing', description: 'Review rollout planning and implementation guidance.' }
    ]
  }
}

function normalizePath(pathname: string) {
  if (!pathname) return '/'
  if (pathname.startsWith('/marketplace/')) return '/marketplace'
  if (pathname.startsWith('/trust')) return '/trust'
  if (pathname.startsWith('/case-studies')) return '/case-studies'
  return pathname
}

export default function ContextualPublicLinks() {
  const pathname = normalizePath(usePathname() || '/')
  const config = relatedMap[pathname] || relatedMap['/']

  return (
    <section className='oi-section' aria-labelledby='related-pages-heading'>
      <div className='oi-container' style={{ maxWidth: 1120 }}>
        <div className='oi-card'>
          <p className='text-xs font-semibold uppercase tracking-[0.3em] text-slate-400'>Related pages</p>
          <h2 id='related-pages-heading' className='mt-3 text-2xl font-semibold text-white'>
            Explore the next most relevant pages
          </h2>
          <p className='mt-3 max-w-3xl text-sm leading-7 text-slate-300'>
            {config.intro}
          </p>

          <div className='mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
            {config.links.map((link) => (
              <Link
                key={link.href}
                href={link.href as Route}
                className='oi-card block rounded-2xl transition-transform duration-200 hover:-translate-y-0.5'
              >
                <div className='text-base font-semibold text-white'>{link.title}</div>
                <p className='mt-2 text-sm leading-7 text-slate-300'>{link.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}