import { getClientLoginExperience } from '@/lib/recovery/auth-entry-foundation'
import { createLoginRedirectPath } from '@/lib/auth/session'
import { listWorkspacesForRole } from '@/lib/recovery/workspace-foundation'

type ClientLoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function ClientLoginPage({ searchParams }: ClientLoginPageProps) {
  const experience = getClientLoginExperience()
  const params = (await searchParams) ?? {}
  const redirectCandidate =
    typeof params.redirectTo === 'string'
      ? params.redirectTo
      : typeof params.redirect === 'string'
        ? params.redirect
        : '/client'
  const redirectTo = createLoginRedirectPath('client', redirectCandidate)
  const workspaces = listWorkspacesForRole('client')

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white md:px-10">
      <section className="mx-auto grid max-w-6xl gap-8 rounded-[2rem] border border-white/10 bg-white/5 p-8 lg:grid-cols-[1.05fr_0.95fr]">
        <article>
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{experience.eyebrow}</p>
          <h1 className="mt-4 text-4xl font-semibold">{experience.title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">{experience.body}</p>

          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
            <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Redirect target</div>
            <div className="mt-3 text-sm text-slate-200">{redirectTo}</div>
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
            <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Allowed destinations</div>
            <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-200">
              {experience.allowedRedirects.map((item) => (
                <span key={item} className="rounded-full border border-white/10 px-3 py-1">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </article>

        <form action="/api/auth/login" method="post" className="rounded-[1.5rem] border border-white/10 bg-black/20 p-6">
          <input type="hidden" name="lane" value="client" />
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Client workspace truth</div>

          <label className="mt-6 block text-sm text-slate-200">
            Email
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none"
              type="email"
              name="email"
              defaultValue="client@neejee.com"
              required
            />
          </label>

          <label className="mt-4 block text-sm text-slate-200">
            Display name
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none"
              type="text"
              name="displayName"
              defaultValue="Neejee Client"
              required
            />
          </label>

          <label className="mt-4 block text-sm text-slate-200">
            Workspace
            <select
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none"
              name="workspaceSlug"
              defaultValue="workspace_neejee_primary"
            >
              {workspaces.map((workspace) => (
                <option key={workspace.workspaceId} value={workspace.workspaceId}>
                  {workspace.brandName} — {workspace.domain}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="mt-6 w-full rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950"
          >
            Enter client workspace
          </button>
        </form>
      </section>
    </main>
  )
}
