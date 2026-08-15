import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import FaqSection from '@/components/seo/FaqSection'
import { marketplaceFaqItems } from '@/lib/seo/faq-data'
import { buildMetadata, faqPageJsonLd, productJsonLd } from '@/lib/seo/site'

export const metadata: Metadata = buildMetadata(
  '/marketplace',
  'Oye !magine Marketplace | Governed specialist execution',
  'Bring assigned specialist execution into the same briefs, permissions, approvals and delivery evidence as the Oye !magine Growth OS.'
)

export default function MarketplaceLayout({ children }: { children: ReactNode }) {
  const faqJsonLd = faqPageJsonLd('/marketplace', 'Marketplace FAQ', marketplaceFaqItems)
  const productJsonLdData = productJsonLd(
    '/marketplace',
    'Oye !magine Marketplace',
    'A governed specialist operating model for scoped human delivery inside customer briefs, permissions, approvals and evidence.'
  )

  return (
    <>
      {children}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLdData) }} />
      <FaqSection title="Marketplace FAQ" items={marketplaceFaqItems} />
    </>
  )
}
