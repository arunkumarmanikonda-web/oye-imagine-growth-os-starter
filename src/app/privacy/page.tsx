import { PolicyPage } from '@/components/public/PolicyPage'
import { PUBLIC_PRIVACY_VERSION } from '@/lib/legal/public-legal-versions'
import { buildMetadata } from '@/lib/seo/site'

export const metadata = buildMetadata(
  '/privacy',
  'Privacy Notice | Oye !magine',
  'Review how Oye Imagine Private Limited collects, uses, shares, secures, retains and handles personal data across oyeimagine.com and the AI Growth OS.'
)

export default function PrivacyPage() {
  return (
    <PolicyPage
      eyebrow="Privacy and data protection"
      title="Privacy Notice"
      summary="This Privacy Notice explains how Oye Imagine Private Limited handles personal data when people visit oyeimagine.com, create or use an Oye !magine account, contact us, receive support, participate in commercial discussions, or use configured Growth OS services."
      lastUpdated={PUBLIC_PRIVACY_VERSION}
      sections={[
        { title: '1. Who we are', body: 'Oye Imagine Private Limited is the operator of oyeimagine.com and the Oye !magine AI Growth OS. Depending on the context, we may act as a data controller for our own website, account, sales, security and business operations, and as a processor or service provider when handling customer-controlled personal data to deliver contracted services.' },
        { title: '2. Personal data we may collect', bullets: [
          'Identity and contact information such as name, work email, phone number, company, role and account identifiers.',
          'Commercial and billing information such as selected plan, billing cadence, invoicing details, GST information, transaction references and contract context.',
          'Workspace and service information such as brand data, content, assets, approvals, campaign records, reports, support requests and configured provider references.',
          'Technical and security information such as device, browser, IP-derived security context, session, authentication, audit and error information needed to secure and operate the service.',
          'Communications and preference information, including messages submitted through forms, support channels and consent or suppression preferences where applicable.'
        ] },
        { title: '3. How we collect data', body: 'We may receive data directly from you, from authorised users in your organisation, from connected providers you deliberately authorise, from website and product interactions, from commercial or support communications, and from service providers acting on our behalf.' },
        { title: '4. Why we use personal data', bullets: [
          'Create and administer accounts, tenants, brands, workspaces, permissions and subscriptions.',
          'Provide strategy, content, creative, campaign, analytics, approval, marketplace, commercial and support workflows that a customer chooses to use.',
          'Authenticate users, prevent abuse, investigate incidents and maintain platform reliability.',
          'Process billing, invoicing, tax, contractual and account-management obligations.',
          'Respond to enquiries, support requests, data-protection requests and legal obligations.',
          'Improve product quality, safety, usability and performance using data that we are permitted to use for those purposes.'
        ] },
        { title: '5. Legal bases and consent', body: 'Where applicable law requires a legal basis, processing may rely on performance of a contract, steps requested before entering a contract, legitimate interests in operating and securing the service, compliance with legal obligations, or consent. Where consent is required for optional marketing, cookies or similar activity, it should be collected and recorded separately from essential service processing.' },
        { title: '6. AI and automated processing', body: 'Configured AI features may process customer-provided or workspace-authorised content to generate, classify, retrieve, summarise or assist with operational work. High-impact actions should remain subject to the applicable permissions, approvals and provider controls. We do not treat every AI-generated output as authoritative and customers should review outputs before material business use.' },
        { title: '7. Connected providers and subprocessors', body: 'We may use infrastructure, communications, AI and other service providers to deliver the platform. Customers may also connect their own advertising, analytics, commerce, messaging, payment, eSign or other providers. Our public Subprocessors page describes the principal provider categories, while tenant-specific provider use depends on actual configuration and scope.' },
        { title: '8. Sharing and disclosure', body: 'Personal data may be shared with authorised personnel, approved subprocessors, customer-selected connected providers, professional advisers or authorities where reasonably necessary to deliver the service, protect rights and security, comply with law or complete a legitimate corporate transaction. We do not sell personal data as a data-broker activity.' },
        { title: '9. International processing', body: 'Technology providers may process data in more than one country. Where cross-border transfer restrictions apply, we intend to use the contractual, technical or organisational safeguards required by the applicable legal framework and customer agreement.' },
        { title: '10. Data retention', body: 'We retain information only for as long as reasonably necessary for service delivery, support, security, contractual, financial, tax, audit, legal or dispute requirements. Retention periods vary by record type. Customer-specific deletion, return or export requirements may be defined in an order form, enterprise agreement or DPA.' },
        { title: '11. Security', body: 'Oye !magine is designed around authenticated access, tenant and workspace scoping, role-aware permissions, user-level access overrides, controlled server credentials, audit records and approval-bound operations. No online service can guarantee absolute security, so security controls are continuously reviewed, tested and improved.' },
        { title: '12. Your rights', body: 'Depending on the law that applies to you, you may have rights to request access, correction, deletion, portability, restriction, objection, withdrawal of consent or information about processing. Requests involving customer-controlled data may need to be routed through the relevant customer organisation so that identity and authority can be verified.' },
        { title: '13. India and DPDP Act context', body: 'For processing governed by India’s Digital Personal Data Protection framework, Oye !magine intends to support lawful notice, consent where required, reasonable security safeguards, grievance handling and rights-response processes appropriate to its role in the relevant processing relationship.' },
        { title: '14. Children', body: 'The Oye !magine business service is not directed to children. Users must not deliberately submit children’s personal data unless the customer has a lawful, documented basis and the service scope expressly supports that processing.' },
        { title: '15. Cookies and similar technologies', body: 'The Cookie Policy explains how essential and optional browser technologies may be used. Where optional analytics or marketing consent is legally required, those technologies should not be activated before the relevant consent or preference choice is obtained.' },
        { title: '16. Contact and grievances', body: 'Privacy questions, rights requests or grievances may be submitted through the Contact page or by email to hello@oyeimagine.com. We may request information needed to verify identity, authority and the relevant tenant or commercial context before acting on a request.' },
        { title: '17. Changes to this notice', body: 'We may update this Privacy Notice to reflect product, legal or operational changes. Material updates should be reflected by changing the date above and, where required, communicating the change to affected users or customers.' }
      ]}
    />
  )
}
