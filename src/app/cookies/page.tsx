import type { Metadata } from 'next'
import { LegalPolicyPage, type LegalPolicySection } from '@/components/public/LegalPolicyPage'

export const metadata: Metadata = {
  title: 'Cookie Policy | Oye !magine',
  description: 'How Oye !magine uses cookies, browser storage and similar technologies across its website and authenticated services.',
  alternates: { canonical: '/cookies' },
}

const sections: LegalPolicySection[] = [
  {
    title: '1. What this policy covers',
    paragraphs: ['This policy explains how Oye Imagine Private Limited uses cookies, browser storage and similar technologies on oyeimagine.com and in authenticated Oye !magine services. It should be read with our Privacy Policy.'],
  },
  {
    title: '2. Essential technologies',
    paragraphs: ['Some browser technologies are necessary for security, authentication, session continuity, fraud prevention, accessibility, preferences and reliable service operation. Where a technology is strictly necessary to provide a requested service, it may operate without optional marketing consent to the extent permitted by applicable law.'],
  },
  {
    title: '3. Analytics and performance technologies',
    paragraphs: ['If analytics or performance measurement is enabled, those technologies may help us understand page performance, product usage, errors and aggregate visitor behaviour. Non-essential analytics should be activated only with the notice and consent controls required for the relevant visitor and jurisdiction.'],
  },
  {
    title: '4. Advertising and marketing technologies',
    paragraphs: ['We do not treat advertising or cross-site marketing technologies as essential. If such technologies are introduced on the public site, the relevant consent interface and this policy should identify the purpose before non-essential tracking is activated where consent is required.'],
  },
  {
    title: '5. Authenticated product storage',
    paragraphs: ['The authenticated product may use secure cookies or local browser storage to maintain sign-in state, protect routes, remember permitted preferences and support security controls. Customers should not attempt to disable security-critical storage while expecting authenticated features to continue operating normally.'],
  },
  {
    title: '6. Your choices',
    bullets: ['Use any cookie preference control presented on the website to manage optional categories.', 'Use browser settings to delete or block stored data, understanding that essential product features may stop working.', 'Contact hello@oyeimagine.com if you need information about a specific technology or consent record.'],
  },
  {
    title: '7. Changes',
    paragraphs: ['We will update this page when our cookie categories, analytics configuration or marketing technologies materially change. The effective date below identifies the current published version.'],
  },
]

export default function CookiesPage() {
  return <LegalPolicyPage eyebrow="Privacy" title="Cookie Policy" summary="A transparent baseline for essential browser storage, optional analytics and any future marketing technologies used by Oye !magine." effectiveDate="15 August 2026" sections={sections} notice="The production website should not load non-essential analytics or marketing technologies before the required consent mechanism is active. The implementation programme includes verifying this behaviour in browser QA." />
}
