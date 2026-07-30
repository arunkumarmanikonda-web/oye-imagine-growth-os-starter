import { NextResponse } from 'next/server'
import { getInvoiceRegistry, getInvoiceRegistrySummary, getInvoiceSummaryCards } from '@/lib/invoicing/invoice-registry'

export async function GET() {
  return NextResponse.json({
    summary: getInvoiceRegistrySummary(),
    cards: getInvoiceSummaryCards(),
    invoices: getInvoiceRegistry(),
  })
}