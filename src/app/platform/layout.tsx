import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import FaqSection from '@/components/seo/FaqSection'
import { platformFaqItems } from '@/lib/seo/faq-data'
import { buildMetadata, faqPageJsonLd, productJsonLd } from '@/lib/seo/site'

export const metadata: Metadata = buildMetadata(
  '/platform',
  'Oye !magine Platform | AI Growth OS',
  'Explore the governed Oye !magine Growth OS for brand intelligence, research, strategy, creative, campaigns, approvals, analytics and commercial control.'
)

export default function PlatformLayout({ children }: { children: ReactNode }) {
  const faqJsonLd = faqPageJsonLd('/platform', 'Platform FAQ', platformFaqItems)
  const productJsonLdData = productJsonLd(
    '/platform',
    'Oye !magine AI Growth OS',
    'An AI-assisted growth operating system connecting brand intelligence, strategy, creative, campaign operations, approvals, analytics and commercial governance.'
  )

  return (
    <>
      {children}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLdData) }} />
      <FaqSection title="Platform FAQ" items={platformFaqItems} />
    </>
  )
}
