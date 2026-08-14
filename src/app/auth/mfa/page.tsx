import { redirect } from 'next/navigation'
import MfaGate from './MfaGate'
import { createLoginRedirectPath } from '@/lib/auth/session'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  membershipHasWorkspaceAuthority,
  selectMembershipForLane,
  type VerifiedMembership,
} from '@/lib/auth/verified-membership'

type MfaPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function MfaPage({ searchParams }: MfaPageProps) {
  const params = (await searchParams) ?? {}
  const requested = typeof params.redirect === 'string' ? params.redirect : '/admin'
  const destination = createLoginRedirectPath('admin', requested)
  const supabase = await createSupabaseServerClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
  const subject = claimsData?.claims?.sub

  if (claimsError || typeof subject !== 'string' || !subject) {
    redirect(`/login/admin?error=unauthenticated&redirect=${encodeURIComponent(destination)}`)
  }

  const { data: membershipRows, error: membershipError } = await supabase
    .from('core_tenant_memberships')
    .select('membership_id,tenant_id,user_id,role_key,brand_id,workspace_id,status')
    .eq('user_id', subject)
    .eq('status', 'active')

  if (membershipError) {
    redirect('/login/admin?error=access_control_unavailable')
  }

  const membership = selectMembershipForLane(
    (membershipRows ?? []) as VerifiedMembership[],
    'admin',
  )

  if (!membership || !membershipHasWorkspaceAuthority(membership)) {
    redirect('/login/admin?error=access_denied')
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white md:px-10">
      <section className="mx-auto grid max-w-5xl gap-8 rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/30 p-8 lg:grid-cols-[1fr_0.95fr]">
        <article>
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Oye !magine privileged access</p>
          <h1 className="mt-4 text-4xl font-semibold">Second-factor verification is mandatory.</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
            Password verification and operator membership are not sufficient for the admin plane. A verified AAL2 session is required before privileged routes or APIs are allowed.
          </p>
          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/20 p-5 text-sm leading-7 text-slate-300">
            The authenticator secret remains with Supabase Auth and the enrolled authenticator. Oye !magine does not persist the TOTP secret in application storage.
          </div>
        </article>
        <MfaGate redirectTo={destination} />
      </section>
    </main>
  )
}
