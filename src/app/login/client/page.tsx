import Link from 'next/link'
import { getLoginSurfaceExperience } from '@/lib/recovery/surface-composer'

export default function ClientLoginPage() {
  const experience = getLoginSurfaceExperience('client')

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-950">
      <main className="mx-auto max-w-3xl space-y-8 px-6 py-10">
        <section className="rounded-[32px] border border-neutral-200 bg-white px-8 py-10 shadow-sm">
          <div className="space-y-4">
            <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">Client access</div>
            <h1 className="text-4xl font-semibold tracking-tight">{experience.title}</h1>
            <p className="text-base leading-7 text-neutral-600">{experience.summary}</p>
          </div>

          <form action={experience.formAction} method="post" className="mt-8 space-y-4">
            <input type="hidden" name="role" value={experience.hiddenRole} />
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-950"
                placeholder="client@brand.com"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="workspace" className="text-sm font-medium">Workspace</label>
              <input
                id="workspace"
                name="workspaceId"
                type="text"
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none transition focus:border-neutral-950"
                placeholder="workspace_neejee"
              />
            </div>
            <button type="submit" className="rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-medium text-white">
              Continue to client workspace
            </button>
          </form>

          <div className="mt-6 text-sm text-neutral-600">
            Need help? <a className="underline" href={`mailto:${experience.supportEmail}`}>{experience.supportEmail}</a>
          </div>
          <div className="mt-2 text-sm text-neutral-600">
            Looking for operator access? <Link href={experience.fallbackHref} className="underline">Go here</Link>
          </div>
        </section>
      </main>
    </div>
  )
}