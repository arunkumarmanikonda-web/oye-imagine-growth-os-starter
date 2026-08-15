import type { Metadata } from 'next'
import { PolicyPage } from '@/components/public/PolicyPage'

export const metadata: Metadata = {
  title: 'Data Processing Addendum | Oye !magine',
  description: 'Review the Oye !magine Data Processing Addendum framework for customer data processed through the AI Growth OS.',
}

export default function DpaPage() {
  return (
    <PolicyPage
      eyebrow="Enterprise data governance"
      title="Data Processing Addendum"
      summary="This public DPA framework describes the baseline data-processing commitments Oye Imagine Private Limited expects to apply when it processes personal data on behalf of a customer. Customer-specific signed terms, order forms or negotiated enterprise agreements prevail where applicable."
      lastUpdated="15 August 2026"
      sections={[
        {
          title: 'Roles and instructions',
          body: 'For customer-controlled personal data processed to provide contracted services, the customer acts as the relevant controller or business decision-maker and Oye !magine acts as processor or service provider to the extent required by applicable law. Processing is limited to documented service instructions, the agreement, configured product use and lawful obligations.'
        },
        {
          title: 'Confidentiality and access',
          bullets: [
            'Access should be restricted by tenant, workspace, role and operational need.',
            'Personnel and authorised specialists with access to customer personal data should be subject to appropriate confidentiality obligations.',
            'Privileged access and high-impact actions should be logged and governed through applicable approval controls.'
          ]
        },
        {
          title: 'Security measures',
          body: 'Oye !magine is designed around authenticated access, tenant-aware permissions, controlled server credentials, audit records and approval-bound operations. Security measures are continuously subject to implementation, testing and improvement and should be read together with the Trust Center and any customer-specific security schedule.'
        },
        {
          title: 'Subprocessors',
          body: 'Oye !magine may use approved infrastructure, communications, analytics, AI or other service providers to deliver configured services. The public Subprocessors page is intended to provide the current external-provider register once a provider is approved for production use.'
        },
        {
          title: 'Data subject and customer assistance',
          body: 'Subject to applicable law and the customer relationship, Oye !magine will use reasonable measures to assist with access, correction, deletion, export, restriction, objection or similar requests where the relevant data can be identified within the customer context.'
        },
        {
          title: 'Return, deletion and retention',
          body: 'Customer data should be retained only for service delivery, support, security, financial, legal or other documented obligations. At termination, applicable deletion, return, export and residual-backup handling should follow the governing agreement and technical retention process.'
        },
        {
          title: 'International transfers and law',
          body: 'Where cross-border processing occurs, the parties should apply the transfer mechanism and supplementary safeguards required by the applicable jurisdiction. The signed customer agreement should identify the governing law and any additional transfer terms.'
        },
        {
          title: 'Execution',
          body: 'This page is a public framework and does not replace a signed customer-specific DPA where one is contractually required. Enterprise customers may request an execution-ready DPA through the Contact page.'
        }
      ]}
    />
  )
}
