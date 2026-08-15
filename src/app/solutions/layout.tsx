import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import FaqSection from '@/components/seo/FaqSection'
import { solutionsFaqItems } from '@/lib/seo/faq-data'
import { buildMetadata, faqPageJsonLd } from '@/lib/seo/site'

export const metadata: Metadata = buildMetadata(
  '/solutions',
  'Oye !magine Solutions | Growth operating models',
  'Explore Oye !magine operating models for e-commerce, growing businesses, enterprise teams, agencies, managed growth and white-label partners.'
)

export default function SolutionsLayout({ children }: { children: ReactNode }) {
  const faqJsonLd = faqPageJsonLd('/solutions', 'Solutions FAQ', solutionsFaqItems)

  return (
    <>
      {children}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <FaqSection title="Solutions FAQ" items={solutionsFaqItems} />
    </>
  )
}
