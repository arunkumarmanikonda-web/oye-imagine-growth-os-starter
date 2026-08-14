'use client'

import type { ReactNode } from 'react'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const appPrefixes = ['/workspace', '/admin', '/client', '/auth/mfa']
const primaryNav: Array<{ label: string; href: Route }> = [
  { label: 'About', href: '/about' },
  { label: 'Platform', href: '/platform' },
  { label: 'Solutions', href: '/solutions' },
  { label: 'Customers', href: '/customers' },
  { label: 'Integrations', href: '/integrations' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Trust', href: '/trust' },
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
    <div className="oi-shell public-shell">
      <header className="social-public-header">
        <div className="oi-container social-public-header-inner">
          <Link className="social-brand-lockup" href="/" aria-label="Oye !magine home">
            <img src="/brand/oye-imagine-logo.webp" alt="Oye !magine" />
          </Link>

          <nav className="social-desktop-nav" aria-label="Primary navigation">
            {primaryNav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={active ? 'is-active' : undefined}>{item.label}</Link>
            })}
          </nav>

          <div className="social-header-actions">
            <Link href="/login" className="social-signin">Sign in</Link>
            <Link href="/contact" className="social-demo">Book a demo</Link>
            <button type="button" className="social-menu-button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
              <span /><span /><span />
            </button>
          </div>
        </div>

        {open ? <div className="social-mobile-panel is-open">
          <div className="social-mobile-panel-inner">
            <div className="social-mobile-intro"><span>One identity</span><strong>The right workspace appears after sign in.</strong></div>
            <nav aria-label="Mobile navigation">
              {primaryNav.map((item, index) => <Link href={item.href} key={item.href}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item.label}</strong><b>↗</b></Link>)}
            </nav>
            <div className="social-mobile-actions"><Link href="/signup">Create customer account</Link><Link href="/login">Sign in</Link><Link href="/contact">Contact us</Link></div>
          </div>
        </div> : null}
      </header>

      <main id="main-content" className="oi-main">{children}</main>

      <footer className="premium-footer">
        <div className="premium-footer-grid">
          <section>
            <img src="/brand/oye-imagine-logo.webp" alt="Oye !magine" className="premium-footer-logo" />
            <h2>Imagine growth as one living system.</h2>
            <p>Strategy, creative, campaigns, approvals, analytics, commercial control and AI-assisted operations, organised around one brand truth.</p>
            <div className="premium-footer-primary-links"><Link href="/about">About</Link><Link href="/contact">Contact</Link><Link href="/trust">Trust Center</Link></div>
          </section>
          <section className="premium-footer-links">
            <div><strong>Product</strong><Link href="/platform">Platform</Link><Link href="/solutions">Solutions</Link><Link href="/integrations">Integrations</Link><Link href="/pricing">Pricing</Link></div>
            <div><strong>Company</strong><Link href="/about">About</Link><Link href="/customers">Customers</Link><Link href="/contact">Contact</Link><Link href="/trust">Trust Center</Link></div>
            <div><strong>Access</strong><Link href="/login">Universal sign in</Link><Link href="/signup">Create customer account</Link><Link href="/marketplace">Marketplace</Link></div>
          </section>
        </div>
        <div className="premium-footer-bottom"><span>Oye Imagine Private Limited</span><span>One identity. Role-scoped workspace. Governed growth.</span></div>
      </footer>
    </div>
  )
}
