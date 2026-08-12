import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import FaqSection from '@/components/seo/FaqSection'
import { platformFaqItems } from '@/lib/seo/faq-data'
import { buildMetadata, faqPageJsonLd, productJsonLd } from '@/lib/seo/site'

export const metadata: Metadata = buildMetadata(
  '/platform',
  'Enterprise Commerce Platform | OYE Imagine',
  'Understand the OYE Imagine platform for governed public growth journeys, qualification, guided workflows, and enterprise commerce presentation.'
)

export default function PlatformLayout({ children }: { children: ReactNode }) {
  const faqJsonLd = faqPageJsonLd('/platform', 'Platform FAQ', platformFaqItems)
  const productJsonLdData = productJsonLd(
    '/platform',
    'OYE Imagine Platform',
    'A governed enterprise growth platform for public demos, qualification, marketplaces, and presentation modules.'
  )

  return (
    <>
      {children}
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLdData) }} />
      <FaqSection title='Platform FAQ' items={platformFaqItems} />
    </>
  )
}