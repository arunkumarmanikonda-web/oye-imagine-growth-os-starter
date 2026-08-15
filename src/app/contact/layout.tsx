import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { buildMetadata } from '@/lib/seo/site'

export const metadata: Metadata = buildMetadata(
  '/contact',
  'Contact Oye !magine | Product, enterprise and managed growth',
  'Talk to Oye !magine about product onboarding, enterprise deployment, managed growth, white-label models, integrations or security review.'
)

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children
}
