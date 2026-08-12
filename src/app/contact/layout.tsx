import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { buildMetadata } from '@/lib/seo/site'

export const metadata: Metadata = buildMetadata(
  '/contact',
  'Contact OYE Imagine | Talk to the team',
  'Connect with OYE Imagine to plan enterprise-ready guided flows, qualification funnels, and governed public growth experiences.'
)

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children
}