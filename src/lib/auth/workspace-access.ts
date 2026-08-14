import 'server-only'

import type { Route } from 'next'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  selectMembershipForLane,
  selectPrimaryMembership,
  type VerifiedAccessLane,
  type VerifiedMembership,
} from '@/lib/auth/verified-membership'
import { getRoleExperience, roleRequiresMfa } from '@/lib/auth/role-routing'

export type WorkspaceIdentity = {
  subject: string
  email: string | null
  membership: VerifiedMembership
  memberships: VerifiedMembership[]
  role: ReturnType<typeof getRoleExperience>
  assuranceLevel: 'aal1' | 'aal2'
}

export async function requireWorkspaceIdentity(input?: {
  lane?: VerifiedAccessLane
  redirectTo?: string
}): Promise<WorkspaceIdentity> {
  const supabase = await createSupabaseServerClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
  const subject = claimsData?.claims?.sub

  if (claimsError || typeof subject !== 'string' || !subject) {
    const path = input?.redirectTo ? `?next=${encodeURIComponent(input.redirectTo)}` : ''
    redirect(`/login${path}` as Route)
  }

  const { data: membershipRows, error: membershipError } = await supabase
    .from('core_tenant_memberships')
    .select('membership_id,tenant_id,user_id,role_key,brand_id,workspace_id,status,metadata')
    .eq('user_id', subject)
    .eq('status', 'active')

  if (membershipError) {
    redirect('/login?error=access_control_unavailable' as Route)
  }

  const memberships = (membershipRows ?? []) as VerifiedMembership[]
  const membership = input?.lane
    ? selectMembershipForLane(memberships, input.lane)
    : selectPrimaryMembership(memberships)

  if (!membership) {
    redirect('/login?error=access_denied' as Route)
  }

  const role = getRoleExperience(membership.role_key)
  let assuranceLevel: 'aal1' | 'aal2' = 'aal1'

  if (roleRequiresMfa(membership.role_key)) {
    const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (aalError) redirect('/login?error=access_control_unavailable' as Route)
    assuranceLevel = aalData.currentLevel === 'aal2' ? 'aal2' : 'aal1'
    if (assuranceLevel !== 'aal2') {
      const destination = input?.redirectTo || '/workspace'
      redirect(`/auth/mfa?redirect=${encodeURIComponent(destination)}` as Route)
    }
  }

  const emailClaim = claimsData?.claims?.email
  return {
    subject,
    email: typeof emailClaim === 'string' ? emailClaim : null,
    membership,
    memberships,
    role,
    assuranceLevel,
  }
}
