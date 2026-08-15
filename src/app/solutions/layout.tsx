import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import FaqSection from '@/components/seo/FaqSection'
import { solutionsFaqItems } from '@/lib/seo/faq-data'
import { buildMetadata, faqPageJsonLd } from '@/lib/seo/site'

export const metadata: Metadata = buildMetadata(
  '/solutions',
  'Growth Operations Solutions | Oye !magine',
  'Explore Oye !magine solutions for brands, growth teams, agencies, commerce operators, managed growth engagements, and multi-brand organisations.'
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
