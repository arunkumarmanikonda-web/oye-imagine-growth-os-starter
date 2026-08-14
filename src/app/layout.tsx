import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import './brand.css'
import SiteChrome from '@/components/shell/SiteChrome'
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo/site'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.oyeimagine.com'
const brandLogo = '/brand/oye-imagine-logo.webp'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Oye !magine | AI Growth OS', template: '%s | Oye !magine' },
  description: 'Oye !magine is an AI-assisted Growth OS for strategy, creative, campaigns, approvals, analytics, commercial governance and managed growth operations.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Oye !magine | AI Growth OS',
    description: 'Connect strategy, creation, approvals, campaigns, analytics and commercial governance in one growth operating system.',
    url: '/', siteName: 'Oye !magine', type: 'website', images: [{ url: brandLogo, alt: 'Oye !magine' }],
  },
  twitter: {
    card: 'summary_large_image', title: 'Oye !magine | AI Growth OS',
    description: 'Connect strategy, creation, approvals, campaigns, analytics and commercial governance in one growth operating system.', images: [brandLogo],
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-black focus:px-4 focus:py-2 focus:text-white">Skip to main content</a>
        <SiteChrome>{children}</SiteChrome>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }} />
      </body>
    </html>
  )
}
