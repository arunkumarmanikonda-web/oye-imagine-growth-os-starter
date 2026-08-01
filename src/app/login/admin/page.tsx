import type { Route } from 'next'
import Link from 'next/link'
import { getOperatorAccessExperience } from '@/lib/recovery/surface-composer'

type AdminLoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const experience = getOperatorAccessExperience()
  const params = (await searchParams) ?? {}
  const redirect = typeof params.redirect === 'string' ? params.redirect : '/admin'

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="text-sm uppercase tracking-[0.3em] text-cyan-300">{experience.eyebrow}</div>
        <h1 className="mt-5 text-5xl font-semibold leading-tight">{experience.title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{experience.body}</p>

        <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Redirect target</div>
          <div className="mt-3 text-sm text-slate-200">{redirect}</div>
          <div className="mt-6 text-sm leading-7 text-slate-300">
            Full operator session authentication and protected route enforcement are the next pass of Mega Batch A. This route now carries split access intent and redirect awareness.
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={redirect as Route} className="rounded-full border border-white/20 px-5 py-3 font-medium text-white">
              Continue to operator destination
            </Link>
            <Link href="/login" className="rounded-full px-5 py-3 font-medium text-cyan-300">
              Back to access hub
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}