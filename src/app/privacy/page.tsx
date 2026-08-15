import type { Metadata } from 'next'
import { LegalPolicyPage, type LegalPolicySection } from '@/components/public/LegalPolicyPage'

export const metadata: Metadata = {
  title: 'Privacy Policy | Oye !magine',
  description: 'Privacy notice for Oye !magine websites, customer workspaces, support, commercial operations and AI-assisted Growth OS services.',
  alternates: { canonical: '/privacy' },
}

const sections: LegalPolicySection[] = [
  {
    title: '1. Who we are and when this policy applies',
    paragraphs: [
      'Oye Imagine Private Limited (Oye !magine, we, us or our) operates oyeimagine.com and the Oye !magine AI Growth OS. This policy applies to personal data processed through our public website, account registration, customer workspaces, commercial and support interactions, platform operations and related managed services.',
      'Depending on the activity, Oye !magine may determine why and how personal data is processed for its own business operations, or may process data on documented instructions from a customer. Contractual data-processing terms may further define those roles for a particular customer engagement.',
    ],
  },
  {
    title: '2. Personal data we may collect',
    bullets: [
      'Identity and contact information such as name, business email, telephone number, employer, job role and communication preferences.',
      'Account, authentication and security information, including role, workspace membership, login events, MFA state, access-control decisions, device/session context and audit records.',
      'Commercial information including selected plan, billing contacts, GST and invoicing details, contracts, orders, payment status and support history.',
      'Customer-provided workspace data such as brand assets, briefs, catalogues, documents, creative material, campaign information, analytics inputs and other content submitted for the contracted service.',
      'Technical information such as IP address, browser/device data, request logs, diagnostics, security events, cookie identifiers where used and product interaction telemetry.',
      'Information contained in enquiries, support tickets, demos, onboarding, feedback, research or other communications with us.',
    ],
  },
  {
    title: '3. Why we process personal data',
    bullets: [
      'Provide, secure, administer and support accounts, workspaces and subscribed services.',
      'Perform onboarding, customer support, approvals, reporting, billing, commercial administration and managed-service delivery.',
      'Authenticate users, enforce permissions, investigate abuse or incidents, preserve auditability and maintain platform reliability.',
      'Generate or assist with strategy, content, analysis and other AI-enabled outputs requested within an authorised workspace.',
      'Improve service quality, reliability and user experience using appropriately governed operational data and feedback.',
      'Comply with applicable legal, tax, accounting, regulatory, fraud-prevention and dispute-resolution requirements.',
      'Send service communications and, where permitted and appropriately consented, relevant commercial communications.',
    ],
  },
  {
    title: '4. Legal grounds, notice and consent',
    paragraphs: [
      'We process personal data only where an appropriate legal basis or permitted purpose applies under applicable law. Where consent is required, the relevant interface or communication should identify the purpose and provide a mechanism to withdraw consent where required. Certain processing may instead be necessary to provide a requested service, perform a contract, meet legal obligations, protect systems or pursue other lawful purposes recognised by applicable law.',
    ],
  },
  {
    title: '5. AI-assisted processing',
    paragraphs: [
      'Oye !magine may route authorised workspace inputs to configured AI or technology providers to perform requested functions. Access is intended to remain tenant and workspace scoped, and high-impact publishing, spend and financial actions remain subject to configured permissions and approval controls.',
      'Customers should not submit special-category, highly sensitive or regulated information unless the applicable agreement and product configuration expressly permit it. AI output should be reviewed before it is relied upon for consequential business, legal, financial or regulated decisions.',
    ],
  },
  {
    title: '6. Service providers and subprocessors',
    paragraphs: [
      'We may use hosting, database, communications, analytics, security, AI, payment, support and other service providers where needed to operate the service. The providers actually used for a customer may depend on the enabled features and configured integrations.',
      'Our current public subprocessor information is maintained on the Subprocessors page. A listed capability is not, by itself, a statement that every provider is connected to every customer workspace.',
    ],
  },
  {
    title: '7. International processing',
    paragraphs: [
      'Some technology providers may process information from infrastructure located outside the customer’s home jurisdiction. Where cross-border processing occurs, we will apply the contractual and legal measures required for the relevant processing context and applicable law. Enterprise customers should review any agreed data-residency or transfer commitments in their order form or DPA.',
    ],
  },
  {
    title: '8. Retention and deletion',
    paragraphs: [
      'We retain personal data for as long as reasonably required to provide the service, maintain security and auditability, fulfil the applicable customer agreement, resolve disputes, and comply with legal, tax, accounting or regulatory requirements. Retention periods therefore vary by data type and contractual context.',
      'When data is no longer required, it should be deleted, anonymised or securely archived as appropriate. Customer offboarding and deletion commitments may be specified more precisely in an applicable order form or DPA.',
    ],
  },
  {
    title: '9. Security and access control',
    paragraphs: [
      'We use organisational and technical controls designed to restrict data to authorised users and workspaces, including role-based access, explicit permission overrides, authentication controls, audit records and approval boundaries. No internet service can guarantee absolute security, and customers remain responsible for protecting their credentials, authorised users and connected third-party accounts.',
    ],
  },
  {
    title: '10. Your choices and privacy requests',
    bullets: [
      'Request information about personal data associated with you and how it is being used, where applicable.',
      'Request correction, updating or completion of inaccurate personal data, where applicable.',
      'Request deletion or erasure where applicable and not overridden by lawful retention requirements.',
      'Withdraw consent where processing depends on consent, without affecting processing already lawfully carried out.',
      'Opt out of non-essential commercial communications using the mechanism provided in the communication or by contacting us.',
      'Raise a grievance or privacy concern through hello@oyeimagine.com. We may need to verify identity and the relevant account or organisation before acting on a request.',
    ],
  },
  {
    title: '11. Cookies and similar technologies',
    paragraphs: [
      'Our use of browser storage, cookies and similar technologies is described in the Cookie Policy. Essential technologies may be required for security, authentication and service operation. Non-essential analytics or marketing technologies, if enabled, should be subject to the applicable notice and consent controls.',
    ],
  },
  {
    title: '12. Children',
    paragraphs: [
      'Oye !magine is a business service and is not directed to children. Customers must not use the platform to process children’s personal data unless the applicable agreement, lawful basis, product configuration and required safeguards expressly support that processing.',
    ],
  },
  {
    title: '13. Changes to this policy',
    paragraphs: [
      'We may update this policy to reflect legal, product, provider or operational changes. Material changes will be published with a revised effective date and, where required, communicated through an appropriate customer or product channel.',
    ],
  },
  {
    title: '14. Contact and grievance handling',
    paragraphs: [
      'Questions, privacy requests and grievances may be sent to hello@oyeimagine.com. Please identify the relevant organisation, workspace and request type so we can route the matter correctly. Additional contractual privacy contacts may be specified in an enterprise agreement or DPA.',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <LegalPolicyPage
      eyebrow="Privacy"
      title="Privacy Policy"
      summary="How Oye !magine handles personal data across the public website, account access, customer workspaces, commercial operations, support and AI-assisted Growth OS services."
      effectiveDate="15 August 2026"
      sections={sections}
      notice="This public notice is an operational policy baseline and is being maintained against applicable Indian data-protection requirements. Customer-specific contractual commitments in an executed order form or DPA take precedence where they expressly differ."
    />
  )
}
