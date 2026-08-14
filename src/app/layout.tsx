import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import './globals.css'
import './brand.css'
import { buildFooterMeta } from '@/lib/foundation/public-shell'
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo/site'
import ContextualPublicLinks from '@/components/public/ContextualPublicLinks'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.oyeimagine.com'
const brandLogo = '/brand/oye-imagine-logo.webp'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Oye !magine | AI Growth OS', template: '%s | Oye !magine' },
  description: 'Oye !magine is an AI-assisted Growth OS for strategy, creative, campaigns, approvals, analytics, commercial governance and managed growth operations.',
  alternates: { canonical: '/' },
  openGraph: { title: 'Oye !magine | AI Growth OS', description: 'Connect strategy, creation, approvals, campaigns, analytics and commercial governance in one growth operating system.', url: '/', siteName: 'Oye !magine', type: 'website', images: [{ url: brandLogo, alt: 'Oye !magine' }] },
  twitter: { card: 'summary', title: 'Oye !magine | AI Growth OS', description: 'Connect strategy, creation, approvals, campaigns, analytics and commercial governance in one growth operating system.', images: [brandLogo] },
}

export default function RootLayout(props: { children: ReactNode }) {
  const footerMeta = buildFooterMeta()
  return <html lang="en"><body>
    <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-black focus:px-4 focus:py-2 focus:text-white">Skip to main content</a>
    <div className="oi-shell">
      <header className="oi-topbar"><div className="oi-container oye-public-header">
        <Link className="oye-wordmark" href="/" aria-label="Oye !magine home"><img className="oye-brand-logo" src={brandLogo} alt="Oye !magine" /></Link>
        <nav className="oye-public-nav" aria-label="Primary navigation">
          <Link href="/platform">Platform</Link><Link href="/solutions">Solutions</Link><Link href="/customers">Customers</Link><Link href="/integrations">Integrations</Link><Link href="/marketplace">Marketplace</Link><Link href="/pricing">Pricing</Link><Link href="/trust">Trust</Link>
        </nav>
        <div className="oye-header-actions"><Link className="oye-sign-in" href="/login/client">Sign in</Link><Link className="oye-book-demo" href="/contact">Book a demo</Link></div>
      </div></header>
      <main id="main-content" className="oi-main">{props.children}</main>
      <ContextualPublicLinks />
      <footer className="oye-site-footer"><div className="oi-container oye-footer-grid">
        <section><p className="oye-footer-title">Imagine growth as one operating system.</p><p className="oye-footer-copy">Oye !magine connects AI-assisted strategy, execution workflows, human approvals, reporting and commercial controls without pretending that an unverified external integration is already live.</p></section>
        <section className="oye-footer-meta" aria-label="Legal and support identity"><div><strong>Legal name:</strong> {footerMeta.legalName}</div><div><strong>GSTIN:</strong> {footerMeta.gstin}</div><div><strong>CIN:</strong> {footerMeta.cin}</div><div><strong>Email:</strong> <a href={`mailto:${footerMeta.supportEmail}`}>{footerMeta.supportEmail}</a></div><div><strong>Phone:</strong> {footerMeta.supportPhone}</div><div style={{marginTop:16}}><Link href="/customers">Customers</Link> · <Link href="/integrations">Integrations</Link> · <Link href="/trust">Trust Center</Link> · <Link href="/contact">Contact</Link></div></section>
      </div></footer>
    </div>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(organizationJsonLd())}} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(websiteJsonLd())}} />
  </body></html>
}
