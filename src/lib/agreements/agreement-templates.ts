import type { AgreementLineItem, AgreementTemplate } from './agreement-types'

function createLineItem(
  id: string,
  label: string,
  description: string,
  quantity: number,
  unitPrice: number,
  taxable = true,
): AgreementLineItem {
  return {
    id,
    label,
    description,
    quantity,
    unitPrice,
    amount: quantity * unitPrice,
    taxable,
  }
}

export const AGREEMENT_TEMPLATE_REGISTRY: AgreementTemplate[] = [
  {
    id: 'agreement-template-proposal',
    slug: 'proposal',
    title: 'Commercial Proposal',
    kind: 'proposal',
    description: 'Early-stage proposal for pricing, timelines, and solution framing.',
    requiredApprovals: 1,
    signingMode: 'email',
    defaultValidityDays: 14,
    sections: [
      { id: 'overview', title: 'Executive Overview', required: true },
      { id: 'scope', title: 'Scope Snapshot', required: true },
      { id: 'commercials', title: 'Commercial Offer', required: true },
      { id: 'assumptions', title: 'Assumptions', required: false },
    ],
    defaultLineItems: [
      createLineItem('proposal-strategy', 'Strategy Sprint', 'Discovery and channel strategy setup', 1, 35000),
      createLineItem('proposal-retainer', 'Monthly Retainer', 'Execution retainer estimate', 1, 65000),
    ],
  },
  {
    id: 'agreement-template-service',
    slug: 'service-agreement',
    title: 'Master Service Agreement',
    kind: 'service_agreement',
    description: 'Primary service contract for ongoing execution and delivery governance.',
    requiredApprovals: 2,
    signingMode: 'hybrid',
    defaultValidityDays: 30,
    sections: [
      { id: 'parties', title: 'Parties', required: true },
      { id: 'services', title: 'Services', required: true },
      { id: 'sla', title: 'Service Levels', required: true },
      { id: 'commercials', title: 'Commercial Terms', required: true },
      { id: 'legal', title: 'Legal Clauses', required: true },
    ],
    defaultLineItems: [
      createLineItem('service-retainer', 'Marketing Operating Retainer', 'Monthly growth execution', 1, 125000),
      createLineItem('service-reporting', 'Board Reporting Pack', 'Monthly reporting and review', 1, 15000),
    ],
  },
  {
    id: 'agreement-template-addendum',
    slug: 'scope-addendum',
    title: 'Scope Addendum',
    kind: 'scope_addendum',
    description: 'Delta scope and commercial expansion attached to an active agreement.',
    requiredApprovals: 1,
    signingMode: 'email',
    defaultValidityDays: 21,
    sections: [
      { id: 'base', title: 'Base Agreement Reference', required: true },
      { id: 'change', title: 'Scope Change', required: true },
      { id: 'commercials', title: 'Commercial Delta', required: true },
    ],
    defaultLineItems: [
      createLineItem('addendum-content', 'Additional Content Sprint', 'Expanded content production scope', 1, 28000),
    ],
  },
  {
    id: 'agreement-template-invoice-attachment',
    slug: 'invoice-attachment',
    title: 'Invoice Attachment Schedule',
    kind: 'invoice_attachment',
    description: 'Commercial annexure used alongside invoices and payment requests.',
    requiredApprovals: 1,
    signingMode: 'manual',
    defaultValidityDays: 10,
    sections: [
      { id: 'reference', title: 'Invoice Reference', required: true },
      { id: 'milestones', title: 'Milestones', required: true },
      { id: 'tax', title: 'Tax Notes', required: true },
    ],
    defaultLineItems: [
      createLineItem('invoice-schedule', 'Milestone Billing Schedule', 'Attached billing schedule for invoice issue', 1, 10000),
    ],
  },
  {
    id: 'agreement-template-renewal',
    slug: 'renewal-extension',
    title: 'Renewal / Extension',
    kind: 'renewal_extension',
    description: 'Renewal, extension, or continuation of an existing agreement.',
    requiredApprovals: 1,
    signingMode: 'email',
    defaultValidityDays: 20,
    sections: [
      { id: 'reference', title: 'Current Agreement Reference', required: true },
      { id: 'term', title: 'Renewed Term', required: true },
      { id: 'commercials', title: 'Renewed Commercials', required: true },
    ],
    defaultLineItems: [
      createLineItem('renewal-term', 'Renewal Term', 'Quarterly renewal continuation', 1, 180000),
    ],
  },
]

export function getAgreementTemplates(): AgreementTemplate[] {
  return AGREEMENT_TEMPLATE_REGISTRY
}

export function getAgreementTemplateById(templateId: string): AgreementTemplate | undefined {
  return AGREEMENT_TEMPLATE_REGISTRY.find((template) => template.id === templateId)
}