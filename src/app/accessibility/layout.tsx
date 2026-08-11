import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { buildMetadata } from '@/lib/seo/site'

export const metadata: Metadata = buildMetadata(
  '/accessibility',
  'Accessibility Statement | OYE Imagine',
  'Review the OYE Imagine accessibility statement, improvement commitments, support channels, and current public experience coverage.'
)

export default function AccessibilityLayout({ children }: { children: ReactNode }) {
  return children
}