import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import FaqSection from '@/components/seo/FaqSection'
import { solutionsFaqItems } from '@/lib/seo/faq-data'
import { buildMetadata, faqPageJsonLd } from '@/lib/seo/site'

export const metadata: Metadata = buildMetadata(
  '/solutions',
  'Enterprise Solutions | OYE Imagine',
  'Explore OYE Imagine solutions for teams that need governed public funnels, operational clarity, and enterprise-grade launch surfaces.'
)

export default function SolutionsLayout({ children }: { children: ReactNode }) {
  const faqJsonLd = faqPageJsonLd('/solutions', 'Solutions FAQ', solutionsFaqItems)

  return (
    <>
      {children}
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <FaqSection title='Solutions FAQ' items={solutionsFaqItems} />
    </>
  )
}