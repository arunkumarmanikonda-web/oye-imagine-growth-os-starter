import type { Metadata } from 'next'
import { LegalPolicyPage, type LegalPolicySection } from '@/components/public/LegalPolicyPage'

export const metadata: Metadata = {
  title: 'Terms of Service | Oye !magine',
  description: 'Terms governing access to and use of the Oye !magine AI Growth OS, subscriptions and related managed services.',
  alternates: { canonical: '/terms' },
}

const sections: LegalPolicySection[] = [
  {
    title: '1. Agreement and scope',
    paragraphs: [
      'These Terms of Service govern access to and use of the Oye !magine website, AI Growth OS, customer workspaces, marketplace capabilities and related managed services provided by Oye Imagine Private Limited. By creating an account, accepting an order form or using a paid service, the customer agrees to these Terms together with any applicable order form, statement of work, DPA and specifically incorporated policy.',
      'If an executed order form or separately signed agreement expressly conflicts with these Terms, that signed document controls for the conflicting provision. Public marketing material does not expand a contracted service scope unless incorporated into an executed agreement.',
    ],
  },
  {
    title: '2. Accounts and authorised users',
    bullets: [
      'Customers are responsible for the accuracy of registration information and for activities performed by their authorised users.',
      'Credentials must be kept confidential and may not be shared in a manner that defeats assigned user, role or workspace controls.',
      'Privileged access may require MFA, password changes or other security steps. Oye !magine may suspend access reasonably believed to be compromised or used unlawfully.',
      'Role and permission settings control what a user may view or change. A customer administrator is responsible for assigning appropriate authority within the customer organisation.',
    ],
  },
  {
    title: '3. Subscription, plans and service scope',
    paragraphs: [
      'The subscribed edition, billing cycle, included capabilities, usage limits, brands, workspaces, managed services and implementation scope are defined by the applicable pricing page, order form or commercial proposal at the time of purchase, subject to any expressly stated fair-use or technical limits.',
      'Media spend, pass-through third-party charges, taxes, specialist services and implementation work are not included in the platform fee unless the applicable order expressly says otherwise.',
    ],
  },
  {
    title: '4. Fees, taxes and payment',
    paragraphs: [
      'Fees are payable in the currency, billing cycle and method stated in the applicable order. GST and other applicable taxes are additional unless expressly stated as inclusive. Customers are responsible for providing accurate billing and tax information.',
      'Paid features may remain activation-gated until required commercial, identity, payment or integration steps are completed. Payment status shown inside the platform is not a substitute for final settlement confirmation from the relevant financial provider or bank.',
    ],
  },
  {
    title: '5. Renewals, upgrades, cancellation and refunds',
    paragraphs: [
      'Renewal, committed term, cancellation, downgrade and refund rights follow the applicable order form or plan-specific commercial terms. Unless a written order grants a different right, prepaid fees for an active committed period are not automatically refundable merely because the customer elects not to use the service.',
      'Where consumer-law or other mandatory statutory rights apply, those rights are not excluded by these Terms.',
    ],
  },
  {
    title: '6. Customer data and permitted use',
    paragraphs: [
      'As between the parties, the customer retains its rights in data and materials it lawfully submits to the service. The customer grants Oye !magine the limited rights reasonably necessary to host, process, transmit, transform and otherwise handle that material to provide and secure the contracted service.',
      'The customer represents that it has the rights, notices, consents and lawful basis required to provide customer data and instruct the requested processing.',
    ],
  },
  {
    title: '7. AI-assisted features and outputs',
    paragraphs: [
      'AI-assisted features may generate recommendations, analysis, text, creative concepts or other outputs based on customer context and configured providers. AI output can contain errors, omissions or unsuitable material and must be reviewed before consequential use.',
      'Oye !magine does not warrant that AI output will be unique, error-free, legally compliant for every use, or suitable for regulated, legal, financial, medical or other high-impact decisions. Customers remain responsible for approvals, claims, publishing decisions and legal use of outputs.',
    ],
  },
  {
    title: '8. External services and integrations',
    paragraphs: [
      'Certain capabilities depend on third-party services such as advertising platforms, analytics services, AI providers, messaging services, payment providers or electronic-signature providers. A provider is available only when it is actually supported, configured and authorised for the relevant customer environment.',
      'Third-party services are governed by their own terms, availability and technical limits. Oye !magine is not responsible for a third party’s independent suspension, outage, policy change or rejection of customer content, though we will operate our own integration obligations in accordance with the applicable service scope.',
    ],
  },
  {
    title: '9. Approvals, publishing and spend authority',
    paragraphs: [
      'Where the platform provides approval workflows, budgets or permission controls, customers must configure appropriate authorised users. Publishing, advertising spend, financial actions and other high-impact external actions should remain within the authority assigned by the customer and the applicable service configuration.',
      'The availability of a draft, recommendation, readiness state or internal record does not itself prove that an external provider accepted or completed an action. Provider-side confirmation and reconciliation remain authoritative where applicable.',
    ],
  },
  {
    title: '10. Acceptable use',
    bullets: [
      'Do not use the service unlawfully, fraudulently or to infringe intellectual-property, privacy, publicity or other rights.',
      'Do not attempt to bypass authentication, tenant boundaries, permissions, rate limits, security controls or approval gates.',
      'Do not introduce malicious code, conduct unauthorised security testing, scrape restricted data or interfere with platform availability.',
      'Do not use the service to send unlawful spam, deceptive advertising or prohibited content, or to operate regulated activities outside the contracted and lawful service scope.',
    ],
  },
  {
    title: '11. Confidentiality and security',
    paragraphs: [
      'Each party should protect the other party’s confidential information using reasonable safeguards and use it only for the relationship or as otherwise permitted by law. Additional confidentiality, security and data-processing commitments may be documented in an enterprise agreement or DPA.',
    ],
  },
  {
    title: '12. Intellectual property',
    paragraphs: [
      'Oye !magine and its licensors retain all rights in the platform, software, workflows, design systems, documentation, trademarks and underlying technology except for customer data and rights expressly granted under an applicable agreement. No licence is granted except the limited right to use the subscribed service during the applicable term.',
    ],
  },
  {
    title: '13. Availability, changes and beta capabilities',
    paragraphs: [
      'We may improve or change the service over time. Material removal of a paid contracted capability during a committed term will be handled under the applicable agreement. Preview, pilot or beta capabilities may be changed or discontinued and should not be treated as generally available unless expressly stated.',
    ],
  },
  {
    title: '14. Suspension and termination',
    paragraphs: [
      'Oye !magine may suspend access where reasonably necessary to address non-payment, material breach, unlawful use, security risk, provider restriction or threat to the service or other customers. The parties’ termination rights, cure periods and post-termination obligations are governed by the applicable order or signed agreement where one exists.',
    ],
  },
  {
    title: '15. Disclaimers and limitation framework',
    paragraphs: [
      'Except for obligations expressly stated in a signed agreement and rights that cannot legally be excluded, the service is provided on an as-available basis. Business, advertising and AI outcomes depend on factors outside Oye !magine’s control, and no specific revenue, ranking, conversion or campaign result is guaranteed.',
      'Any negotiated liability cap, exclusions, indemnities or service credits should be stated in the applicable enterprise agreement or order form. These public Terms do not override mandatory rights or a separately executed allocation of risk.',
    ],
  },
  {
    title: '16. Governing law, notices and changes',
    paragraphs: [
      'Unless an executed agreement specifies otherwise, these Terms are governed by the laws of India and disputes are subject to the courts having competent jurisdiction in Gautam Buddha Nagar, Uttar Pradesh, India, subject to any mandatory legal forum or agreed arbitration provision that applies.',
      'Legal notices may be sent to hello@oyeimagine.com and the registered business address published below. We may update these Terms by publishing a revised version and effective date; material changes affecting an active contracted service will be handled in accordance with the applicable agreement and law.',
    ],
  },
]

export default function TermsPage() {
  return (
    <LegalPolicyPage
      eyebrow="Legal"
      title="Terms of Service"
      summary="The baseline terms governing access to the Oye !magine AI Growth OS, subscriptions, customer workspaces, AI-assisted features and related managed services."
      effectiveDate="15 August 2026"
      sections={sections}
      notice="These public Terms are the default service baseline. A signed order form, statement of work or enterprise agreement may add or replace commercial, service-level, liability, data-processing or dispute provisions for a specific customer. Formal legal review remains part of final corporate sign-off."
    />
  )
}
