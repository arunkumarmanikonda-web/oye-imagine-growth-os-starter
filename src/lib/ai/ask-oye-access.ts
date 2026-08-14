import 'server-only'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { loadPermissionSet, decidePermission } from '@/lib/auth/access-resolver'
import { membershipRequiresMfa, selectPrimaryMembership, type VerifiedMembership } from '@/lib/auth/verified-membership'

export class AskOyeAccessError extends Error {
  constructor(public status: 401 | 403 | 503, public code: string) {
    super(code)
  }
}

export async function requireAskOyeAccess() {
  const supabase = await createSupabaseServerClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
  const claims = claimsData?.claims as Record<string, unknown> | undefined
  const subject = claims?.sub
  if (claimsError || typeof subject !== 'string' || !subject) throw new AskOyeAccessError(401, 'unauthenticated')

  const appMetadata = claims?.app_metadata
  if (appMetadata && typeof appMetadata === 'object' && (appMetadata as Record<string, unknown>).must_change_password === true) {
    throw new AskOyeAccessError(403, 'password_change_required')
  }

  const { data: rows, error } = await supabase
    .from('core_tenant_memberships')
    .select('membership_id,tenant_id,user_id,role_key,brand_id,workspace_id,status,metadata')
    .eq('user_id', subject)
    .eq('status', 'active')
  if (error) throw new AskOyeAccessError(503, 'access_control_unavailable')
  const membership = selectPrimaryMembership((rows ?? []) as VerifiedMembership[])
  if (!membership) throw new AskOyeAccessError(403, 'access_denied')

  if (membershipRequiresMfa(membership)) {
    const { data: aal, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (aalError) throw new AskOyeAccessError(503, 'access_control_unavailable')
    if (aal.currentLevel !== 'aal2') throw new AskOyeAccessError(403, 'mfa_required')
  }

  const permissionSet = await loadPermissionSet({ supabase, subject, membership }).catch(() => {
    throw new AskOyeAccessError(503, 'access_control_unavailable')
  })
  const permission = decidePermission({ roleKey: membership.role_key, membership, permissionSet, permission: 'ai.search' })
  if (!permission.allowed) throw new AskOyeAccessError(403, 'access_denied')

  return {
    subject,
    email: typeof claims?.email === 'string' ? claims.email : null,
    membership,
    permissionSet,
  }
}
