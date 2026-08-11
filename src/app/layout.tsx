import type { Metadata } from 'next'
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";
import { buildFooterMeta } from "@/lib/foundation/public-shell";
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo/site'
import ContextualPublicLinks from '@/components/public/ContextualPublicLinks'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://127.0.0.1:3060'),
  title: 'OYE Imagine | Enterprise growth experiences',
  description:
    'OYE Imagine helps enterprise teams launch guided demos, qualification flows, marketplaces, and conversion-ready public experiences.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'OYE Imagine | Enterprise growth experiences',
    description:
      'OYE Imagine helps enterprise teams launch guided demos, qualification flows, marketplaces, and conversion-ready public experiences.',
    url: '/',
    siteName: 'OYE Imagine',
    type: 'website',
    images: [{ url: '/favicon.ico' }]
  },
  twitter: {
    card: 'summary',
    title: 'OYE Imagine | Enterprise growth experiences',
    description:
      'OYE Imagine helps enterprise teams launch guided demos, qualification flows, marketplaces, and conversion-ready public experiences.',
    images: ['/favicon.ico']
  }
}

export default function RootLayout(props: { children: ReactNode }) {
  const footerMeta = buildFooterMeta()
  return (
    <html lang="en">
      <body>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-black focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
        <div className="oi-shell">
          <header className="oi-topbar">
            <div
  className="oi-container"
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap"
  }}
>
              <Link className="oi-brand" href="/">
                Oye !magine
              </Link>

              <nav className="oi-nav oi-nav-wrap" aria-label="Primary">
                <Link href="/platform">Platform</Link>
                <Link href="/marketplace">Marketplace</Link>
                <Link href="/solutions">Solutions</Link>
                <Link href="/pricing">Pricing</Link>
                <Link href="/trust">Trust Center</Link>
                <Link href="/login/client">Client login</Link>
                <a href="mailto:hello@oyeimagine.com">Contact</a>
              </nav>

              <div
  style={{
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "stretch"
  }}
>
                <a
  className="oi-btn oi-btn-secondary"
  href="mailto:hello@oyeimagine.com"
  style={{ flex: "1 1 220px", minWidth: 0, justifyContent: "center" }}
>
                  hello@oyeimagine.com
                </a>
                <Link
  className="oi-btn oi-btn-primary"
  href="/marketplace"
  style={{ flex: "1 1 180px", minWidth: 0, justifyContent: "center" }}
>
                  Explore marketplace
                </Link>
              </div>
            </div>
          </header>

          <div id="main-content" className="oi-main">{props.children}</div>

          <ContextualPublicLinks />

          <footer>
            <div className="oi-container oi-py-card-lg">
              <div className="oi-grid oi-grid--two">
                <article className="oi-card">
                  <div className="oi-card-title">Oye !magine</div>
                  <p className="oi-page-subtitle oi-mt-2">
                    Premium digital growth systems, managed delivery, client-ready reporting, and admin-controlled content surfaces.
                  </p>
                </article>

                <article className="oi-card">
                  <div className="oi-card-title">Legal and support identity</div>
                  <div className="oi-meta-line oi-mt-3">
                    <strong>Legal name:</strong> {footerMeta.legalName}
                  </div>
                  <div className="oi-meta-line" style={{ marginTop: 8 }}>
                    <strong>GSTIN:</strong> {footerMeta.gstin}
                  </div>
                  <div className="oi-meta-line" style={{ marginTop: 8 }}>
                    <strong>CIN:</strong> {footerMeta.cin}
                  </div>
                  <div className="oi-meta-line" style={{ marginTop: 8 }}>
                    <strong>Email:</strong> {footerMeta.supportEmail}
                  </div>
                  <div className="oi-meta-line" style={{ marginTop: 8 }}>
                    <strong>Phone:</strong> {footerMeta.supportPhone}
                  </div>
                </article>
              </div>
            </div>
          </footer>
        </div>
            <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }} />    </body>
    </html>
  );
}
