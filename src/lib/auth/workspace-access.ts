import 'server-only'

import type { Route } from 'next'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  membershipExperienceRoleKey,
  membershipRequiresMfa,
  selectMembershipForLane,
  selectPrimaryMembership,
  type VerifiedAccessLane,
  type VerifiedMembership,
} from '@/lib/auth/verified-membership'
import { getRoleExperience } from '@/lib/auth/role-routing'
import { loadPermissionSet, type ResolvedPermissionSet } from '@/lib/auth/access-resolver'

export type WorkspaceIdentity = {
  subject: string
  email: string | null
  membership: VerifiedMembership
  memberships: VerifiedMembership[]
  role: ReturnType<typeof getRoleExperience>
  assuranceLevel: 'aal1' | 'aal2'
  permissionSet: ResolvedPermissionSet
}

function mustChangePassword(claims: Record<string, unknown> | null | undefined) {
  const appMetadata = claims?.app_metadata
  return Boolean(appMetadata && typeof appMetadata === 'object' && (appMetadata as Record<string, unknown>).must_change_password === true)
}

export async function requireWorkspaceIdentity(input?: { lane?: VerifiedAccessLane; redirectTo?: string }): Promise<WorkspaceIdentity> {
  const supabase = await createSupabaseServerClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
  const claims = claimsData?.claims as Record<string, unknown> | undefined
  const subject = claims?.sub

  if (claimsError || typeof subject !== 'string' || !subject) {
    const path = input?.redirectTo ? `?next=${encodeURIComponent(input.redirectTo)}` : ''
    redirect(`/login${path}` as Route)
  }
  if (mustChangePassword(claims)) {
    const destination = input?.redirectTo || '/workspace'
    redirect(`/account/change-password?next=${encodeURIComponent(destination)}` as Route)
  }

  const { data: membershipRows, error: membershipError } = await supabase
    .from('core_tenant_memberships')
    .select('membership_id,tenant_id,user_id,role_key,brand_id,workspace_id,status,metadata')
    .eq('user_id', subject)
    .eq('status', 'active')
  if (membershipError) redirect('/login?error=access_control_unavailable' as Route)

  const memberships = (membershipRows ?? []) as VerifiedMembership[]
  const membership = input?.lane ? selectMembershipForLane(memberships, input.lane) : selectPrimaryMembership(memberships)
  if (!membership) redirect('/login?error=access_denied' as Route)

  const role = getRoleExperience(membershipExperienceRoleKey(membership))
  let assuranceLevel: 'aal1' | 'aal2' = 'aal1'
  if (membershipRequiresMfa(membership)) {
    const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (aalError) redirect('/login?error=access_control_unavailable' as Route)
    assuranceLevel = aalData.currentLevel === 'aal2' ? 'aal2' : 'aal1'
    if (assuranceLevel !== 'aal2') {
      const destination = input?.redirectTo || '/workspace'
      redirect(`/auth/mfa?redirect=${encodeURIComponent(destination)}` as Route)
    }
  }

  let permissionSet: ResolvedPermissionSet
  try { permissionSet = await loadPermissionSet({ supabase, subject, membership }) }
  catch { redirect('/login?error=access_control_unavailable' as Route) }

  const emailClaim = claims?.email
  return {
    subject,
    email: typeof emailClaim === 'string' ? emailClaim : null,
    membership,
    memberships,
    role,
    assuranceLevel,
    permissionSet,
  }
}
