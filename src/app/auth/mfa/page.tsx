import Link from 'next/link'
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

  if (membershipError) redirect('/login/admin?error=access_control_unavailable')

  const membership = selectMembershipForLane((membershipRows ?? []) as VerifiedMembership[], 'admin')
  if (!membership || !membershipHasWorkspaceAuthority(membership)) redirect('/login/admin?error=access_denied')

  return (
    <main className="auth-premium-page">
      <section className="auth-premium-visual">
        <div className="auth-visual-content">
          <p className="premium-eyebrow">Privileged access</p>
          <h1>Second-factor verification is mandatory.</h1>
          <p>Password verification and operator membership are not sufficient for the admin plane. A verified AAL2 session is required before privileged routes or APIs are allowed.</p>
          <p className="auth-security-note" style={{color:'#aeb1aa'}}>The authenticator secret remains with Supabase Auth and the enrolled authenticator. Oye !magine does not persist the TOTP secret in application storage.</p>
        </div>
      </section>
      <section className="auth-premium-form-wrap">
        <div className="auth-premium-card">
          <Link href="/" className="auth-logo-link"><img src="/brand/oye-imagine-logo.webp" alt="Oye !magine" /></Link>
          <div className="auth-form-heading"><p>Identity assurance</p><h2>Verify privileged access</h2><span>Your second factor establishes the assurance level required for the administrative control plane.</span></div>
          <MfaGate redirectTo={destination} />
        </div>
      </section>
    </main>
  )
}
