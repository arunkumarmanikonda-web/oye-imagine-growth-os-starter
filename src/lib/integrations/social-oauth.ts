import crypto from 'node:crypto'
import type { ApiAccessContext } from '@/lib/auth/api-access'
import { resolveRuntimeProviderFields } from '@/lib/config-control/runtime-provider-config'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { encryptSecret, decryptSecret } from '@/lib/integrations/google'
import { resolveOperationalTarget } from '@/lib/integrations/operational-target'
import { connectSocialAccount } from '@/lib/integrations/social-accounts'
import { runProviderQa } from '@/lib/integrations/provider-qa'

type SocialOauthProvider = 'meta' | 'linkedin'

type SocialOauthState = {
  provider: SocialOauthProvider
  tenantId: string
  workspaceId: string | null
  subject: string
  iat: number
  exp: number
  nonce: string
}

type SelectionCandidate = {
  resourceId: string
  label: string
  secondary?: string | null
  metadata?: Record<string, unknown>
}

function b64(value: Buffer | string) {
  return Buffer.from(value).toString('base64url')
}

function stateSecret() {
  const raw = process.env.OYE_OAUTH_STATE_SECRET?.trim() || process.env.OYE_OAUTH_ENCRYPTION_KEY?.trim()
  if (!raw) throw new Error('oauth_state_secret_not_configured')
  return raw
}

function signState(payload: SocialOauthState) {
  const encoded = b64(JSON.stringify(payload))
  const signature = b64(crypto.createHmac('sha256', stateSecret()).update(encoded).digest())
  return `${encoded}.${signature}`
}

function verifyState(raw: string, provider: SocialOauthProvider) {
  const [encoded, signature] = raw.split('.')
  if (!encoded || !signature) throw new Error('oauth_state_invalid')
  const expected = b64(crypto.createHmac('sha256', stateSecret()).update(encoded).digest())
  const supplied = Buffer.from(signature)
  const calculated = Buffer.from(expected)
  if (supplied.length !== calculated.length || !crypto.timingSafeEqual(supplied, calculated)) throw new Error('oauth_state_invalid')
  const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as Partial<SocialOauthState>
  if (payload.provider !== provider || !payload.tenantId || !payload.subject || !payload.exp) throw new Error('oauth_state_invalid')
  if (Date.now() > Number(payload.exp)) throw new Error('oauth_state_expired')
  return payload as SocialOauthState
}

function splitScopes(value: string | undefined, fallback: string[]) {
  const scopes = String(value || '').split(/[\s,]+/).map(item => item.trim()).filter(Boolean)
  return scopes.length ? Array.from(new Set(scopes)) : fallback
}

async function metaConfig() {
  const resolution = await resolveRuntimeProviderFields({
    providerKey: 'meta_marketing',
    fieldKeys: ['META_APP_ID','META_APP_SECRET','META_OAUTH_REDIRECT_URI','META_GRAPH_API_VERSION','META_LOGIN_CONFIG_ID','META_OAUTH_SCOPES'],
  })
  const appId = resolution.values.META_APP_ID?.trim()
  const appSecret = resolution.values.META_APP_SECRET?.trim()
  const redirectUri = resolution.values.META_OAUTH_REDIRECT_URI?.trim()
  const apiVersion = resolution.values.META_GRAPH_API_VERSION?.trim()
  if (!appId || !appSecret || !redirectUri || !apiVersion) throw new Error('meta_oauth_not_configured')
  return {
    appId,
    appSecret,
    redirectUri,
    apiVersion,
    loginConfigId: resolution.values.META_LOGIN_CONFIG_ID?.trim() || null,
    scopes: splitScopes(resolution.values.META_OAUTH_SCOPES, ['pages_show_list','pages_read_engagement','pages_manage_posts','instagram_basic','instagram_content_publish']),
  }
}

async function linkedinConfig() {
  const resolution = await resolveRuntimeProviderFields({
    providerKey: 'linkedin_marketing',
    fieldKeys: ['LINKEDIN_CLIENT_ID','LINKEDIN_CLIENT_SECRET','LINKEDIN_OAUTH_REDIRECT_URI','LINKEDIN_API_VERSION','LINKEDIN_OAUTH_SCOPES'],
  })
  const clientId = resolution.values.LINKEDIN_CLIENT_ID?.trim()
  const clientSecret = resolution.values.LINKEDIN_CLIENT_SECRET?.trim()
  const redirectUri = resolution.values.LINKEDIN_OAUTH_REDIRECT_URI?.trim()
  const apiVersion = resolution.values.LINKEDIN_API_VERSION?.trim()
  if (!clientId || !clientSecret || !redirectUri || !apiVersion) throw new Error('linkedin_oauth_not_configured')
  return {
    clientId,
    clientSecret,
    redirectUri,
    apiVersion,
    scopes: splitScopes(resolution.values.LINKEDIN_OAUTH_SCOPES, ['openid','profile','email','w_organization_social','r_organization_admin']),
  }
}

export async function socialAuthorizationUrl(access: ApiAccessContext, provider: SocialOauthProvider, workspaceId?: string) {
  if (access.membership.role_key !== 'platform_owner') throw new Error('platform_owner_required')
  const target = await resolveOperationalTarget(access, workspaceId)
  const state = signState({ provider, tenantId: target.tenantId, workspaceId: target.workspaceId, subject: access.subject, iat: Date.now(), exp: Date.now() + 10 * 60_000, nonce: crypto.randomUUID() })
  if (provider === 'meta') {
    const config = await metaConfig()
    const url = new URL(`https://www.facebook.com/${config.apiVersion}/dialog/oauth`)
    url.searchParams.set('client_id', config.appId)
    url.searchParams.set('redirect_uri', config.redirectUri)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('state', state)
    if (config.loginConfigId) url.searchParams.set('config_id', config.loginConfigId)
    else url.searchParams.set('scope', config.scopes.join(','))
    return { provider, authorizationUrl: url.toString(), tenantId: target.tenantId, workspaceId: target.workspaceId }
  }
  const config = await linkedinConfig()
  const url = new URL('https://www.linkedin.com/oauth/v2/authorization')
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', config.clientId)
  url.searchParams.set('redirect_uri', config.redirectUri)
  url.searchParams.set('state', state)
  url.searchParams.set('scope', config.scopes.join(' '))
  return { provider, authorizationUrl: url.toString(), tenantId: target.tenantId, workspaceId: target.workspaceId }
}

async function metaExchange(code: string) {
  const config = await metaConfig()
  const tokenUrl = new URL(`https://graph.facebook.com/${config.apiVersion}/oauth/access_token`)
  tokenUrl.searchParams.set('client_id', config.appId)
  tokenUrl.searchParams.set('client_secret', config.appSecret)
  tokenUrl.searchParams.set('redirect_uri', config.redirectUri)
  tokenUrl.searchParams.set('code', code)
  const response = await fetch(tokenUrl)
  const payload: any = await response.json().catch(() => ({}))
  if (!response.ok || !payload.access_token) throw new Error(`meta_oauth_exchange_failed:${payload?.error?.code || response.status}`)
  const longUrl = new URL(`https://graph.facebook.com/${config.apiVersion}/oauth/access_token`)
  longUrl.searchParams.set('grant_type', 'fb_exchange_token')
  longUrl.searchParams.set('client_id', config.appId)
  longUrl.searchParams.set('client_secret', config.appSecret)
  longUrl.searchParams.set('fb_exchange_token', String(payload.access_token))
  const longResponse = await fetch(longUrl)
  const longPayload: any = await longResponse.json().catch(() => ({}))
  return {
    config,
    accessToken: longResponse.ok && longPayload.access_token ? String(longPayload.access_token) : String(payload.access_token),
    expiresIn: Number(longPayload.expires_in || payload.expires_in || 0) || null,
  }
}

async function metaGrantedScopes(accessToken: string, apiVersion: string) {
  const params = new URLSearchParams({ access_token: accessToken })
  const response = await fetch(`https://graph.facebook.com/${apiVersion}/me/permissions?${params.toString()}`)
  const payload: any = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(`meta_permission_discovery_failed:${payload?.error?.code || response.status}`)
  return Array.from(new Set((Array.isArray(payload.data) ? payload.data : [])
    .filter((row: any) => String(row.status || '').toLowerCase() === 'granted')
    .map((row: any) => String(row.permission || '').trim())
    .filter(Boolean))) as string[]
}

async function metaCandidates(accessToken: string, apiVersion: string) {
  const params = new URLSearchParams({ fields: 'id,name,access_token,instagram_business_account', limit: '100', access_token: accessToken })
  const response = await fetch(`https://graph.facebook.com/${apiVersion}/me/accounts?${params.toString()}`)
  const payload: any = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(`meta_page_discovery_failed:${payload?.error?.code || response.status}`)
  const secretPages: Array<{ pageId: string; pageName: string; pageAccessToken: string; instagramUserId: string | null }> = []
  const candidates: SelectionCandidate[] = []
  for (const page of Array.isArray(payload.data) ? payload.data : []) {
    const pageId = String(page.id || '').trim()
    const pageToken = String(page.access_token || '').trim()
    if (!pageId || !pageToken) continue
    const pageName = String(page.name || pageId)
    const instagramUserId = page.instagram_business_account?.id ? String(page.instagram_business_account.id) : null
    secretPages.push({ pageId, pageName, pageAccessToken: pageToken, instagramUserId })
    candidates.push({ resourceId: pageId, label: pageName, secondary: instagramUserId ? `Instagram ${instagramUserId}` : 'Facebook Page only', metadata: { instagramUserId } })
  }
  if (!candidates.length) throw new Error('meta_no_publishable_pages')
  return { candidates, secretPages }
}

async function linkedinExchange(code: string) {
  const config = await linkedinConfig()
  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, client_id: config.clientId, client_secret: config.clientSecret, redirect_uri: config.redirectUri }),
  })
  const payload: any = await response.json().catch(() => ({}))
  if (!response.ok || !payload.access_token) throw new Error(`linkedin_oauth_exchange_failed:${payload?.error || response.status}`)
  return { config, accessToken: String(payload.access_token), expiresIn: Number(payload.expires_in || 0) || null, scope: String(payload.scope || '') }
}

function linkedinHeaders(accessToken: string, apiVersion: string) {
  return { Authorization: `Bearer ${accessToken}`, 'Linkedin-Version': apiVersion, 'X-Restli-Protocol-Version': '2.0.0' }
}

async function linkedinCandidates(accessToken: string, apiVersion: string) {
  const headers = linkedinHeaders(accessToken, apiVersion)
  const [profileResponse, aclResponse] = await Promise.all([
    fetch('https://api.linkedin.com/v2/userinfo', { headers: { Authorization: `Bearer ${accessToken}` } }),
    fetch('https://api.linkedin.com/rest/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED&count=100', { headers }),
  ])
  const profile: any = await profileResponse.json().catch(() => ({}))
  const acls: any = await aclResponse.json().catch(() => ({}))
  if (!profileResponse.ok) throw new Error(`linkedin_profile_discovery_failed:${profileResponse.status}`)
  if (!aclResponse.ok) throw new Error(`linkedin_organization_discovery_failed:${acls?.status || aclResponse.status}`)
  const seen = new Set<string>()
  const candidates: SelectionCandidate[] = []
  for (const acl of Array.isArray(acls.elements) ? acls.elements : []) {
    const organizationUrn = String(acl.organization || '').trim()
    const roleAssignee = String(acl.roleAssignee || '').trim()
    if (!/^urn:li:organization:\d+$/.test(organizationUrn) || !/^urn:li:person:[A-Za-z0-9_-]+$/.test(roleAssignee) || seen.has(organizationUrn)) continue
    seen.add(organizationUrn)
    candidates.push({ resourceId: organizationUrn, label: organizationUrn, secondary: String(profile.name || profile.email || 'LinkedIn organisation') })
  }
  if (!candidates.length) throw new Error('linkedin_no_admin_organizations')
  return { candidates, profile: { name: profile.name || null, email: profile.email || null, sub: profile.sub || null } }
}

async function linkedinApprovedRoleAssignee(accessToken: string, apiVersion: string, organizationUrn: string) {
  const response = await fetch('https://api.linkedin.com/rest/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED&count=100', { headers: linkedinHeaders(accessToken, apiVersion) })
  const payload: any = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(`linkedin_organization_reverification_failed:${payload?.status || response.status}`)
  const match = (Array.isArray(payload.elements) ? payload.elements : []).find((acl: any) => String(acl.organization || '').trim() === organizationUrn && /^urn:li:person:[A-Za-z0-9_-]+$/.test(String(acl.roleAssignee || '').trim()))
  if (!match) throw new Error('linkedin_organization_admin_authority_revoked')
  return String(match.roleAssignee).trim()
}

async function createSelectionSession(input: { state: SocialOauthState; provider: SocialOauthProvider; encryptedPayload: Record<string, unknown>; candidates: SelectionCandidate[]; metadata: Record<string, unknown> }) {
  const admin = createSupabaseAdminClient()
  const expiresAt = new Date(Date.now() + 20 * 60_000).toISOString()
  const { data, error } = await admin.from('integration_oauth_selection_sessions').insert({
    tenant_id: input.state.tenantId,
    workspace_id: input.state.workspaceId,
    provider: input.provider,
    subject: input.state.subject,
    encrypted_secret: encryptSecret(JSON.stringify(input.encryptedPayload)),
    candidate_resources: input.candidates,
    metadata: input.metadata,
    status: 'pending',
    expires_at: expiresAt,
  }).select('session_id,provider,candidate_resources,expires_at').single()
  if (error) throw new Error(`oauth_selection_session_write_failed:${error.message}`)
  return data
}

export async function completeSocialOauthCallback(provider: SocialOauthProvider, input: { state: string; code: string }) {
  const state = verifyState(input.state, provider)
  if (provider === 'meta') {
    const exchange = await metaExchange(input.code)
    const [discovered, grantedScopes] = await Promise.all([
      metaCandidates(exchange.accessToken, exchange.config.apiVersion),
      metaGrantedScopes(exchange.accessToken, exchange.config.apiVersion),
    ])
    return createSelectionSession({
      state,
      provider,
      encryptedPayload: { userAccessToken: exchange.accessToken, pages: discovered.secretPages },
      candidates: discovered.candidates,
      metadata: { apiVersion: exchange.config.apiVersion, expiresIn: exchange.expiresIn, scopes: grantedScopes },
    })
  }
  const exchange = await linkedinExchange(input.code)
  const grantedScopes = splitScopes(exchange.scope, [])
  const discovered = await linkedinCandidates(exchange.accessToken, exchange.config.apiVersion)
  return createSelectionSession({
    state,
    provider,
    encryptedPayload: { accessToken: exchange.accessToken, scopes: grantedScopes },
    candidates: discovered.candidates,
    metadata: { apiVersion: exchange.config.apiVersion, expiresIn: exchange.expiresIn, profile: discovered.profile },
  })
}

async function loadSelectionSession(access: ApiAccessContext, sessionId: string) {
  if (access.membership.role_key !== 'platform_owner') throw new Error('platform_owner_required')
  const admin = createSupabaseAdminClient()
  const { data, error } = await admin.from('integration_oauth_selection_sessions').select('*').eq('session_id', sessionId).maybeSingle()
  if (error || !data) throw new Error('oauth_selection_session_not_found')
  if (data.subject !== access.subject) throw new Error('oauth_selection_subject_mismatch')
  if (data.status !== 'pending') throw new Error('oauth_selection_session_consumed')
  if (new Date(data.expires_at).getTime() < Date.now()) {
    await admin.from('integration_oauth_selection_sessions').update({ status: 'expired', updated_at: new Date().toISOString() }).eq('session_id', sessionId)
    throw new Error('oauth_selection_session_expired')
  }
  return data
}

export async function getSocialOauthSelection(access: ApiAccessContext, sessionId: string) {
  const session = await loadSelectionSession(access, sessionId)
  return { sessionId: session.session_id, provider: session.provider, candidates: session.candidate_resources || [], expiresAt: session.expires_at }
}

export async function chooseSocialOauthResource(access: ApiAccessContext, input: { sessionId: string; resourceId: string }) {
  const session = await loadSelectionSession(access, input.sessionId)
  const target = await resolveOperationalTarget(access, session.workspace_id || undefined)
  if (target.tenantId !== session.tenant_id) throw new Error('oauth_selection_target_mismatch')
  const candidates = Array.isArray(session.candidate_resources) ? session.candidate_resources : []
  if (!candidates.some((candidate: any) => String(candidate.resourceId) === input.resourceId)) throw new Error('oauth_selection_resource_invalid')
  const secret = JSON.parse(decryptSecret(session.encrypted_secret)) as any
  let result: any
  let qa: any
  if (session.provider === 'meta') {
    const page = Array.isArray(secret.pages) ? secret.pages.find((candidate: any) => String(candidate.pageId) === input.resourceId) : null
    if (!page?.pageAccessToken) throw new Error('oauth_selection_secret_missing')
    result = await connectSocialAccount(access, {
      provider: 'meta',
      workspaceId: session.workspace_id || undefined,
      accessToken: String(page.pageAccessToken),
      apiVersion: String(session.metadata?.apiVersion || ''),
      facebookPageId: String(page.pageId),
      instagramUserId: page.instagramUserId ? String(page.instagramUserId) : null,
      scopes: Array.isArray(session.metadata?.scopes) ? session.metadata.scopes.map(String) : [],
    })
    const facebookQa = await runProviderQa(access, { workspaceId: session.workspace_id || undefined, channel: 'facebook' })
    const instagramQa = page.instagramUserId
      ? await runProviderQa(access, { workspaceId: session.workspace_id || undefined, channel: 'instagram' })
      : null
    qa = { facebook: facebookQa, instagram: instagramQa }
  } else {
    if (!secret.accessToken) throw new Error('oauth_selection_secret_missing')
    const apiVersion = String(session.metadata?.apiVersion || '')
    const memberUrn = await linkedinApprovedRoleAssignee(String(secret.accessToken), apiVersion, input.resourceId)
    result = await connectSocialAccount(access, {
      provider: 'linkedin',
      workspaceId: session.workspace_id || undefined,
      accessToken: String(secret.accessToken),
      apiVersion,
      organizationUrn: input.resourceId,
      memberUrn,
      scopes: Array.isArray(secret.scopes) ? secret.scopes.map(String) : [],
    })
    qa = await runProviderQa(access, { workspaceId: session.workspace_id || undefined, channel: 'linkedin' })
  }
  const admin = createSupabaseAdminClient()
  await admin.from('integration_oauth_selection_sessions').update({ status: 'consumed', consumed_at: new Date().toISOString(), encrypted_secret: encryptSecret('consumed'), updated_at: new Date().toISOString() }).eq('session_id', session.session_id)
  return { ...result, qa }
}