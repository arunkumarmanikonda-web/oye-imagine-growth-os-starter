import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import FaqSection from '@/components/seo/FaqSection'
import { marketplaceFaqItems } from '@/lib/seo/faq-data'
import { buildMetadata, faqPageJsonLd, productJsonLd } from '@/lib/seo/site'

export const metadata: Metadata = buildMetadata(
  '/marketplace',
  'Marketplace Operations | OYE Imagine',
  'See how OYE Imagine supports marketplace discovery, governed submissions, enterprise catalog presentation, and public growth operations.'
)

export default function MarketplaceLayout({ children }: { children: ReactNode }) {
  const faqJsonLd = faqPageJsonLd('/marketplace', 'Marketplace FAQ', marketplaceFaqItems)
  const productJsonLdData = productJsonLd(
    '/marketplace',
    'OYE Imagine Marketplace',
    'A governed enterprise marketplace surface for public discovery, submission flows, and moderated publishing.'
  )

  return (
    <>
      {children}
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLdData) }} />
      <FaqSection title='Marketplace FAQ' items={marketplaceFaqItems} />
    </>
  )
}