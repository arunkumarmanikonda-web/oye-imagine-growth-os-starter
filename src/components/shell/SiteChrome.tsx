'use client'

import type { ReactNode } from 'react'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const appPrefixes = ['/workspace', '/admin', '/client', '/auth/mfa']
const primaryNav: Array<{ label: string; href: Route }> = [
  { label: 'Platform', href: '/platform' },
  { label: 'Solutions', href: '/solutions' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Customers', href: '/customers' },
  { label: 'Integrations', href: '/integrations' },
  { label: 'Trust', href: '/trust' },
  { label: 'Company', href: '/about' },
]

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isApp = appPrefixes.some((prefix) => pathname.startsWith(prefix))
  const [open, setOpen] = useState(false)

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [open])

  if (isApp) return <>{children}</>

  return (
    <div className="oi-shell public-shell institutional-shell">
      <header className="institutional-header">
        <div className="institutional-header-inner">
          <Link className="institutional-brand" href="/" aria-label="Oye !magine home">
            <img src="/brand/oye-imagine-logo.webp" alt="Oye !magine" />
          </Link>

          <nav className="institutional-nav" aria-label="Primary navigation">
            {primaryNav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={active ? 'is-active' : undefined}>{item.label}</Link>
            })}
          </nav>

          <div className="institutional-actions">
            <Link href="/login" className="institutional-signin">Sign in</Link>
            <Link href="/contact" className="institutional-contact">Discuss a rollout <span>↗</span></Link>
            <button type="button" className="institutional-menu" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
              <span /><span /><span />
            </button>
          </div>
        </div>

        {open ? <div className="institutional-mobile-panel is-open">
          <div className="institutional-mobile-panel-inner">
            <p className="institutional-kicker">Oye !magine</p>
            <h2>One governed environment for growth intelligence, execution and specialist delivery.</h2>
            <nav aria-label="Mobile navigation">
              {primaryNav.map((item, index) => <Link href={item.href} key={item.href}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item.label}</strong><b>↗</b></Link>)}
            </nav>
            <div className="institutional-mobile-actions"><Link href="/contact">Discuss a rollout</Link><Link href="/marketplace">Explore marketplace</Link><Link href="/login">Sign in</Link></div>
          </div>
        </div> : null}
      </header>

      <div id="main-content" className="oi-main">{children}</div>

      <footer className="institutional-footer">
        <div className="institutional-footer-top">
          <section className="institutional-footer-thesis">
            <div className="inline-flex rounded-2xl bg-[#f4f1e9] px-4 py-3 shadow-[0_14px_34px_rgba(0,0,0,.18)]">
              <img src="/brand/oye-imagine-logo.webp" alt="Oye !magine" style={{ filter: 'none', opacity: 1 }} />
            </div>
            <h2>Growth, operated as a governed system.</h2>
            <p>Strategy, intelligence, creation, specialist delivery, approvals, commercial controls and performance evidence in one operating environment.</p>
            <Link href="/contact">Discuss an enterprise or managed-growth rollout <span>↗</span></Link>

            <div className="mt-9 border-t border-white/10 pt-7">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/40">Promoter group</span>
              <a href="https://indiagully.com" target="_blank" rel="noreferrer" className="mt-3 flex max-w-lg items-end justify-between gap-5 rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-5 transition hover:bg-white/[0.065]">
                <span>
                  <strong className="block text-2xl font-semibold tracking-[-0.045em] text-white">INDIA GULLY</strong>
                  <small className="mt-1 block text-[11px] font-semibold text-white/45">Same promoter & core leadership group</small>
                </span>
                <span className="pb-1 text-sm text-white/60" aria-hidden="true">↗</span>
              </a>
            </div>
          </section>
          <section className="institutional-footer-links">
            <div><strong>Platform</strong><Link href="/platform">Growth OS</Link><Link href="/solutions">Solutions</Link><Link href="/integrations">Integrations</Link><Link href="/pricing">Commercial model</Link></div>
            <div><strong>Marketplace</strong><Link href="/marketplace">Capabilities</Link><Link href="/customers">Customer models</Link><Link href="/contact">Start an engagement</Link></div>
            <div><strong>Company</strong><Link href="/about">About</Link><Link href="/about#oye-leadership-heading">Leadership</Link><a href="https://indiagully.com" target="_blank" rel="noreferrer">Promoter group ↗</a><Link href="/trust">Trust & governance</Link><Link href="/status">Status</Link><Link href="/contact">Contact</Link></div>
            <div><strong>Legal</strong><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/dpa">DPA</Link><Link href="/subprocessors">Subprocessors</Link><Link href="/accessibility">Accessibility</Link></div>
          </section>
        </div>
        <div className="institutional-footer-bottom">
          <span>© 2026 Oye Imagine Private Limited</span>
          <span>AI Growth OS · Curated Marketplace · Managed Growth</span>
          <span>Shared promoter group with India Gully · respective legal entities</span>
        </div>
      </footer>
    </div>
  )
}
