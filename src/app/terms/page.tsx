import type { Metadata } from 'next'
import { PolicyPage } from '@/components/public/PolicyPage'
import { PUBLIC_TERMS_VERSION } from '@/lib/legal/public-legal-versions'

export const metadata: Metadata = {
  title: 'Terms of Service | Oye !magine',
  description: 'Review the baseline terms governing access to and use of the Oye !magine AI Growth OS and related services.',
}

export default function TermsPage() {
  return (
    <PolicyPage
      eyebrow="Legal"
      title="Terms of Service"
      summary="These Terms govern access to and use of the Oye !magine website, AI Growth OS, marketplace and related services provided by Oye Imagine Private Limited. A signed order form, statement of work, enterprise agreement or other negotiated document may add to or modify these Terms for a specific customer."
      lastUpdated={PUBLIC_TERMS_VERSION}
      sections={[
        {
          title: '1. Agreement and eligibility',
          body: 'By creating an account, accepting an order form, using the service or otherwise agreeing to these Terms, you confirm that you are authorised to bind yourself or the organisation you represent and that your use is lawful in the jurisdictions that apply to you.'
        },
        {
          title: '2. Service scope',
          body: 'Oye !magine provides software and, where separately agreed, managed or specialist services for brand intelligence, strategy, content and creative operations, approvals, campaign orchestration, analytics, commercial governance and related workflows. Provider-dependent capabilities are available only when the relevant external account, credential, permission and production-readiness requirements are satisfied.'
        },
        {
          title: '3. Accounts and access',
          bullets: [
            'You are responsible for accurate account information and for protecting credentials and recovery methods.',
            'Access may be controlled by tenant, workspace, brand, role, user-level permissions and approval policies.',
            'You must not share privileged credentials, circumvent access controls or use another person’s account without authority.',
            'We may suspend access where reasonably necessary to protect the service, customers, providers or legal compliance.'
          ]
        },
        {
          title: '4. Subscriptions, fees and taxes',
          body: 'Fees, billing cadence, included capabilities and any separately funded media, pass-through, managed-service or implementation charges are described in the applicable pricing page, order form or commercial agreement. Taxes, including GST where applicable, are additional unless expressly stated otherwise. Customer-funded advertising or provider spend is separate from the platform subscription unless a written agreement expressly says otherwise.'
        },
        {
          title: '5. Renewals, plan changes and cancellation',
          body: 'Renewal, upgrade, downgrade and cancellation rights follow the applicable order form, pricing terms or subscription arrangement. Unless a specific written commitment states otherwise, cancellation stops future service after the applicable paid term and does not automatically reverse charges already incurred, committed provider spend or completed services.'
        },
        {
          title: '6. Customer data and instructions',
          body: 'You retain ownership of customer data and materials you lawfully provide. You grant Oye !magine the rights necessary to host, process, transform and use those materials solely to provide, secure, support and improve the contracted service, subject to the Privacy Notice, applicable DPA and any customer-specific agreement.'
        },
        {
          title: '7. AI-assisted features',
          bullets: [
            'AI outputs may be probabilistic and should be reviewed before high-impact use.',
            'You remain responsible for final business decisions, approvals, claims, budgets, legal compliance and publication choices unless a signed agreement expressly allocates responsibility differently.',
            'Oye !magine may apply model, tool, budget and permission controls to reduce unsafe or unauthorised execution.',
            'Third-party model providers may impose separate terms for configured model use.'
          ]
        },
        {
          title: '8. External providers and media',
          body: 'Advertising networks, analytics services, messaging providers, payment processors, eSign services and other connected systems are independent third parties. Their availability, policies, account standing, fees, data practices and technical limits remain subject to their own terms. Oye !magine does not treat a provider as live merely because the provider is listed as supported.'
        },
        {
          title: '9. Acceptable use',
          body: 'You must not use the service for unlawful activity, unauthorised access, credential theft, malicious code, deceptive impersonation, prohibited spam, infringement, exploitation, or activity that materially threatens another person, system or provider. Additional acceptable-use restrictions may apply to AI, messaging, advertising and marketplace services.'
        },
        {
          title: '10. Intellectual property',
          body: 'Oye Imagine Private Limited and its licensors retain rights in the platform, software, interfaces, documentation, trademarks and underlying technology. Customer-specific outputs and deliverables are governed by the applicable order form or statement of work, including any third-party rights, model-provider restrictions or licensed source materials.'
        },
        {
          title: '11. Confidentiality',
          body: 'Each party should protect the other party’s non-public business, technical and commercial information using reasonable care and use it only for the relationship, except where disclosure is authorised or legally required.'
        },
        {
          title: '12. Security and service changes',
          body: 'We use reasonable technical and organisational measures appropriate to the service and may change, improve, replace or discontinue features where necessary. Material changes affecting contracted commitments remain subject to the governing commercial agreement.'
        },
        {
          title: '13. Warranties and disclaimers',
          body: 'Except for express commitments in a signed agreement and to the extent permitted by law, the service is provided on an as-available basis. We do not guarantee a particular advertising, revenue, ranking, conversion or AI-output result, because results depend on customer inputs, market conditions, external providers and other factors outside the platform’s control.'
        },
        {
          title: '14. Liability',
          body: 'Any limitations, exclusions, caps, indemnities or special remedies are governed by the applicable signed commercial agreement. Where no separate agreement applies, liability is limited to the maximum extent permitted by applicable law and these Terms should not be read to exclude liability that cannot legally be excluded.'
        },
        {
          title: '15. Suspension and termination',
          body: 'Access may be suspended or terminated for material breach, security risk, unlawful use, non-payment, provider restrictions or other grounds stated in the applicable agreement. On termination, data export, retention and deletion follow the governing agreement, Privacy Notice and DPA where applicable.'
        },
        {
          title: '16. Governing law and notices',
          body: 'Unless a signed agreement states otherwise, the relationship is intended to be governed by the laws of India, with disputes subject to the forum specified in the applicable commercial agreement. Formal notices should use the legal or commercial contact identified in the relevant agreement; general product questions may be sent through the Contact page.'
        },
        {
          title: '17. Changes and order of precedence',
          body: 'We may update these public Terms prospectively. If there is a conflict, a signed enterprise agreement, order form, DPA or statement of work takes precedence for the subject it specifically governs.'
        }
      ]}
    />
  )
}
