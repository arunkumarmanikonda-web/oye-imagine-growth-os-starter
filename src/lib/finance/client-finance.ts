import { getAgreementRegistry } from '../agreements/agreement-registry'
import { toAgreementSummaryCard } from '../agreements/agreement-engine'
import { getInvoiceRegistry } from '../invoicing/invoice-registry'
import { toInvoiceSummaryCard } from '../invoicing/gst-engine'
import type { AgreementRecord } from '../agreements/agreement-types'
import type { GstMode, InvoiceRecord } from '../invoicing/invoice-types'
import type {
  ClientFinanceWorkspace,
  FinanceCollectionsAlert,
  FinanceTimelineItem,
  FinanceTimelineKind,
} from './finance-types'

function normalizeWorkspaceKey(workspaceKey: string): string {
  return workspaceKey.trim().toLowerCase()
}

function sortIsoDesc(left: string, right: string): number {
  if (left === right) {
    return 0
  }

  return left > right ? -1 : 1
}

function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100
}

function createTimelineItem(
  id: string,
  kind: FinanceTimelineKind,
  title: string,
  date: string,
  amount?: number,
  status?: string,
  reference?: string,
): FinanceTimelineItem {
  return {
    id,
    kind,
    title,
    date,
    amount,
    status,
    reference,
  }
}

export function getInvoicesForWorkspace(workspaceKey: string): InvoiceRecord[] {
  const workspace = normalizeWorkspaceKey(workspaceKey)

  return getInvoiceRegistry()
    .filter((invoice) => invoice.workspaceKey === workspace)
    .sort((left, right) => sortIsoDesc(left.issueDate, right.issueDate))
}

export function getAgreementsForWorkspace(workspaceKey: string): AgreementRecord[] {
  const workspace = normalizeWorkspaceKey(workspaceKey)

  return getAgreementRegistry()
    .filter((agreement) => agreement.workspaceKey === workspace)
    .sort((left, right) => sortIsoDesc(left.updatedAt, right.updatedAt))
}

export function buildPaymentTimeline(workspaceKey: string): FinanceTimelineItem[] {
  const invoices = getInvoicesForWorkspace(workspaceKey)
  const agreements = getAgreementsForWorkspace(workspaceKey)
  const timeline: FinanceTimelineItem[] = []

  for (const agreement of agreements) {
    if (agreement.status === 'issued') {
      timeline.push(
        createTimelineItem(
          `${agreement.id}-issued`,
          'agreement_issued',
          `${agreement.title} issued`,
          agreement.updatedAt,
          undefined,
          agreement.status,
          agreement.agreementNumber,
        ),
      )
    }

    if (agreement.status === 'signed') {
      timeline.push(
        createTimelineItem(
          `${agreement.id}-signed`,
          'agreement_signed',
          `${agreement.title} signed`,
          agreement.updatedAt,
          undefined,
          agreement.status,
          agreement.agreementNumber,
        ),
      )
    }
  }

  for (const invoice of invoices) {
    timeline.push(
      createTimelineItem(
        `${invoice.id}-issued`,
        'invoice_issued',
        `${invoice.title} issued`,
        invoice.issueDate,
        invoice.totalAmount,
        invoice.status,
        invoice.invoiceNumber,
      ),
    )

    timeline.push(
      createTimelineItem(
        `${invoice.id}-due`,
        'invoice_due',
        `${invoice.title} due`,
        invoice.dueDate,
        invoice.payment.balanceAmount,
        invoice.status,
        invoice.invoiceNumber,
      ),
    )

    if (invoice.payment.receivedAmount > 0 && invoice.payment.lastPaymentAt) {
      timeline.push(
        createTimelineItem(
          `${invoice.id}-payment`,
          'payment_received',
          `${invoice.title} payment received`,
          invoice.payment.lastPaymentAt,
          invoice.payment.receivedAmount,
          invoice.status,
          invoice.invoiceNumber,
        ),
      )
    }
  }

  return timeline.sort((left, right) => sortIsoDesc(left.date, right.date))
}

export function buildCollectionsAlerts(
  workspaceKey: string,
  referenceDate = '2026-08-01T00:00:00.000Z',
): FinanceCollectionsAlert[] {
  const invoices = getInvoicesForWorkspace(workspaceKey)
  const referenceTime = new Date(referenceDate).getTime()

  return invoices
    .filter((invoice) => ['issued', 'partially_paid', 'overdue'].includes(invoice.status) && invoice.payment.balanceAmount > 0)
    .map((invoice) => {
      const dueTime = new Date(invoice.dueDate).getTime()
      const daysToDue = Math.floor((dueTime - referenceTime) / (24 * 60 * 60 * 1000))

      if (invoice.status === 'overdue' || dueTime < referenceTime) {
        return {
          id: `${invoice.id}-critical`,
          severity: 'critical',
          title: `${invoice.invoiceNumber} overdue`,
          description: `Collection action required for ${invoice.billedTo.legalName}.`,
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.payment.balanceAmount,
          dueDate: invoice.dueDate,
        } satisfies FinanceCollectionsAlert
      }

      if (daysToDue <= 3) {
        return {
          id: `${invoice.id}-warning`,
          severity: 'warning',
          title: `${invoice.invoiceNumber} due soon`,
          description: `Balance follow-up required within ${daysToDue} day(s).`,
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.payment.balanceAmount,
          dueDate: invoice.dueDate,
        } satisfies FinanceCollectionsAlert
      }

      return {
        id: `${invoice.id}-info`,
        severity: 'info',
        title: `${invoice.invoiceNumber} collection in flight`,
        description: `Invoice remains open with an upcoming due date.`,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.payment.balanceAmount,
        dueDate: invoice.dueDate,
      } satisfies FinanceCollectionsAlert
    })
    .sort((left, right) => sortIsoDesc(left.dueDate, right.dueDate))
}

export function getClientFinanceWorkspace(
  workspaceKey = 'neejee',
  referenceDate = '2026-08-01T00:00:00.000Z',
): ClientFinanceWorkspace {
  const workspace = normalizeWorkspaceKey(workspaceKey)
  const invoices = getInvoicesForWorkspace(workspace)
  const agreements = getAgreementsForWorkspace(workspace)

  const invoiceCards = invoices.map(toInvoiceSummaryCard)
  const agreementCards = agreements.map(toAgreementSummaryCard)
  const totalInvoiced = roundCurrency(invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0))
  const totalReceived = roundCurrency(invoices.reduce((sum, invoice) => sum + invoice.payment.receivedAmount, 0))
  const outstandingAmount = roundCurrency(invoices.reduce((sum, invoice) => sum + invoice.payment.balanceAmount, 0))
  const gstModes = Array.from(new Set(invoices.map((invoice) => invoice.gstBreakdown.mode))) as GstMode[]

  const clientName =
    invoices[0]?.billedTo.legalName ??
    agreementCards[0]?.clientName ??
    workspace

  return {
    summary: {
      workspaceKey: workspace,
      clientName,
      currency: invoices[0]?.currency ?? 'INR',
      agreementCount: agreements.length,
      invoiceCount: invoices.length,
      totalInvoiced,
      totalReceived,
      outstandingAmount,
      draftInvoiceCount: invoices.filter((invoice) => invoice.status === 'draft').length,
      collectionOpenCount: invoices.filter((invoice) =>
        ['issued', 'partially_paid', 'overdue'].includes(invoice.status),
      ).length,
      paidInvoiceCount: invoices.filter((invoice) => invoice.status === 'paid').length,
    },
    invoices: invoiceCards,
    agreements: agreementCards,
    paymentTimeline: buildPaymentTimeline(workspace),
    collectionsAlerts: buildCollectionsAlerts(workspace, referenceDate),
    gstModes,
  }
}

export function clientFinanceWorkspaceHasBudgetGovernance(
  workspace: ClientFinanceWorkspace,
): boolean {
  return Boolean(
    workspace.summary.totalInvoiced >= 0 &&
    workspace.summary.outstandingAmount >= 0 &&
    workspace.summary.currency &&
    workspace.paymentTimeline.length >= 1
  );
}
