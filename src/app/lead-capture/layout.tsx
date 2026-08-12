import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { buildMetadata } from '@/lib/seo/site'

export const metadata: Metadata = buildMetadata(
  '/lead-capture',
  'Lead Capture Experiences | OYE Imagine',
  'Launch higher-quality lead capture journeys with shared modules, better public presentation, and enterprise-ready qualification signals.'
)

export default function LeadCaptureLayout({ children }: { children: ReactNode }) {
  return children
}