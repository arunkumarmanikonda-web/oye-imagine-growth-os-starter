import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { buildMetadata } from '@/lib/seo/site'

export const metadata: Metadata = buildMetadata(
  '/contact',
  'Contact Oye !magine | Talk to the Growth OS team',
  'Talk to Oye !magine about plans, enterprise deployments, managed growth, white-label operations, integrations, security or specialist support.'
)

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children
}
