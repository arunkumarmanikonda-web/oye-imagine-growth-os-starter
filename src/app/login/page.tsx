import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="mx-auto max-w-5xl space-y-8 py-10">
        <header className="space-y-3 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">Oye !magine</div>
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-950">Choose your secure entry</h1>
          <p className="mx-auto max-w-2xl text-sm text-neutral-600">
            Separate, premium authentication surfaces for clients and operators. No shared role confusion. No inert CTA flow.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <Link
            href="/login/client"
            className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm transition hover:border-neutral-400"
          >
            <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Client access</div>
            <h2 className="mt-3 text-2xl font-semibold text-neutral-950">Client login</h2>
            <p className="mt-3 text-sm text-neutral-600">
              Access agreements, invoices, reports, support and the AI-native client experience.
            </p>
            <div className="mt-6 text-sm font-medium text-neutral-950">Continue to client authentication</div>
          </Link>

          <Link
            href="/login/admin"
            className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm transition hover:border-neutral-400"
          >
            <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Operator access</div>
            <h2 className="mt-3 text-2xl font-semibold text-neutral-950">Admin / operator login</h2>
            <p className="mt-3 text-sm text-neutral-600">
              Access protected workspace control, content studio, config spine, pilot truth and operations surfaces.
            </p>
            <div className="mt-6 text-sm font-medium text-neutral-950">Continue to operator authentication</div>
          </Link>
        </section>
      </div>
    </div>
  )
}