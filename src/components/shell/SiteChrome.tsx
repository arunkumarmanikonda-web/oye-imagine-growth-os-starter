'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const appPrefixes = ['/workspace', '/admin', '/client', '/auth/mfa']

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isApp = appPrefixes.some((prefix) => pathname.startsWith(prefix))

  if (isApp) return <>{children}</>

  return (
    <div className="oi-shell public-shell">
      <header className="premium-public-header">
        <div className="premium-public-inner">
          <Link className="premium-brand" href="/" aria-label="Oye !magine home">
            <img src="/brand/oye-imagine-logo.webp" alt="Oye !magine" />
          </Link>
          <nav className="premium-public-nav" aria-label="Primary navigation">
            <Link href="/platform">Platform</Link>
            <Link href="/solutions">Solutions</Link>
            <Link href="/about">About</Link>
            <Link href="/customers">Customers</Link>
            <Link href="/integrations">Integrations</Link>
            <Link href="/marketplace">Marketplace</Link>
            <Link href="/pricing">Pricing</Link>
          </nav>
          <div className="premium-public-actions">
            <Link className="premium-login-link" href="/login">Sign in</Link>
            <Link className="premium-start-button" href="/signup">Get started</Link>
          </div>
        </div>
      </header>
      <main id="main-content" className="oi-main">{children}</main>
      <footer className="premium-footer">
        <div className="premium-footer-grid">
          <section>
            <img src="/brand/oye-imagine-logo.webp" alt="Oye !magine" className="premium-footer-logo" />
            <h2>Imagine growth as one living system.</h2>
            <p>Strategy, creative, campaigns, approvals, analytics, commercial control and AI-assisted operations, organised around one brand truth.</p>
          </section>
          <section className="premium-footer-links">
            <div><strong>Product</strong><Link href="/platform">Platform</Link><Link href="/solutions">Solutions</Link><Link href="/integrations">Integrations</Link><Link href="/pricing">Pricing</Link></div>
            <div><strong>Company</strong><Link href="/about">About</Link><Link href="/customers">Customers</Link><Link href="/contact">Contact</Link><Link href="/trust">Trust Center</Link></div>
            <div><strong>Access</strong><Link href="/login">Sign in</Link><Link href="/signup">Create account</Link><Link href="/marketplace">Marketplace</Link></div>
          </section>
        </div>
        <div className="premium-footer-bottom"><span>Oye Imagine Private Limited</span><span>Built for governed growth.</span></div>
      </footer>
    </div>
  )
}
