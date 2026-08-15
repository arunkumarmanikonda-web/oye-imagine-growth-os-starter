import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import FaqSection from '@/components/seo/FaqSection'
import { platformFaqItems } from '@/lib/seo/faq-data'
import { buildMetadata, faqPageJsonLd, productJsonLd } from '@/lib/seo/site'

export const metadata: Metadata = buildMetadata(
  '/platform',
  'AI Growth OS Platform | Oye !magine',
  'Explore the Oye !magine AI Growth OS for brand intelligence, strategy, creative and content operations, approvals, campaigns, analytics, permissions, and commercial governance.'
)

export default function PlatformLayout({ children }: { children: ReactNode }) {
  const faqJsonLd = faqPageJsonLd('/platform', 'Platform FAQ', platformFaqItems)
  const productJsonLdData = productJsonLd(
    '/platform',
    'Oye !magine AI Growth OS',
    'A governed growth operating system for brand intelligence, strategy, creative and content operations, campaign orchestration, analytics, approvals, permissions, and commercial control.'
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
