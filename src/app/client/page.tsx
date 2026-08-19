import Link from 'next/link'
import { requireClientSurfaceContext } from '@/lib/client/client-surface-context'

export default async function ClientPage() {
  const context = await requireClientSurfaceContext('/client')
  const { identity, membership } = context

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-sm uppercase tracking-[0.3em] text-cyan-300">Client workspace</div>
        <h1 className="mt-5 text-5xl font-semibold leading-tight">{context.displayName}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
          This workspace is resolved from your verified Oye !magine membership. Tenant, brand and workspace identity are never selected from browser-supplied client names or demo fixtures.
        </p>

        <section className="mt-12 grid gap-6 lg:grid-cols-4">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Role</div>
            <div className="mt-3 text-sm">{membership.role_key}</div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Tenant</div>
            <div className="mt-3 break-all text-sm">{membership.tenant_id}</div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Workspace</div>
            <div className="mt-3 break-all text-sm">{membership.workspace_id}</div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Assurance</div>
            <div className="mt-3 text-sm">{identity.assuranceLevel.toUpperCase()}</div>
          </div>
        </section>

        <section className="mt-10 rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <div className="text-xs uppercase tracking-[0.25em] text-cyan-300">Data truth</div>
          <h2 className="mt-3 text-2xl font-semibold">{context.isDemo ? 'Authenticated demo workspace' : 'Verified production workspace'}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            {context.isDemo
              ? 'This account is explicitly marked as a demo account. Fixture-backed examples may appear on selected client surfaces and are labelled as demo data.'
              : 'Prototype invoices, agreements, support threads and commercial fixtures are disabled for this membership. Only verified workspace-scoped data may be presented as live state.'}
          </p>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/client/concierge" className="rounded-full bg-cyan-400 px-5 py-3 font-medium text-slate-950">Open concierge</Link>
          <Link href="/client/commercial/remittance" className="rounded-full border border-white/20 px-5 py-3 font-medium text-white">Media remittance</Link>
          <Link href="/support" className="rounded-full border border-white/20 px-5 py-3 font-medium text-white">Support</Link>
          <form action="/api/auth/logout" method="post">
            <button type="submit" className="rounded-full border border-white/20 px-5 py-3 font-medium text-white">Sign out</button>
          </form>
        </div>
      </div>
    </main>
  )
}
