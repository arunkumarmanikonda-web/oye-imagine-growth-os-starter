import crypto from 'node:crypto'
import type { ApiAccessContext } from '@/lib/auth/api-access'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { resolveOperationalTarget } from '@/lib/integrations/operational-target'

const googleScopes = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/adwords',
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.upload',
]

type GoogleOAuthState = {
  tenantId: string
  workspaceId: string | null
  subject: string
  iat: number
  exp: number
  nonce: string
}

function required(name: string) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name.toLowerCase()}_not_configured`)
  return value
}

function keyMaterial() {
  const raw = required('OYE_OAUTH_ENCRYPTION_KEY')
  const decoded = /^[0-9a-f]{64}$/i.test(raw) ? Buffer.from(raw, 'hex') : Buffer.from(raw, 'base64')
  if (decoded.length !== 32) throw new Error('oauth_encryption_key_invalid')
  return decoded
}

function stateSecret() {
  return process.env.OYE_OAUTH_STATE_SECRET?.trim() || required('OYE_OAUTH_ENCRYPTION_KEY')
}

function b64(value: Buffer | string) {
  return Buffer.from(value).toString('base64url')
}

export function encryptSecret(value: string) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', keyMaterial(), iv)
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `v1.${b64(iv)}.${b64(tag)}.${b64(ciphertext)}`
}

export function decryptSecret(value: string) {
  const [version, ivText, tagText, cipherText] = value.split('.')
  if (version !== 'v1' || !ivText || !tagText || !cipherText) throw new Error('encrypted_secret_invalid')
  const decipher = crypto.createDecipheriv('aes-256-gcm', keyMaterial(), Buffer.from(ivText, 'base64url'))
  decipher.setAuthTag(Buffer.from(tagText, 'base64url'))
  return Buffer.concat([decipher.update(Buffer.from(cipherText, 'base64url')), decipher.final()]).toString('utf8')
}

function signGoogleOAuthState(payload: GoogleOAuthState) {
  const encoded = b64(JSON.stringify(payload))
  const sig = b64(crypto.createHmac('sha256', stateSecret()).update(encoded).digest())
  return `${encoded}.${sig}`
}

export function verifyGoogleOAuthState(state: string) {
  const [encoded, sig] = state.split('.')
  if (!encoded || !sig) throw new Error('oauth_state_invalid')
  const expected = b64(crypto.createHmac('sha256', stateSecret()).update(encoded).digest())
  const suppliedBuffer = Buffer.from(sig)
  const expectedBuffer = Buffer.from(expected)
  if (suppliedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(suppliedBuffer, expectedBuffer)) {
    throw new Error('oauth_state_invalid')
  }
  const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as Partial<GoogleOAuthState>
  if (!payload.tenantId || !payload.subject || !payload.exp || Date.now() > Number(payload.exp)) throw new Error('oauth_state_expired')
  return payload as GoogleOAuthState
}

function redirectUri() {
  return process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim() || `${(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.oyeimagine.com').replace(/\/$/, '')}/api/public/integrations/google/callback`
}

export async function googleAuthorizationUrl(access: ApiAccessContext, requestedWorkspaceId?: string) {
  const target = await resolveOperationalTarget(access, requestedWorkspaceId)
  const payload: GoogleOAuthState = {
    tenantId: target.tenantId,
    workspaceId: target.workspaceId,
    subject: access.subject,
    iat: Date.now(),
    exp: Date.now() + 10 * 60_000,
    nonce: crypto.randomUUID(),
  }
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id', required('GOOGLE_CLIENT_ID'))
  url.searchParams.set('redirect_uri', redirectUri())
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('access_type', 'offline')
  url.searchParams.set('prompt', 'consent')
  url.searchParams.set('include_granted_scopes', 'true')
  url.searchParams.set('scope', googleScopes.join(' '))
  url.searchParams.set('state', signGoogleOAuthState(payload))
  return { authorizationUrl: url.toString(), tenantId: target.tenantId, workspaceId: target.workspaceId }
}

async function exchangeCode(code: string) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: required('GOOGLE_CLIENT_ID'),
      client_secret: required('GOOGLE_CLIENT_SECRET'),
      redirect_uri: redirectUri(),
      grant_type: 'authorization_code',
    }),
  })
  const payload: any = await response.json().catch(() => ({}))
  if (!response.ok || !payload.access_token) throw new Error(`google_oauth_exchange_failed:${payload?.error || response.status}`)
  return payload
}

async function userInfo(accessToken: string) {
  const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { Authorization: `Bearer ${accessToken}` } })
  return response.ok ? await response.json() : {}
}

export async function persistGoogleConnection(input: { state: string; code: string }) {
  const state = verifyGoogleOAuthState(input.state)
  const tokens = await exchangeCode(input.code)
  if (!tokens.refresh_token) throw new Error('google_refresh_token_missing')
  const user: any = await userInfo(tokens.access_token)
  const admin = createSupabaseAdminClient()
  let existingQuery = admin.from('integration_accounts').select('*').eq('tenant_id', state.tenantId).eq('provider', 'google')
  if (state.workspaceId) existingQuery = existingQuery.eq('workspace_id', state.workspaceId)
  const { data: existing } = await existingQuery.order('created_at', { ascending: false }).limit(1).maybeSingle()
  const payload = {
    tenant_id: state.tenantId,
    workspace_id: state.workspaceId,
    provider: 'google',
    external_account_id: String(user.sub || user.email || 'google-account'),
    account_name: String(user.email || 'Google account'),
    status: 'connected',
    scopes: String(tokens.scope || '').split(' ').filter(Boolean),
    metadata: {
      email: user.email || null,
      displayName: user.name || null,
      tokenExpiresAt: new Date(Date.now() + Number(tokens.expires_in || 3600) * 1000).toISOString(),
      connectedBy: state.subject,
    },
    last_verified_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  let account: any
  if (existing?.id) {
    const { data, error } = await admin.from('integration_accounts').update(payload).eq('id', existing.id).select('*').single()
    if (error) throw new Error(`google_connection_write_failed:${error.message}`)
    account = data
  } else {
    const { data, error } = await admin.from('integration_accounts').insert(payload).select('*').single()
    if (error) throw new Error(`google_connection_write_failed:${error.message}`)
    account = data
  }
  const encrypted = encryptSecret(tokens.refresh_token)
  const { error: secretError } = await admin.from('integration_secret_material').upsert({
    account_id: account.id,
    secret_kind: 'oauth_refresh_token',
    encrypted_value: encrypted,
    key_version: 1,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'account_id,secret_kind' })
  if (secretError) throw new Error(`google_secret_write_failed:${secretError.message}`)
  return account
}

export async function googleAccessToken(tenantId: string, workspaceId?: string | null) {
  const admin = createSupabaseAdminClient()
  let query = admin.from('integration_accounts').select('*').eq('tenant_id', tenantId).eq('provider', 'google').eq('status', 'connected')
  if (workspaceId) query = query.eq('workspace_id', workspaceId)
  const { data: account, error } = await query.order('created_at', { ascending: false }).limit(1).maybeSingle()
  if (error || !account) throw new Error('google_connection_missing')
  const { data: secret, error: secretError } = await admin.from('integration_secret_material').select('encrypted_value').eq('account_id', account.id).eq('secret_kind', 'oauth_refresh_token').maybeSingle()
  if (secretError || !secret?.encrypted_value) throw new Error('google_refresh_token_missing')
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: required('GOOGLE_CLIENT_ID'),
      client_secret: required('GOOGLE_CLIENT_SECRET'),
      refresh_token: decryptSecret(secret.encrypted_value),
      grant_type: 'refresh_token',
    }),
  })
  const payload: any = await response.json().catch(() => ({}))
  if (!response.ok || !payload.access_token) {
    await admin.from('integration_accounts').update({
      status: 'error',
      metadata: { ...(account.metadata || {}), lastAuthError: String(payload?.error || response.status) },
      updated_at: new Date().toISOString(),
    }).eq('id', account.id)
    throw new Error(`google_token_refresh_failed:${payload?.error || response.status}`)
  }
  await admin.from('integration_accounts').update({
    status: 'connected',
    last_verified_at: new Date().toISOString(),
    metadata: { ...(account.metadata || {}), tokenExpiresAt: new Date(Date.now() + Number(payload.expires_in || 3600) * 1000).toISOString() },
    updated_at: new Date().toISOString(),
  }).eq('id', account.id)
  return { accessToken: String(payload.access_token), account }
}

export async function discoverGoogleResources(tenantId: string, workspaceId?: string | null) {
  const { accessToken, account } = await googleAccessToken(tenantId, workspaceId)
  const headers = { Authorization: `Bearer ${accessToken}` }
  const adsVersion = process.env.GOOGLE_ADS_API_VERSION || 'v25'
  const adsHeaders: Record<string, string> = { ...headers, 'developer-token': required('GOOGLE_ADS_DEVELOPER_TOKEN') }
  const [ads, analytics, search, youtube] = await Promise.allSettled([
    fetch(`https://googleads.googleapis.com/${adsVersion}/customers:listAccessibleCustomers`, { headers: adsHeaders }).then(async r => ({ ok: r.ok, status: r.status, data: await r.json().catch(() => ({})) })),
    fetch('https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200', { headers }).then(async r => ({ ok: r.ok, status: r.status, data: await r.json().catch(() => ({})) })),
    fetch('https://www.googleapis.com/webmasters/v3/sites', { headers }).then(async r => ({ ok: r.ok, status: r.status, data: await r.json().catch(() => ({})) })),
    fetch('https://www.googleapis.com/youtube/v3/channels?part=id,snippet&mine=true', { headers }).then(async r => ({ ok: r.ok, status: r.status, data: await r.json().catch(() => ({})) })),
  ])
  const value = (r: PromiseSettledResult<any>) => r.status === 'fulfilled' ? r.value : { ok: false, status: 0, data: { error: 'request_failed' } }
  const result = { googleAds: value(ads), ga4: value(analytics), searchConsole: value(search), youtube: value(youtube) }
  const youtubeItems = result.youtube.ok && Array.isArray(result.youtube.data?.items) ? result.youtube.data.items : []
  const youtubeChannel = youtubeItems[0] || null
  const admin = createSupabaseAdminClient()
  await admin.from('integration_accounts').update({
    metadata: {
      ...(account.metadata || {}),
      discovery: {
        checkedAt: new Date().toISOString(),
        googleAdsOk: result.googleAds.ok,
        ga4Ok: result.ga4.ok,
        searchConsoleOk: result.searchConsole.ok,
        youtubeOk: result.youtube.ok && Boolean(youtubeChannel?.id),
        youtubeChannelId: youtubeChannel?.id || null,
        youtubeChannelTitle: youtubeChannel?.snippet?.title || null,
      },
    },
    last_verified_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('id', account.id)
  return { accountId: account.id, ...result, youtubeChannel }
}
