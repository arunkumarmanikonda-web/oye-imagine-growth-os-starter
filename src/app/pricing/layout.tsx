import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import FaqSection from '@/components/seo/FaqSection'
import { pricingFaqItems } from '@/lib/seo/faq-data'
import { buildMetadata, faqPageJsonLd, productJsonLd } from '@/lib/seo/site'

export const metadata: Metadata = buildMetadata(
  '/pricing',
  'Pricing | OYE Imagine',
  'Review OYE Imagine pricing guidance for enterprise growth experiences, modular rollout planning, and governed public journey implementation.'
)

export default function PricingLayout({ children }: { children: ReactNode }) {
  const faqJsonLd = faqPageJsonLd('/pricing', 'Pricing FAQ', pricingFaqItems)
  const productJsonLdData = productJsonLd(
    '/pricing',
    'OYE Imagine Plans',
    'Enterprise pricing guidance for public growth journeys, modular rollout, and governed experience delivery.'
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