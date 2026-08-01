import { NextResponse } from 'next/server'
import { getAdminCommercialInvoicingExperience } from '@/lib/recovery/commercial-invoicing-foundation'

export async function GET() {
  return NextResponse.json(getAdminCommercialInvoicingExperience())
}