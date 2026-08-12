import type { Metadata, Route } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy and compliance | Oye !magine AI Growth OS',
  description:
    'Review how Oye !magine handles data, access control, retention, support, and operational governance across the AI Growth OS.',
}

const collectionItems = [
  'Business and contact details shared during qualification, onboarding, support, billing, or commercial review.',
  'Workspace content and operating records needed to deliver execution, approvals, reporting, invoicing, and governed support.',
  'Technical usage and audit context required to secure access, investigate issues, and maintain reliable platform operations.',
]

const usageItems = [
  'Operate onboarding, delivery, approvals, reporting, billing, and support workflows.',
  'Maintain service continuity, role-aware access, and accountable operational records.',
  'Respond to legal, tax, governance, and buyer-review requirements tied to active commercial relationships.',
]

const controlItems = [
  'Role-aware access separation across public, client, and operator experiences.',
  'Operational need-to-know access instead of broad shared visibility.',
  'Governed publishing, support, and workflow handling with auditable runtime context.',
]

const retentionItems = [
  'We retain only the records needed for accountable service operation, support continuity, billing, governance, and legal obligations.',
  'Retention windows depend on the operational record type, active commercial relationship, and mandatory compliance requirements.',
  'When records are no longer required, they should be deleted, archived, or minimized according to the governing workflow.',
]

const requestItems = [
  'Ask what data category or workflow you want reviewed.',
  'Confirm the workspace, company, or commercial context tied to the request.',
  'Route the request through governed support so the correct operator or legal owner can respond.',
]

const reviewLinks = [
  { href: '/trust', label: 'Trust Center' },
  { href: '/accessibility', label: 'Accessibility' },
  { href: '/contact', label: 'Contact and support' },
  { href: '/platform', label: 'Platform' },
]

function SectionList({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-slate-900" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function PrivacyPage() {
  return (
    <main className="bg-white text-slate-950">
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-10 lg:py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
            Privacy and compliance center
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Privacy, access control, and operational governance for the AI Growth OS.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">
            This page explains how Oye !magine handles client, operator, prospect, support, and
            commercial data across qualification, onboarding, delivery, approvals, invoicing,
            reporting, and governed support workflows.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-sm font-semibold text-slate-900">Data minimization</div>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                Collect only what is needed for accountable onboarding, delivery, support, and
                commercial operations.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-sm font-semibold text-slate-900">Role-aware access</div>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                Access should be restricted by workspace, user role, and operational need instead
                of broad shared visibility.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-sm font-semibold text-slate-900">Governed retention</div>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                Records should remain available only as long as they are required for service,
                governance, legal, or billing accountability.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              What this page covers
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-700">
              Oye !magine positions trust, compliance, support, and legal identity as part of the
              runtime rather than a last-minute add-on. This privacy entry gives buyers and teams a
              single public reference point for data handling expectations before they convert,
              onboard, or request governed support.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-base font-semibold text-slate-950">Related review paths</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {reviewLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href as Route}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-950"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              For support-led requests, start from the contact route so the request can be handled
              in the correct commercial or workspace context.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 pb-16 sm:px-8 lg:grid-cols-2 lg:px-10">
        <div className="rounded-3xl border border-slate-200 p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            Data we may process
          </h2>
          <SectionList items={collectionItems} />
        </div>

        <div className="rounded-3xl border border-slate-200 p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            Why it is used
          </h2>
          <SectionList items={usageItems} />
        </div>

        <div className="rounded-3xl border border-slate-200 p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            Access and workspace controls
          </h2>
          <SectionList items={controlItems} />
        </div>

        <div className="rounded-3xl border border-slate-200 p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            Retention and deletion posture
          </h2>
          <SectionList items={retentionItems} />
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 sm:px-8 lg:grid-cols-2 lg:px-10">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Security and governance expectations
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-700">
              The public site already describes a governed operating model with client and operator
              separation, approval controls, legal identity, and support context. This page extends
              that same posture into a buyer-readable privacy and compliance reference.
            </p>
            <p className="mt-4 text-base leading-8 text-slate-700">
              Teams evaluating the platform should use this page together with the Trust Center,
              contact routes, and commercial workflows to understand how privacy responsibilities are
              handled in day-to-day operations.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8">
            <h3 className="text-lg font-semibold text-slate-950">Request handling</h3>
            <SectionList items={requestItems} />
            <p className="mt-6 text-sm leading-7 text-slate-600">
              Accessibility-related support can also be raised through{' '}
              <a className="font-medium text-slate-900 underline underline-offset-4" href="mailto:hello@oyeimagine.com">
                hello@oyeimagine.com
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            Buyer review checklist
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              'Public explanation of what data is collected and why',
              'Clear statement of role-aware access expectations',
              'Retention and accountable-record posture explained',
              'Trust, accessibility, contact, and platform review paths linked',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 p-5 text-sm leading-7 text-slate-700">
                {item}
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm leading-7 text-slate-600">Last reviewed: 2026-08-12</p>
        </div>
      </section>
    </main>
  )
}