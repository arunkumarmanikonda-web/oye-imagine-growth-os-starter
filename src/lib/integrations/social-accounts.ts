import type { ApiAccessContext } from '@/lib/auth/api-access'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { decryptSecret, encryptSecret } from '@/lib/integrations/google'
import { resolveOperationalTarget, type OperationalTarget } from '@/lib/integrations/operational-target'

export type SocialProvider = 'meta' | 'linkedin'
export type SocialChannel = 'facebook' | 'instagram' | 'linkedin'

type MetaConnectionInput = {
  provider: 'meta'
  workspaceId?: string
  accessToken: string
  apiVersion: string
  facebookPageId: string
  instagramUserId?: string | null
  scopes?: string[]
}

type LinkedInConnectionInput = {
  provider: 'linkedin'
  workspaceId?: string
  accessToken: string
  apiVersion: string
  organizationUrn: string
  memberUrn: string
  scopes?: string[]
}

export type SocialConnectionInput = MetaConnectionInput | LinkedInConnectionInput

function required(value: unknown, code: string) {
  const result = String(value || '').trim()
  if (!result) throw new Error(code)
  return result
}

function scopes(value: unknown) {
  return Array.isArray(value) ? Array.from(new Set(value.map(String).filter(Boolean))) : []
}

function assertPlatformOwner(access: ApiAccessContext) {
  if (access.membership.role_key !== 'platform_owner') throw new Error('platform_owner_required')
}

async function jsonResponse(url: string, init?: RequestInit, prefix = 'provider_verification_failed') {
  const response = await fetch(url, init)
  const payload: any = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(`${prefix}:${payload?.error?.code || payload?.status || response.status}`)
  return payload
}

function metaGraphUrl(version: string, path: string) {
  return `https://graph.facebook.com/${encodeURIComponent(version)}/${path.replace(/^\//, '')}`
}

async function verifyMeta(input: MetaConnectionInput) {
  const apiVersion = required(input.apiVersion, 'meta_graph_api_version_required')
  const token = required(input.accessToken, 'meta_access_token_required')
  const grantedScopes = scopes(input.scopes)
  if (!grantedScopes.includes('pages_manage_posts')) throw new Error('meta_pages_manage_posts_scope_missing')
  const pageId = required(input.facebookPageId, 'meta_facebook_page_id_required').replace(/\D/g, '')
  if (!pageId) throw new Error('meta_facebook_page_id_invalid')
  const query = new URLSearchParams({ fields: 'id,name,instagram_business_account', access_token: token })
  const page: any = await jsonResponse(`${metaGraphUrl(apiVersion, pageId)}?${query.toString()}`, undefined, 'meta_connection_verification_failed')
  if (String(page.id || '') !== pageId) throw new Error('meta_page_identity_mismatch')
  const linkedInstagramId = String(page.instagram_business_account?.id || '') || null
  const requestedInstagramId = input.instagramUserId?.trim() || null
  if (requestedInstagramId && linkedInstagramId !== requestedInstagramId) throw new Error('meta_instagram_identity_mismatch')
  const capabilities = ['facebook.publish']
  if (linkedInstagramId && grantedScopes.includes('instagram_basic') && grantedScopes.includes('instagram_content_publish')) capabilities.push('instagram.publish')
  return {
    externalAccountId: pageId,
    accountName: String(page.name || `Meta Page ${pageId}`),
    metadata: {
      apiVersion,
      facebookPageId: pageId,
      instagramUserId: requestedInstagramId || linkedInstagramId,
      verifiedCapabilities: capabilities,
      authoritySource: 'provider_granted_scopes_and_page_identity',
    },
  }
}

function linkedinHeaders(token: string, version: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Linkedin-Version': version,
    'X-Restli-Protocol-Version': '2.0.0',
  }
}

async function verifyLinkedIn(input: LinkedInConnectionInput) {
  const token = required(input.accessToken, 'linkedin_access_token_required')
  const version = required(input.apiVersion, 'linkedin_api_version_required')
  const organizationUrn = required(input.organizationUrn, 'linkedin_organization_urn_required')
  const memberUrn = required(input.memberUrn, 'linkedin_member_urn_required')
  const grantedScopes = scopes(input.scopes)
  if (!/^20\d{4}$/.test(version)) throw new Error('linkedin_api_version_invalid')
  if (!/^urn:li:organization:\d+$/.test(organizationUrn)) throw new Error('linkedin_organization_urn_invalid')
  if (!/^urn:li:person:[A-Za-z0-9_-]+$/.test(memberUrn)) throw new Error('linkedin_member_urn_invalid')
  if (!grantedScopes.includes('w_organization_social')) throw new Error('linkedin_w_organization_social_scope_missing')
  if (!grantedScopes.includes('r_organization_admin') && !grantedScopes.includes('rw_organization_admin')) throw new Error('linkedin_organization_admin_scope_missing')

  const acls: any = await jsonResponse(
    'https://api.linkedin.com/rest/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED&count=100',
    { headers: linkedinHeaders(token, version) },
    'linkedin_connection_verification_failed',
  )
  const approved = (Array.isArray(acls.elements) ? acls.elements : []).some((acl: any) =>
    String(acl.organization || '').trim() === organizationUrn && String(acl.roleAssignee || '').trim() === memberUrn,
  )
  if (!approved) throw new Error('linkedin_organization_publish_not_authorized')
  return {
    externalAccountId: organizationUrn,
    accountName: organizationUrn,
    metadata: {
      apiVersion: version,
      organizationUrn,
      memberUrn,
      verifiedCapabilities: ['linkedin.organization.publish'],
      authoritySource: 'approved_administrator_acl_and_granted_write_scope',
    },
  }
}

async function persistConnection(target: OperationalTarget, input: SocialConnectionInput, verified: { externalAccountId: string; accountName: string; metadata: Record<string, unknown> }, subject: string) {
  const admin = createSupabaseAdminClient()
  let query = admin.from('integration_accounts')
    .select('*')
    .eq('tenant_id', target.tenantId)
    .eq('provider', input.provider)
    .eq('external_account_id', verified.externalAccountId)
  if (target.workspaceId) query = query.eq('workspace_id', target.workspaceId)
  const { data: existing, error: existingError } = await query.order('created_at', { ascending: false }).limit(1).maybeSingle()
  if (existingError) throw new Error(`social_connection_read_failed:${existingError.message}`)
  const now = new Date().toISOString()
  const accountPayload = {
    tenant_id: target.tenantId,
    workspace_id: target.workspaceId,
    provider: input.provider,
    external_account_id: verified.externalAccountId,
    account_name: verified.accountName,
    status: 'connected',
    scopes: scopes(input.scopes),
    metadata: { ...verified.metadata, connectedBy: subject },
    last_verified_at: now,
    updated_at: now,
  }
  let account: any
  if (existing?.id) {
    const { data, error } = await admin.from('integration_accounts').update(accountPayload).eq('id', existing.id).select('*').single()
    if (error) throw new Error(`social_connection_write_failed:${error.message}`)
    account = data
  } else {
    const { data, error } = await admin.from('integration_accounts').insert(accountPayload).select('*').single()
    if (error) throw new Error(`social_connection_write_failed:${error.message}`)
    account = data
  }
  const { error: secretError } = await admin.from('integration_secret_material').upsert({
    account_id: account.id,
    secret_kind: 'oauth_access_token',
    encrypted_value: encryptSecret(input.accessToken),
    key_version: 1,
    updated_at: now,
  }, { onConflict: 'account_id,secret_kind' })
  if (secretError) throw new Error(`social_connection_secret_write_failed:${secretError.message}`)
  return account
}

export async function connectSocialAccount(access: ApiAccessContext, input: SocialConnectionInput) {
  assertPlatformOwner(access)
  const target = await resolveOperationalTarget(access, input.workspaceId)
  const verified = input.provider === 'meta' ? await verifyMeta(input) : await verifyLinkedIn(input)
  const account = await persistConnection(target, input, verified, access.subject)
  return { target, account: { ...account, secretConfigured: true } }
}

export async function resolveSocialPublishingConnection(target: OperationalTarget, channel: SocialChannel) {
  const provider: SocialProvider = channel === 'linkedin' ? 'linkedin' : 'meta'
  const admin = createSupabaseAdminClient()
  let query = admin.from('integration_accounts')
    .select('*')
    .eq('tenant_id', target.tenantId)
    .eq('provider', provider)
    .eq('status', 'connected')
  if (target.workspaceId) query = query.eq('workspace_id', target.workspaceId)
  const { data: accounts, error } = await query.order('last_verified_at', { ascending: false }).order('created_at', { ascending: false }).limit(20)
  if (error) throw new Error(`social_connection_read_failed:${error.message}`)
  const account: any = (accounts || []).find((row: any) => {
    const capabilities = Array.isArray(row.metadata?.verifiedCapabilities) ? row.metadata.verifiedCapabilities.map(String) : []
    return channel === 'facebook'
      ? capabilities.includes('facebook.publish')
      : channel === 'instagram'
        ? capabilities.includes('instagram.publish') && Boolean(row.metadata?.instagramUserId)
        : capabilities.includes('linkedin.organization.publish')
  })
  if (!account) throw new Error(`${provider}_connection_missing`)
  const { data: secret, error: secretError } = await admin.from('integration_secret_material')
    .select('encrypted_value')
    .eq('account_id', account.id)
    .eq('secret_kind', 'oauth_access_token')
    .maybeSingle()
  if (secretError || !secret?.encrypted_value) throw new Error(`${provider}_access_token_missing`)
  return { account, accessToken: decryptSecret(secret.encrypted_value) }
}

export async function listSocialConnectionStatus(access: ApiAccessContext, workspaceId?: string) {
  const target = await resolveOperationalTarget(access, workspaceId)
  const admin = createSupabaseAdminClient()
  let query = admin.from('integration_accounts')
    .select('id,provider,external_account_id,account_name,status,scopes,metadata,last_verified_at,created_at,updated_at')
    .eq('tenant_id', target.tenantId)
    .in('provider', ['meta', 'linkedin'])
  if (target.workspaceId) query = query.eq('workspace_id', target.workspaceId)
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw new Error(`social_connection_status_failed:${error.message}`)
  return { target, accounts: data || [] }
}