import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import FaqSection from '@/components/seo/FaqSection'
import { pricingFaqItems } from '@/lib/seo/faq-data'
import { buildMetadata, faqPageJsonLd, productJsonLd } from '@/lib/seo/site'

export const metadata: Metadata = buildMetadata(
  '/pricing',
  'Plans and Pricing | Oye !magine',
  'Compare Oye !magine editions for AI-assisted growth operations, governance, analytics, agency workflows, managed growth, and white-label delivery.'
)

export default function PricingLayout({ children }: { children: ReactNode }) {
  const faqJsonLd = faqPageJsonLd('/pricing', 'Pricing FAQ', pricingFaqItems)
  const productJsonLdData = productJsonLd(
    '/pricing',
    'Oye !magine Plans',
    'Subscription editions for governed AI-assisted growth operations, from Starter and Growth through Commerce, Agency, Enterprise, Managed Growth, and White Label.'
  )

  return (
    <>
      {children}
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLdData) }} />
      <FaqSection title='Pricing FAQ' items={pricingFaqItems} />
    </>
  )
}
