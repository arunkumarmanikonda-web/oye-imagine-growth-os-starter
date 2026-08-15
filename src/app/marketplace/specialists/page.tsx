import type { Metadata } from 'next'
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo/site'

export const metadata: Metadata = buildMetadata(
  '/marketplace/specialists',
  'Marketplace Specialists | Oye !magine',
  'Learn how Oye !magine governs specialist discovery, scoped assignments, proposals, approvals and delivery inside the Growth OS.'
)

const specialistHighlights = [
  {
    title: 'Scoped specialist discovery',
    body: 'Specialist availability is presented only when the relevant service lane and onboarding state are ready for customer use.'
  },
  {
    title: 'Governed assignment',
    body: 'Requests, proposals and workspace access are designed to stay inside the customer scope, with explicit permissions and approval boundaries.'
  },
  {
    title: 'Evidence-led delivery',
    body: 'Deliverables, approvals and commercial records are intended to remain traceable instead of turning specialist work into an off-platform handoff.'
  }
]

export default function MarketplaceSpecialistsPage() {
  return (
    <main className='oi-section'>
      <div className='oi-container'>
        <div className='oi-card'>
          <p className='text-xs font-semibold uppercase tracking-[0.3em] text-slate-400'>Specialist marketplace</p>
          <h1 className='mt-3 text-4xl font-semibold text-white'>Human expertise, scoped by the same governance as the Growth OS.</h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-300'>
            Oye !magine is designed to route appropriate work to vetted specialists without exposing unrelated customer data or pretending that every service lane is automatically available. Specialist availability depends on onboarding, scope, commercial terms and the permissions assigned to the engagement.
          </p>
          <p className='mt-4 text-sm leading-7 text-slate-300'>
            Continue into the <Link href='/marketplace' className='text-white underline underline-offset-4'>Marketplace</Link>,
            <Link href='/platform' className='ml-1 text-white underline underline-offset-4'>Platform</Link>,
            <Link href='/pricing' className='ml-1 text-white underline underline-offset-4'>Pricing</Link>,
            or <Link href='/contact?interest=managed' className='ml-1 text-white underline underline-offset-4'>discuss a managed engagement</Link>.
          </p>
        </div>

        <div className='mt-8 grid gap-4 md:grid-cols-3'>
          {specialistHighlights.map((item) => (
            <div key={item.title} className='oi-card'>
              <h2 className='text-lg font-semibold text-white'>{item.title}</h2>
              <p className='mt-3 text-sm leading-7 text-slate-300'>{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
