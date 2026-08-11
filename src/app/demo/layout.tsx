import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { buildMetadata } from '@/lib/seo/site'

export const metadata: Metadata = buildMetadata(
  '/demo',
  'Book a Demo | OYE Imagine',
  'Explore how OYE Imagine powers guided demos, public conversion journeys, and enterprise growth experiences with governance built in.'
)

export default function DemoLayout({ children }: { children: ReactNode }) {
  return children
}