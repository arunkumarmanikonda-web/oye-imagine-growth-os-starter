import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { buildMetadata } from '@/lib/seo/site'

export const metadata: Metadata = buildMetadata(
  '/qualification',
  'Qualification Flows | OYE Imagine',
  'See how OYE Imagine supports enterprise qualification workflows with clear branching, stronger intent capture, and governed handoff.'
)

export default function QualificationLayout({ children }: { children: ReactNode }) {
  return children
}