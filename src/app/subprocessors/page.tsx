import type { Metadata } from 'next'
import { PolicyPage } from '@/components/public/PolicyPage'

export const metadata: Metadata = {
  title: 'Subprocessors | Oye !magine',
  description: 'Review the categories of infrastructure and external service providers Oye !magine may use to deliver configured services.',
}

export default function SubprocessorsPage() {
  return (
    <PolicyPage
      eyebrow="Trust and transparency"
      title="Subprocessors and external service providers"
      summary="This register explains the principal provider categories Oye Imagine Private Limited may use to deliver the AI Growth OS. A provider appearing here or in the platform catalogue does not mean every customer is connected to that provider; tenant-specific activation depends on configuration, agreement scope and production readiness."
      lastUpdated="15 August 2026"
      sections={[
        {
          title: 'Core hosting and data platform',
          bullets: [
            'Vercel may be used for application hosting, delivery and deployment infrastructure.',
            'Supabase may be used for database, authentication, storage, server-side functions and related platform services.'
          ]
        },
        {
          title: 'AI providers',
          bullets: [
            'OpenAI may be used for configured AI text or related model capabilities when enabled for the relevant environment.',
            'Anthropic may be used for configured AI text or related model capabilities when enabled for the relevant environment.'
          ]
        },
        {
          title: 'Communications and identity services',
          bullets: [
            'Resend may be used for configured transactional email delivery.',
            'Fast2SMS may be used for configured SMS delivery where legally and operationally appropriate.',
            'AiSensy may be used for configured WhatsApp messaging where template, opt-in and account requirements are satisfied.',
            'Google OAuth may be used for approved Google identity or provider authorisation flows.'
          ]
        },
        {
          title: 'Customer-selected providers',
          body: 'Customers may elect to connect advertising, analytics, commerce, payment, eSign or other external services. Those services remain separate providers with their own terms and data-processing practices. Oye !magine should expose their connection status conservatively and only treat them as live after the relevant account, credential, health and execution evidence exists.'
        },
        {
          title: 'Changes to this register',
          body: 'The provider register may change as infrastructure or product capabilities evolve. Material changes affecting contracted customer processing should be communicated in the manner required by the governing agreement or applicable law.'
        },
        {
          title: 'Questions',
          body: 'Enterprise customers may request additional information about provider purpose, data categories, processing location or contractual protections through the Contact page.'
        }
      ]}
    />
  )
}
