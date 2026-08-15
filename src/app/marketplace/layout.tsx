import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import FaqSection from '@/components/seo/FaqSection'
import { marketplaceFaqItems } from '@/lib/seo/faq-data'
import { buildMetadata, faqPageJsonLd, productJsonLd } from '@/lib/seo/site'

export const metadata: Metadata = buildMetadata(
  '/marketplace',
  'Specialist Marketplace | Oye !magine',
  'Discover how the Oye !magine specialist marketplace is designed to govern scoped requests, proposals, specialist delivery, approvals, and commercial handoff.'
)

export default function MarketplaceLayout({ children }: { children: ReactNode }) {
  const faqJsonLd = faqPageJsonLd('/marketplace', 'Marketplace FAQ', marketplaceFaqItems)
  const productJsonLdData = productJsonLd(
    '/marketplace',
    'Oye !magine Specialist Marketplace',
    'A governed specialist-services marketplace designed around scoped requests, proposals, approvals, deliverables, and commercial controls.'
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
