import { getAgreementRegistry } from '../agreements/agreement-registry'
import { getInvoiceRegistry } from '../invoicing/invoice-registry'
import type { AgreementRecord } from '../agreements/agreement-types'
import type { InvoiceRecord } from '../invoicing/invoice-types'
import type {
  CommercialAutomationJob,
  CommercialAutomationKind,
  CommercialAutomationPriority,
  CommercialAutomationSummary,
} from './commercial-types'

function normalizeWorkspaceKey(workspaceKey: string): string {
  return workspaceKey.trim().toLowerCase()
}

function createKindCounter(): Record<CommercialAutomationKind, number> {
  return {
    invoice_reminder: 0,
    agreement_followup: 0,
    renewal_nudge: 0,
    collections_escalation: 0,
  }
}

function createPriorityCounter(): Record<CommercialAutomationPriority, number> {
  return {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  }
}

function addDays(dateIso: string, days: number): string {
  const date = new Date(dateIso)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString()
}

function createJob(job: CommercialAutomationJob): CommercialAutomationJob {
  return job
}

function getOutstandingCommercialInvoices(workspaceFilter?: string): InvoiceRecord[] {
  const normalized = workspaceFilter ? normalizeWorkspaceKey(workspaceFilter) : undefined

  return getInvoiceRegistry().filter((invoice) => {
    if (normalized && invoice.workspaceKey !== normalized) {
      return false
    }

    return ['issued', 'partially_paid', 'overdue'].includes(invoice.status) && invoice.payment.balanceAmount > 0
  })
}

function getFollowupCommercialAgreements(workspaceFilter?: string): AgreementRecord[] {
  const normalized = workspaceFilter ? normalizeWorkspaceKey(workspaceFilter) : undefined

  return getAgreementRegistry().filter((agreement) => {
    if (normalized && agreement.workspaceKey !== normalized) {
      return false
    }

    return agreement.status === 'issued'
  })
}

function getRenewalCandidateAgreements(
  workspaceFilter: string | undefined,
  referenceDate: string,
): AgreementRecord[] {
  const normalized = workspaceFilter ? normalizeWorkspaceKey(workspaceFilter) : undefined
  const referenceTime = new Date(referenceDate).getTime()
  const renewalWindowEnd = new Date(referenceDate)
  renewalWindowEnd.setUTCDate(renewalWindowEnd.getUTCDate() + 21)
  const renewalWindowEndTime = renewalWindowEnd.getTime()

  return getAgreementRegistry().filter((agreement) => {
    if (normalized && agreement.workspaceKey !== normalized) {
      return false
    }

    if (agreement.status !== 'signed') {
      return false
    }

    const expiresAt = new Date(agreement.expiresAt).getTime()
    return expiresAt >= referenceTime && expiresAt <= renewalWindowEndTime
  })
}

export function buildCommercialAutomationJobs(
  workspaceKey = 'all',
  referenceDate = '2026-08-05T00:00:00.000Z',
): CommercialAutomationJob[] {
  const workspaceFilter = workspaceKey === 'all' ? undefined : normalizeWorkspaceKey(workspaceKey)
  const referenceTime = new Date(referenceDate).getTime()
  const jobs: CommercialAutomationJob[] = []

  for (const agreement of getFollowupCommercialAgreements(workspaceFilter)) {
    jobs.push(
      createJob({
        id: `${agreement.id}-followup`,
        workspaceKey: agreement.workspaceKey,
        kind: 'agreement_followup',
        channel: 'email',
        priority: 'high',
        title: `${agreement.agreementNumber} needs agreement follow-up`,
        description: `Agreement ${agreement.title} is issued and awaiting client completion.`,
        scheduledFor: referenceDate,
        targetReference: agreement.agreementNumber,
        tags: ['agreement', agreement.workspaceKey, agreement.status],
      }),
    )
  }

  for (const agreement of getRenewalCandidateAgreements(workspaceFilter, referenceDate)) {
    jobs.push(
      createJob({
        id: `${agreement.id}-renewal`,
        workspaceKey: agreement.workspaceKey,
        kind: 'renewal_nudge',
        channel: 'email',
        priority: 'low',
        title: `${agreement.agreementNumber} renewal nudge`,
        description: `Agreement ${agreement.title} is within the renewal window.`,
        scheduledFor: addDays(agreement.expiresAt, -7),
        targetReference: agreement.agreementNumber,
        tags: ['renewal', agreement.workspaceKey, agreement.status],
      }),
    )
  }

  for (const invoice of getOutstandingCommercialInvoices(workspaceFilter)) {
    const dueTime = new Date(invoice.dueDate).getTime()
    const daysToDue = Math.floor((dueTime - referenceTime) / (24 * 60 * 60 * 1000))

    if (dueTime < referenceTime || invoice.status === 'overdue') {
      jobs.push(
        createJob({
          id: `${invoice.id}-collections`,
          workspaceKey: invoice.workspaceKey,
          kind: 'collections_escalation',
          channel: 'call',
          priority: 'critical',
          title: `${invoice.invoiceNumber} collections escalation`,
          description: `Outstanding balance requires immediate collections action.`,
          scheduledFor: referenceDate,
          targetReference: invoice.invoiceNumber,
          amount: invoice.payment.balanceAmount,
          tags: ['collections', invoice.workspaceKey, invoice.status],
        }),
      )

      continue
    }

    jobs.push(
      createJob({
        id: `${invoice.id}-reminder`,
        workspaceKey: invoice.workspaceKey,
        kind: 'invoice_reminder',
        channel: daysToDue <= 3 ? 'whatsapp' : 'email',
        priority: daysToDue <= 3 ? 'high' : 'medium',
        title: `${invoice.invoiceNumber} invoice reminder`,
        description: `Invoice follow-up required for remaining balance.`,
        scheduledFor: referenceDate,
        targetReference: invoice.invoiceNumber,
        amount: invoice.payment.balanceAmount,
        tags: ['invoice', invoice.workspaceKey, invoice.status],
      }),
    )
  }

  return jobs.sort((left, right) => {
    if (left.scheduledFor === right.scheduledFor) {
      return left.id > right.id ? 1 : -1
    }

    return left.scheduledFor > right.scheduledFor ? -1 : 1
  })
}

export function getCommercialAutomationSummary(
  workspaceKey = 'all',
  referenceDate = '2026-08-05T00:00:00.000Z',
): CommercialAutomationSummary {
  const jobs = buildCommercialAutomationJobs(workspaceKey, referenceDate)
  const byKind = createKindCounter()
  const byPriority = createPriorityCounter()

  for (const job of jobs) {
    byKind[job.kind] += 1
    byPriority[job.priority] += 1
  }

  return {
    total: jobs.length,
    byKind,
    byPriority,
    workspaces: Array.from(new Set(jobs.map((job) => job.workspaceKey))),
  }
}