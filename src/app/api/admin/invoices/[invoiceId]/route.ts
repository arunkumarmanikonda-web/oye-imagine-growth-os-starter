import { NextRequest, NextResponse } from 'next/server'
import { applyInvoicePayment, getInvoiceReadiness, transitionInvoiceStatus } from '@/lib/invoicing/gst-engine'
import { findInvoiceById } from '@/lib/invoicing/invoice-registry'
import { INVOICE_STATUSES, type InvoiceStatus } from '@/lib/invoicing/invoice-types'

function isInvoiceStatus(value: string): value is InvoiceStatus {
  return INVOICE_STATUSES.includes(value as InvoiceStatus)
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> },
) {
  const invoice = findInvoiceById((await params).invoiceId)

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }

  return NextResponse.json({
    invoice,
    readiness: getInvoiceReadiness(invoice),
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> },
) {
  const existing = findInvoiceById((await params).invoiceId)

  if (!existing) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }

  const body = await request.json().catch(() => ({}))
  let nextInvoice = { ...existing }

  if (typeof body.title === 'string' && body.title.trim().length > 0) {
    nextInvoice.title = body.title.trim()
  }

  if (Array.isArray(body.notes)) {
    nextInvoice.notes = body.notes.filter((value: unknown): value is string => typeof value === 'string')
  }

  if (typeof body.status === 'string' && isInvoiceStatus(body.status) && body.status !== existing.status) {
    nextInvoice = transitionInvoiceStatus(
      nextInvoice,
      body.status,
      typeof body.actor === 'string' ? body.actor : 'finance@oyeimagine.com',
      typeof body.changedAt === 'string' ? body.changedAt : undefined,
    )
  }

  if (typeof body.paymentAmount === 'number' && Number.isFinite(body.paymentAmount) && body.paymentAmount > 0) {
    nextInvoice = applyInvoicePayment(
      nextInvoice,
      body.paymentAmount,
      typeof body.actor === 'string' ? body.actor : 'collections@oyeimagine.com',
      typeof body.changedAt === 'string' ? body.changedAt : undefined,
    )
  }

  return NextResponse.json({
    invoice: nextInvoice,
    readiness: getInvoiceReadiness(nextInvoice),
    persisted: false,
  })
}