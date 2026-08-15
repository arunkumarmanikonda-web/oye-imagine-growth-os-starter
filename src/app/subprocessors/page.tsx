import type { Metadata } from 'next'
import { LegalPolicyPage, type LegalPolicySection } from '@/components/public/LegalPolicyPage'

export const metadata: Metadata = {
  title: 'Subprocessors | Oye !magine',
  description: 'Current and feature-dependent service-provider transparency for the Oye !magine AI Growth OS.',
  alternates: { canonical: '/subprocessors' },
}

const sections: LegalPolicySection[] = [
  {
    title: 'How to read this register',
    paragraphs: [
      'This register distinguishes core production infrastructure from feature-dependent providers. A provider appearing in a supported-provider catalogue does not mean that provider is connected to every customer, or even that a production credential is active. Feature-dependent providers become relevant to a customer only when the associated capability is actually configured or used for that customer environment.',
    ],
  },
  {
    title: 'Core production infrastructure',
    bullets: [
      'Vercel — application hosting, delivery and production runtime for the Oye !magine web application.',
      'Supabase — managed database, authentication and related backend platform services for the Oye !magine production environment.',
    ],
  },
  {
    title: 'Feature-dependent provider categories',
    paragraphs: ['The platform contains provider abstractions for capabilities that may be configured as customer needs evolve. The public integration surface must distinguish support from an active production connection.'],
    bullets: [
      'AI model services, including supported OpenAI or Anthropic capability where configured.',
      'Transactional email services, including supported Resend capability where configured.',
      'SMS or messaging services, including supported Fast2SMS or AiSensy capability where configured.',
      'Google identity/OAuth services where a customer authorises an applicable Google connection.',
      'Additional advertising, analytics, payment, electronic-signature or publishing providers only after they are formally activated and recorded in the production provider registry.',
    ],
  },
  {
    title: 'Provider changes',
    paragraphs: ['We may add or replace providers to improve security, resilience, functionality or commercial delivery. Material changes affecting customer personal-data processing should be reflected in this register and handled in accordance with the applicable customer agreement or DPA.'],
  },
  {
    title: 'Customer questions and objections',
    paragraphs: ['Enterprise customers may contact hello@oyeimagine.com for the provider set relevant to their subscribed capabilities, processing locations known to us, or a customer-specific subprocessor review under an applicable DPA.'],
  },
]

export default function SubprocessorsPage() {
  return <LegalPolicyPage eyebrow="Trust" title="Subprocessors" summary="A transparent register separating the services that currently operate the Oye !magine production environment from providers that are only used when a specific capability is actually configured." effectiveDate="15 August 2026" sections={sections} notice="Provider status is intentionally conservative: supported is not presented as connected, healthy or processing customer data until the relevant production evidence exists." />
}
