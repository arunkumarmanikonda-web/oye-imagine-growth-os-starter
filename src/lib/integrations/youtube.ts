import { promises as dns } from 'node:dns'
import net from 'node:net'
import type { ApiAccessContext } from '@/lib/auth/api-access'
import { googleAccessToken } from '@/lib/integrations/google'
import { resolveOperationalTarget } from '@/lib/integrations/operational-target'

export type YouTubePublishInput = {
  workspaceId?: string
  mediaUrl: string
  title: string
  description?: string
  privacyStatus?: 'private' | 'unlisted' | 'public'
  categoryId?: string
  madeForKids?: boolean
}

function required(value: unknown, code: string) {
  const result = String(value || '').trim()
  if (!result) throw new Error(code)
  return result
}

function privateIpv4(address: string) {
  const parts = address.split('.').map(Number)
  if (parts.length !== 4 || parts.some(part => !Number.isInteger(part))) return true
  const [a, b] = parts
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224
}

function privateIpv6(address: string) {
  const normalized = address.toLowerCase()
  return normalized === '::1' || normalized === '::' || normalized.startsWith('fc') || normalized.startsWith('fd') || normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')
}

async function assertPublicMediaUrl(raw: string) {
  const url = new URL(required(raw, 'youtube_media_url_required'))
  if (url.protocol !== 'https:') throw new Error('youtube_media_url_https_required')
  if (url.username || url.password) throw new Error('youtube_media_url_credentials_forbidden')
  const hostname = url.hostname.toLowerCase()
  if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local')) throw new Error('youtube_media_url_private_host')
  if (net.isIP(hostname)) {
    if ((net.isIPv4(hostname) && privateIpv4(hostname)) || (net.isIPv6(hostname) && privateIpv6(hostname))) throw new Error('youtube_media_url_private_host')
  } else {
    const addresses = await dns.lookup(hostname, { all: true, verbatim: true })
    if (!addresses.length) throw new Error('youtube_media_host_unresolved')
    for (const entry of addresses) {
      if ((entry.family === 4 && privateIpv4(entry.address)) || (entry.family === 6 && privateIpv6(entry.address))) throw new Error('youtube_media_url_private_host')
    }
  }
  return url
}

function maxMediaBytes() {
  const configured = Number(process.env.AUTONOMY_MAX_REMOTE_MEDIA_BYTES || 512 * 1024 * 1024)
  return Number.isFinite(configured) && configured > 0 ? Math.trunc(configured) : 512 * 1024 * 1024
}

async function sourceMedia(rawUrl: string) {
  const url = await assertPublicMediaUrl(rawUrl)
  const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(30_000) })
  const body = response.body
  if (!response.ok || !body) throw new Error(`youtube_media_fetch_failed:${response.status}`)
  const contentType = response.headers.get('content-type')?.split(';')[0]?.trim() || 'application/octet-stream'
  if (!contentType.startsWith('video/')) throw new Error(`youtube_media_content_type_invalid:${contentType}`)
  const declaredLength = Number(response.headers.get('content-length') || 0)
  if (declaredLength && (!Number.isSafeInteger(declaredLength) || declaredLength > maxMediaBytes())) throw new Error('youtube_media_too_large')
  return { body, contentType, declaredLength }
}

async function youtubeJson(url: string, accessToken: string) {
  const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
  const payload: any = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(`youtube_read_failed:${payload?.error?.code || response.status}`)
  return payload
}

export async function verifyYouTubePublishingConnection(access: ApiAccessContext, workspaceId?: string) {
  const target = await resolveOperationalTarget(access, workspaceId)
  const { accessToken, account } = await googleAccessToken(target.tenantId, target.workspaceId)
  const scopes = Array.isArray(account.scopes) ? account.scopes.map(String) : []
  if (!scopes.includes('https://www.googleapis.com/auth/youtube.upload')) throw new Error('youtube_upload_scope_missing')
  const channels: any = await youtubeJson('https://www.googleapis.com/youtube/v3/channels?part=id,snippet&mine=true', accessToken)
  const channel = Array.isArray(channels.items) ? channels.items[0] : null
  if (!channel?.id) throw new Error('youtube_channel_missing')
  return { target, accessToken, account, channelId: String(channel.id), channelTitle: String(channel.snippet?.title || '') }
}

export async function publishYouTubeVideo(access: ApiAccessContext, input: YouTubePublishInput) {
  const identity = await verifyYouTubePublishingConnection(access, input.workspaceId)
  const title = required(input.title, 'youtube_title_required')
  const privacyStatus = input.privacyStatus || 'private'
  const media = await sourceMedia(input.mediaUrl)
  const metadata = {
    snippet: {
      title,
      description: input.description?.trim() || '',
      ...(input.categoryId?.trim() ? { categoryId: input.categoryId.trim() } : {}),
    },
    status: {
      privacyStatus,
      selfDeclaredMadeForKids: input.madeForKids === true,
    },
  }
  const initHeaders: Record<string, string> = {
    Authorization: `Bearer ${identity.accessToken}`,
    'Content-Type': 'application/json; charset=UTF-8',
    'X-Upload-Content-Type': media.contentType,
  }
  if (media.declaredLength) initHeaders['X-Upload-Content-Length'] = String(media.declaredLength)
  const initiation = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
    method: 'POST',
    headers: initHeaders,
    body: JSON.stringify(metadata),
  })
  if (!initiation.ok) {
    await media.body.cancel().catch(() => undefined)
    const payload: any = await initiation.json().catch(() => ({}))
    throw new Error(`youtube_upload_init_failed:${payload?.error?.code || initiation.status}`)
  }
  const location = initiation.headers.get('location')?.trim()
  if (!location) {
    await media.body.cancel().catch(() => undefined)
    throw new Error('youtube_resumable_location_missing')
  }
  const uploadHeaders: Record<string, string> = { 'Content-Type': media.contentType }
  if (media.declaredLength) uploadHeaders['Content-Length'] = String(media.declaredLength)
  const uploadInit: RequestInit & { duplex: 'half' } = {
    method: 'PUT',
    headers: uploadHeaders,
    body: media.body,
    duplex: 'half',
  }
  const upload = await fetch(location, uploadInit)
  const uploaded: any = await upload.json().catch(() => ({}))
  if (!upload.ok || !uploaded?.id) throw new Error(`youtube_upload_failed:${uploaded?.error?.code || upload.status}`)
  const videoId = String(uploaded.id)
  const verification: any = await youtubeJson(`https://www.googleapis.com/youtube/v3/videos?part=id,snippet,status&id=${encodeURIComponent(videoId)}`, identity.accessToken)
  const video = Array.isArray(verification.items) ? verification.items[0] : null
  if (!video?.id || String(video.id) !== videoId) throw new Error('youtube_upload_verification_failed')
  const actualPrivacy = String(video.status?.privacyStatus || '')
  if (actualPrivacy !== privacyStatus) throw new Error(`youtube_privacy_verification_failed:${actualPrivacy || 'unknown'}`)
  return {
    provider: 'google',
    channel: 'youtube',
    accountId: identity.account.id,
    channelId: identity.channelId,
    resourceId: videoId,
    privacyStatus: actualPrivacy,
    published: video,
  }
}
