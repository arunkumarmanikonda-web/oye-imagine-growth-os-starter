import Link from 'next/link'
import { getOperatorAccessExperience } from '@/lib/recovery/surface-composer'

export default function OperatorAccessPage() {
  const experience = getOperatorAccessExperience()

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="text-sm uppercase tracking-[0.3em] text-cyan-300">{experience.eyebrow}</div>
        <h1 className="mt-5 text-5xl font-semibold leading-tight">{experience.title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{experience.body}</p>

        <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <div className="text-sm text-slate-300">
            Operator route protection and full session-auth closure are the next pass inside Mega Batch A. This page exists now to establish a separate operator route and remove mixed-role ambiguity.
          </div>
          <div className="mt-6">
            <Link href="/admin" className="rounded-full border border-white/20 px-5 py-3 font-medium text-white">
              Continue to operator shell
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}