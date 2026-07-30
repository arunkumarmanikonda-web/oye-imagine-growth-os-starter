import { getAgreementRegistry } from '../agreements/agreement-registry'
import { getClientFinanceWorkspace } from '../finance/client-finance'
import { getInvoiceRegistry } from '../invoicing/invoice-registry'
import { buildCommercialAutomationJobs } from './commercial-automation'
import type { CommercialHardeningCheck, CommercialHardeningSnapshot } from './commercial-types'

function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100
}

export function getCommercialWorkspaces(): string[] {
  return Array.from(new Set(getInvoiceRegistry().map((invoice) => invoice.workspaceKey)))
}

export function getCommercialHardeningSnapshot(
  referenceDate = '2026-08-05T00:00:00.000Z',
): CommercialHardeningSnapshot {
  const invoices = getInvoiceRegistry()
  const agreements = getAgreementRegistry()
  const jobs = buildCommercialAutomationJobs('all', referenceDate)
  const workspaces = getCommercialWorkspaces()

  const openCollectionInvoices = invoices.filter((invoice) =>
    ['issued', 'partially_paid', 'overdue'].includes(invoice.status) && invoice.payment.balanceAmount > 0,
  )

  const openCollectionsValue = roundCurrency(
    openCollectionInvoices.reduce((sum, invoice) => sum + invoice.payment.balanceAmount, 0),
  )

  const agreementInvoiceLinkagePassed = invoices
    .filter((invoice) => invoice.kind !== 'proforma_invoice')
    .every((invoice) => Boolean(invoice.sourceAgreementNumber))

  const gstCoveragePassed = invoices.every(
    (invoice) => Boolean(invoice.vendor.gstin) && invoice.gstBreakdown.totalTaxAmount >= 0,
  )

  const automationCoveragePassed = openCollectionInvoices.every((invoice) =>
    jobs.some((job) => job.targetReference === invoice.invoiceNumber),
  )

  const workspaceVisibilityPassed = workspaces.every((workspace) => {
    const financeWorkspace = getClientFinanceWorkspace(workspace, referenceDate)
    return financeWorkspace.summary.invoiceCount >= 1
  })

  const collectionsEscalationPassed = openCollectionInvoices
    .filter((invoice) => new Date(invoice.dueDate).getTime() < new Date(referenceDate).getTime())
    .every((invoice) =>
      jobs.some((job) => job.kind === 'collections_escalation' && job.targetReference === invoice.invoiceNumber),
    )

  const checks: CommercialHardeningCheck[] = [
    {
      id: 'agreement-invoice-linkage',
      title: 'Agreement ↔ invoice linkage',
      passed: agreementInvoiceLinkagePassed,
      detail: agreementInvoiceLinkagePassed
        ? 'All non-proforma invoices carry agreement linkage.'
        : 'One or more non-proforma invoices are missing agreement linkage.',
    },
    {
      id: 'gst-coverage',
      title: 'GST coverage',
      passed: gstCoveragePassed,
      detail: gstCoveragePassed
        ? 'Every invoice resolves a vendor GSTIN and GST breakdown.'
        : 'One or more invoices are missing GST coverage.',
    },
    {
      id: 'automation-coverage',
      title: 'Collections automation coverage',
      passed: automationCoveragePassed,
      detail: automationCoveragePassed
        ? 'Every open collection invoice has an automation job.'
        : 'Some open collection invoices have no automation jobs.',
    },
    {
      id: 'workspace-visibility',
      title: 'Client finance visibility',
      passed: workspaceVisibilityPassed,
      detail: workspaceVisibilityPassed
        ? 'Every billing workspace resolves a client finance snapshot.'
        : 'One or more workspaces fail client finance visibility checks.',
    },
    {
      id: 'collections-escalation',
      title: 'Overdue escalation hardening',
      passed: collectionsEscalationPassed,
      detail: collectionsEscalationPassed
        ? 'Overdue invoices route to collections escalation.'
        : 'Overdue invoices are not fully covered by critical escalation.',
    },
  ]

  const passedCount = checks.filter((check) => check.passed).length
  const readinessScore = Math.round((passedCount / checks.length) * 100)
  const atRiskWorkspaces = Array.from(
    new Set(
      jobs
        .filter((job) => job.priority === 'critical' || job.priority === 'high')
        .map((job) => job.workspaceKey),
    ),
  )

  return {
    referenceDate,
    totalAutomationJobs: jobs.length,
    criticalAutomationJobs: jobs.filter((job) => job.priority === 'critical').length,
    openCollectionsValue,
    workspacesCovered: workspaces,
    readinessScore,
    atRiskWorkspaces,
    checks,
  }
}