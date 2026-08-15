import type { Metadata } from 'next'
import { LegalPolicyPage, type LegalPolicySection } from '@/components/public/LegalPolicyPage'

export const metadata: Metadata = {
  title: 'Data Processing Addendum | Oye !magine',
  description: 'Baseline data-processing terms for customer personal data processed through the Oye !magine AI Growth OS.',
  alternates: { canonical: '/dpa' },
}

const sections: LegalPolicySection[] = [
  {
    title: '1. Scope and relationship to the customer agreement',
    paragraphs: ['This Data Processing Addendum (DPA) is a public baseline for processing personal data on behalf of a customer in connection with Oye !magine services. It is intended to be incorporated through an executed order form or other written agreement. If a signed customer-specific DPA differs from this page, the signed DPA controls for that customer.'],
  },
  {
    title: '2. Processing roles and instructions',
    paragraphs: ['Where Oye !magine processes personal data on behalf of a customer, the customer determines the lawful purpose and instructions for that processing and Oye !magine processes the data only to provide, secure and support the contracted services, comply with documented instructions, or meet applicable legal requirements. The parties may have different legal roles for data Oye !magine processes for its own account administration, security, billing or legal obligations.'],
  },
  {
    title: '3. Processing details',
    bullets: ['Subject matter: operation and support of the subscribed Growth OS and any contracted managed services.', 'Duration: the applicable service term plus permitted retention or transition periods.', 'Data subjects may include customer personnel, authorised users, prospects, customers, suppliers, partners or other individuals represented in customer-provided data.', 'Data categories may include business contact information, account identifiers, workspace content, campaign or commerce information, support records, analytics identifiers and other data submitted under the contracted scope.', 'Processing may include collection, storage, organisation, retrieval, analysis, generation, transmission, deletion and other operations necessary to provide the service.'],
  },
  {
    title: '4. Confidentiality and authorised personnel',
    paragraphs: ['Oye !magine will limit access to customer personal data to personnel and contractors who require it for authorised service, support, security or legal functions and who are subject to appropriate confidentiality obligations. Access should be role, tenant and workspace scoped wherever technically applicable.'],
  },
  {
    title: '5. Security measures',
    bullets: ['Authentication and access controls appropriate to user privilege.', 'Tenant, brand and workspace scoping in applicable application and data flows.', 'Audit and operational records for security-relevant and governed actions.', 'Secure transport and provider credential handling appropriate to the connected service.', 'Backup, recovery, vulnerability management and incident-response controls appropriate to the production environment.', 'Approval and permission boundaries for high-impact publishing, spend and financial actions where those capabilities are enabled.'],
  },
  {
    title: '6. Subprocessors',
    paragraphs: ['Oye !magine may engage subprocessors where reasonably necessary to provide the service. The current public register is available on the Subprocessors page. Feature-dependent providers should be treated as active for a customer only when the relevant capability is actually enabled or used. Oye !magine remains responsible for imposing appropriate data-protection obligations on subprocessors used for customer processing.'],
  },
  {
    title: '7. Data-subject and customer assistance',
    paragraphs: ['Taking into account the nature of the processing and information available to us, Oye !magine will provide reasonable assistance for customer obligations relating to access, correction, deletion, grievance handling, security incidents or other applicable data-protection requirements under the agreed service scope. Requests should be routed through hello@oyeimagine.com or the contractual support channel.'],
  },
  {
    title: '8. Security incidents',
    paragraphs: ['If Oye !magine becomes aware of a confirmed personal-data breach affecting customer data processed on the customer’s behalf, we will investigate, take reasonable containment and remediation steps, preserve relevant evidence and notify the affected customer in accordance with the applicable agreement and law. Customer-specific notification windows may be defined in a signed enterprise agreement or DPA.'],
  },
  {
    title: '9. International transfers and location',
    paragraphs: ['Service providers may process data from infrastructure outside the customer’s home jurisdiction depending on the enabled service. Where applicable law or the executed agreement requires transfer safeguards, the parties will use the legally appropriate mechanism. Any contracted data-residency commitment must be expressly stated in the applicable order or DPA.'],
  },
  {
    title: '10. Return and deletion',
    paragraphs: ['At termination or expiry, customer data will be returned, made available for export, deleted or retained in accordance with the applicable agreement, product capability and legal retention requirements. Backup copies may persist for a limited recovery cycle before normal expiry, subject to applicable safeguards.'],
  },
  {
    title: '11. Audit and information',
    paragraphs: ['Oye !magine will make reasonable security and compliance information available to enterprise customers for legitimate due diligence. More intrusive audits, penetration tests or on-site reviews require prior written agreement on scope, confidentiality, security and cost so that one customer’s review does not create risk for another customer.'],
  },
]

export default function DpaPage() {
  return <LegalPolicyPage eyebrow="Data protection" title="Data Processing Addendum" summary="Baseline processor terms for customer personal data handled through Oye !magine services, designed to be incorporated into an executed customer agreement." effectiveDate="15 August 2026" sections={sections} notice="This page is a publishable baseline, not a representation that every customer has executed this DPA. Enterprise customers should incorporate the applicable version through their order form or signed agreement, and the final corporate template remains subject to counsel sign-off." />
}
