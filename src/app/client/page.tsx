import Link from 'next/link'
import { getClientAccessState } from '@/lib/client-auth'

export default async function ClientPage() {
  const accessState = await getClientAccessState()

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-sm uppercase tracking-[0.3em] text-cyan-300">Client workspace foundation</div>
        <h1 className="mt-5 text-5xl font-semibold leading-tight">Client dashboard route foundation</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
          This route establishes the protected client destination for reports, invoices, agreements and support visibility.
        </p>

        <section className="mt-12 grid gap-6 lg:grid-cols-3">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Authenticated</div>
            <div className="mt-3 text-3xl font-semibold">{accessState.isAuthenticated ? 'yes' : 'no'}</div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Client access</div>
            <div className="mt-3 text-3xl font-semibold">{accessState.isClient ? 'ready' : 'blocked'}</div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Post-login destination</div>
            <div className="mt-3 text-sm">{accessState.postLoginDestination}</div>
          </div>
        </section>

        <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/5 p-6 text-sm leading-7 text-slate-300">
          Route guard middleware is implemented behind the <code>ENABLE_BATCH_A_ROUTE_GUARDS</code> feature flag so the platform can adopt real session enforcement in the next pass without locking out the current rebuild branch prematurely.
        </div>

        <div className="mt-8">
          <Link href="/login/client" className="rounded-full border border-white/20 px-5 py-3 font-medium text-white">
            Back to client login
          </Link>
        </div>
      </div>
    </main>
  )
}