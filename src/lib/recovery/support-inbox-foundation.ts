import { organizationProfile, supportChannels } from './organization-profile'

export type SupportEventChannel = 'email' | 'phone' | 'web'
export type SupportEventStatus = 'new' | 'triaged' | 'awaiting_customer' | 'resolved'
export type SupportEventPriority = 'critical' | 'high' | 'medium' | 'low'

export interface SupportInboxEvent {
  id: string
  subject: string
  requester: string
  accountName: string
  channel: SupportEventChannel
  status: SupportEventStatus
  priority: SupportEventPriority
  owner: string | null
  receivedAt: string
  firstResponseDueAt: string
  summary: string
  nextAction: string
  tags: string[]
}

const fallbackEmail = 'hello@oyeimagine.com'
const fallbackPhone = '+91 8 988 988 988'

function findChannelValue(predicate: (value: string) => boolean, fallback: string) {
  const match = supportChannels.find((channel) => predicate(String(channel.value)))
  return match ? String(match.value) : fallback
}

export const supportInboxEvents: SupportInboxEvent[] = [
  {
    id: 'support-evt-001',
    subject: 'Need GST invoice corrected before payment release',
    requester: 'Aarav Mehta',
    accountName: 'Neejee',
    channel: 'email',
    status: 'new',
    priority: 'critical',
    owner: null,
    receivedAt: '2026-07-31T08:30:00.000Z',
    firstResponseDueAt: '2026-07-31T10:30:00.000Z',
    summary:
      'Client requested invoice revision for GST and billing identity alignment before releasing payment.',
    nextAction: 'Assign finance operator and confirm corrected invoice issuance path.',
    tags: ['invoice', 'gst', 'finance']
  },
  {
    id: 'support-evt-002',
    subject: 'Need access to latest operator-visible strategy deliverable',
    requester: 'Ritika Singh',
    accountName: 'Neejee',
    channel: 'web',
    status: 'triaged',
    priority: 'high',
    owner: 'Operator Success Desk',
    receivedAt: '2026-07-31T07:10:00.000Z',
    firstResponseDueAt: '2026-07-31T11:10:00.000Z',
    summary:
      'Client is asking where the latest strategy artifact will appear inside the client workspace.',
    nextAction: 'Reply with workspace path and attach document availability timeline.',
    tags: ['client-access', 'strategy', 'workspace']
  },
  {
    id: 'support-evt-003',
    subject: 'Marketplace proposal follow-up call request',
    requester: 'Devika Rao',
    accountName: 'Marketplace Prospect',
    channel: 'phone',
    status: 'awaiting_customer',
    priority: 'medium',
    owner: 'Marketplace Desk',
    receivedAt: '2026-07-30T14:45:00.000Z',
    firstResponseDueAt: '2026-07-30T18:45:00.000Z',
    summary:
      'Prospect asked for a callback regarding proposal expectations and managed services flow.',
    nextAction: 'Await preferred call slot from prospect before operator follow-up.',
    tags: ['marketplace', 'proposal', 'callback']
  },
  {
    id: 'support-evt-004',
    subject: 'Confirm legal identity shown on contact and trust surfaces',
    requester: 'Internal QA',
    accountName: 'Oye Imagine Private Limited',
    channel: 'web',
    status: 'resolved',
    priority: 'low',
    owner: 'Platform QA',
    receivedAt: '2026-07-29T09:00:00.000Z',
    firstResponseDueAt: '2026-07-29T13:00:00.000Z',
    summary:
      'QA requested confirmation that legal name, GSTIN, address, and support channels are rendered consistently.',
    nextAction: 'Closed after confirming canonical profile values across the current foundation surfaces.',
    tags: ['trust', 'legal', 'qa']
  }
]

export function getSupportInboxSnapshot() {
  const statusCounts: Record<SupportEventStatus, number> = {
    new: 0,
    triaged: 0,
    awaiting_customer: 0,
    resolved: 0
  }

  const priorityCounts: Record<SupportEventPriority, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  }

  const channelCounts: Record<SupportEventChannel, number> = {
    email: 0,
    phone: 0,
    web: 0
  }

  for (const event of supportInboxEvents) {
    statusCounts[event.status] += 1
    priorityCounts[event.priority] += 1
    channelCounts[event.channel] += 1
  }

  const unassignedCount = supportInboxEvents.filter((event) => !event.owner).length
  const openCount = supportInboxEvents.filter((event) => event.status !== 'resolved').length
  const awaitingCustomerCount = supportInboxEvents.filter(
    (event) => event.status === 'awaiting_customer'
  ).length
  const criticalOpenCount = supportInboxEvents.filter(
    (event) => event.priority === 'critical' && event.status !== 'resolved'
  ).length

  return {
    totalEvents: supportInboxEvents.length,
    openCount,
    unassignedCount,
    awaitingCustomerCount,
    criticalOpenCount,
    statusCounts,
    priorityCounts,
    channelCounts,
    mailbox: {
      email: findChannelValue((value) => value.includes('@'), fallbackEmail),
      phone: findChannelValue((value) => value.includes('+91'), fallbackPhone)
    }
  }
}

export function getSupportInboxExperience() {
  const snapshot = getSupportInboxSnapshot()

  return {
    title: 'Support operations inbox',
    subtitle:
      'Governed intake for support, commercial, and marketplace signals with assignment, SLA, and audit-ready summaries.',
    mailbox: snapshot.mailbox,
    trustProfile: {
      legalName: organizationProfile.legalName,
      gstin: organizationProfile.gstin,
      addressLine: organizationProfile.principalPlaceOfBusiness
    },
    summaryCards: [
      { label: 'Open events', value: String(snapshot.openCount) },
      { label: 'Unassigned', value: String(snapshot.unassignedCount) },
      { label: 'Awaiting customer', value: String(snapshot.awaitingCustomerCount) },
      { label: 'Critical open', value: String(snapshot.criticalOpenCount) }
    ],
    queueDefinitions: [
      {
        label: 'Commercial queue',
        scope: 'Agreements, GST invoices, billing identity, ledger, payment-release requests.'
      },
      {
        label: 'Client success queue',
        scope: 'Workspace access, deliverables, support follow-ups, execution clarifications.'
      },
      {
        label: 'Marketplace queue',
        scope: 'Prospect requests, managed-service routing, proposal and specialist coordination.'
      }
    ],
    responsePolicy: [
      { priority: 'critical', target: '2 business hours' },
      { priority: 'high', target: '4 business hours' },
      { priority: 'medium', target: '1 business day' },
      { priority: 'low', target: '2 business days' }
    ],
    governanceRules: [
      'Every intake record must preserve requester, account, channel, timestamps, and current owner.',
      'Commercial events cannot be closed without operator-visible next action and audit-safe summary.',
      'Mailbox identity must remain canonically bound to hello@oyeimagine.com and +91 8 988 988 988.'
    ],
    events: supportInboxEvents
  }
}