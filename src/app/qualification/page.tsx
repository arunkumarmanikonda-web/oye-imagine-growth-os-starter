import { QualificationForm } from '@/components/public/qualification-form'

export default function QualificationPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <section className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">UI16 public form states</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">Qualification</h1>
        <p className="mt-4 max-w-2xl text-base text-slate-600">
          Shared empty, loading, error, and success states for the qualification flow.
        </p>
      </section>

      <QualificationForm />
    </main>
  )
}