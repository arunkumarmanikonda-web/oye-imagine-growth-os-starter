import Link from 'next/link'

export default function TrustCenterPage() {
  return (
    <main className='oi-section'>
      <div className='oi-container' style={{ maxWidth: 1080 }}>
        <div className='oi-card'>
          <p className='text-xs font-semibold uppercase tracking-[0.3em] text-slate-400'>Trust Center</p>
          <h1 className='mt-3 text-4xl font-semibold text-white'>Governance, support, and public trust signals</h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-300'>
            The Trust Center gives enterprise teams a single place to review support identity, rollout posture,
            accessibility commitments, and the public standards behind OYE Imagine launch surfaces.
          </p>
          <p className='mt-4 text-sm leading-7 text-slate-300'>
            Teams usually pair this review with the <Link href='/platform' className='text-white underline underline-offset-4'>Platform</Link>,
            <Link href='/solutions' className='ml-1 text-white underline underline-offset-4'>Solutions</Link>,
            <Link href='/marketplace' className='ml-1 text-white underline underline-offset-4'>Marketplace</Link>,
            and <Link href='/pricing' className='ml-1 text-white underline underline-offset-4'>Pricing</Link> pages.
          </p>
        </div>
      </div>
    </main>
  )
}