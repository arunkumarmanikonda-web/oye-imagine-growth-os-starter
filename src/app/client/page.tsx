import { cookies } from 'next/headers'
import { buildRecoveryAuthSessionFromCookieStore } from '@/lib/recovery/auth-session-server'

export default async function ClientHomePage() {
  const cookieStore = await cookies()
  const session = buildRecoveryAuthSessionFromCookieStore(cookieStore)

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="space-y-2">
        <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Client dashboard foundation</div>
        <h1 className="text-2xl font-semibold text-neutral-950">Welcome back</h1>
        <p className="text-sm text-neutral-600">
          Authenticated client shell foundation for agreements, invoices, reports, support and AI concierge access.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ['Agreements', 'Structured agreement and scope access'],
          ['Invoices', 'Billing, overdue and tax invoice retrieval'],
          ['Reports', 'Reporting and performance access'],
          ['Support', 'Support, help and contact visibility'],
        ].map(([label, summary]) => (
          <div key={label} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-neutral-950">{label}</div>
            <div className="mt-2 text-sm text-neutral-600">{summary}</div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="text-xs uppercase tracking-wide text-neutral-500">Authenticated identity</div>
        <div className="mt-3 text-sm text-neutral-700">
          Session role: {session.role} · Email: {session.email}
        </div>
      </section>
    </div>
  )
}