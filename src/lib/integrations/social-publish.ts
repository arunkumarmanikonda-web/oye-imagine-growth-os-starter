import type { ApiAccessContext } from '@/lib/auth/api-access'
import { resolveOperationalTarget } from '@/lib/integrations/operational-target'
import { resolveSocialPublishingConnection } from '@/lib/integrations/social-accounts'

export type SocialPublishInput = {
  workspaceId?: string
  channel: 'facebook' | 'instagram' | 'linkedin'
  text?: string
  mediaUrl?: string
  mediaType?: 'image' | 'reel' | 'story'
  linkUrl?: string
  title?: string
}

function required(value: unknown, code: string) {
  const result = String(value || '').trim()
  if (!result) throw new Error(code)
  return result
}

function graphUrl(version: string, path: string) {
  return `https://graph.facebook.com/${encodeURIComponent(version)}/${path.replace(/^\//, '')}`
}

async function graphJson(url: string, init?: RequestInit) {
  const response = await fetch(url, init)
  const payload: any = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(`meta_graph_request_failed:${payload?.error?.code || response.status}`)
  return payload
}

async function metaIdentity(access: ApiAccessContext, workspaceId: string | undefined, channel: 'facebook' | 'instagram') {
  const target = await resolveOperationalTarget(access, workspaceId)
  const { account, accessToken } = await resolveSocialPublishingConnection(target, channel)
  const version = required(account.metadata?.apiVersion, 'meta_graph_api_version_missing')
  const pageId = required(account.metadata?.facebookPageId, 'meta_facebook_page_id_missing')
  const expectedIgId = account.metadata?.instagramUserId ? String(account.metadata.instagramUserId) : null
  const query = new URLSearchParams({ fields: 'id,name,instagram_business_account', access_token: accessToken })
  const page: any = await graphJson(`${graphUrl(version, pageId)}?${query.toString()}`)
  if (String(page.id || '') !== pageId) throw new Error('meta_page_identity_mismatch')
  const actualIgId = String(page.instagram_business_account?.id || '') || null
  if (channel === 'instagram' && (!expectedIgId || actualIgId !== expectedIgId)) throw new Error('meta_instagram_identity_mismatch')
  return { target, account, version, token: accessToken, pageId, igUserId: expectedIgId, pageName: String(page.name || '') }
}

export async function verifyMetaPublishingConnection(access: ApiAccessContext, workspaceId: string | undefined, channel: 'facebook' | 'instagram') {
  const identity = await metaIdentity(access, workspaceId, channel)
  return { accountId: identity.account.id, pageId: identity.pageId, instagramUserId: identity.igUserId, pageName: identity.pageName, verifiedAt: new Date().toISOString() }
}

export async function publishFacebookPagePost(access: ApiAccessContext, input: SocialPublishInput & { channel: 'facebook' }) {
  const identity = await metaIdentity(access, input.workspaceId, 'facebook')
  const message = required(input.text, 'facebook_message_required')
  const body = new URLSearchParams({ message, access_token: identity.token })
  if (input.linkUrl?.trim()) body.set('link', input.linkUrl.trim())
  const created: any = await graphJson(graphUrl(identity.version, `${identity.pageId}/feed`), { method: 'POST', body })
  const postId = required(created.id, 'facebook_post_id_missing')
  const verify = new URLSearchParams({ fields: 'id,created_time,message,permalink_url', access_token: identity.token })
  const published: any = await graphJson(`${graphUrl(identity.version, postId)}?${verify.toString()}`)
  if (String(published.id || '') !== postId) throw new Error('facebook_post_verification_failed')
  return { provider: 'meta', accountId: identity.account.id, channel: 'facebook', resourceId: postId, published }
}

async function instagramContainerStatus(identity: Awaited<ReturnType<typeof metaIdentity>>, containerId: string) {
  const query = new URLSearchParams({ fields: 'id,status_code,status', access_token: identity.token })
  return graphJson(`${graphUrl(identity.version, containerId)}?${query.toString()}`)
}

async function waitForInstagramContainer(identity: Awaited<ReturnType<typeof metaIdentity>>, containerId: string) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const status: any = await instagramContainerStatus(identity, containerId)
    const code = String(status.status_code || '').toUpperCase()
    if (code === 'FINISHED') return status
    if (['ERROR', 'EXPIRED'].includes(code)) throw new Error(`instagram_container_${code.toLowerCase()}`)
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  throw new Error('instagram_container_processing_timeout')
}

export async function publishInstagramContent(access: ApiAccessContext, input: SocialPublishInput & { channel: 'instagram' }) {
  const identity = await metaIdentity(access, input.workspaceId, 'instagram')
  const mediaUrl = required(input.mediaUrl, 'instagram_media_url_required')
  const mediaType = input.mediaType || 'image'
  const form = new URLSearchParams({ access_token: identity.token })
  if (mediaType === 'image') form.set('image_url', mediaUrl)
  else {
    form.set('video_url', mediaUrl)
    form.set('media_type', mediaType === 'story' ? 'STORIES' : 'REELS')
  }
  if (input.text?.trim() && mediaType !== 'story') form.set('caption', input.text.trim())
  const created: any = await graphJson(graphUrl(identity.version, `${identity.igUserId}/media`), { method: 'POST', body: form })
  const containerId = required(created.id, 'instagram_container_id_missing')
  await waitForInstagramContainer(identity, containerId)
  const published: any = await graphJson(graphUrl(identity.version, `${identity.igUserId}/media_publish`), {
    method: 'POST',
    body: new URLSearchParams({ creation_id: containerId, access_token: identity.token }),
  })
  const mediaId = required(published.id, 'instagram_media_id_missing')
  const verify = new URLSearchParams({ fields: 'id,media_type,media_url,permalink,timestamp', access_token: identity.token })
  const media: any = await graphJson(`${graphUrl(identity.version, mediaId)}?${verify.toString()}`)
  if (String(media.id || '') !== mediaId) throw new Error('instagram_publish_verification_failed')
  return { provider: 'meta', accountId: identity.account.id, channel: 'instagram', resourceId: mediaId, containerId, mediaType, published: media }
}

async function linkedinIdentity(access: ApiAccessContext, workspaceId?: string) {
  const target = await resolveOperationalTarget(access, workspaceId)
  const { account, accessToken } = await resolveSocialPublishingConnection(target, 'linkedin')
  const author = required(account.metadata?.organizationUrn || account.external_account_id, 'linkedin_author_urn_missing')
  const version = required(account.metadata?.apiVersion, 'linkedin_api_version_missing')
  if (!/^urn:li:organization:\d+$/.test(author)) throw new Error('linkedin_author_urn_invalid')
  if (!/^20\d{4}$/.test(version)) throw new Error('linkedin_api_version_invalid')
  return { target, account, accessToken, author, version }
}

export async function verifyLinkedInPublishingConnection(access: ApiAccessContext, workspaceId?: string) {
  const identity = await linkedinIdentity(access, workspaceId)
  return { accountId: identity.account.id, organizationUrn: identity.author, verifiedAt: identity.account.last_verified_at || null }
}

export async function publishLinkedInOrganizationPost(access: ApiAccessContext, input: SocialPublishInput & { channel: 'linkedin' }) {
  const identity = await linkedinIdentity(access, input.workspaceId)
  const commentary = required(input.text, 'linkedin_commentary_required')
  const body: Record<string, unknown> = {
    author: identity.author,
    commentary,
    visibility: 'PUBLIC',
    distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
  }
  if (input.linkUrl?.trim()) body.content = { article: { source: input.linkUrl.trim(), title: input.title?.trim() || undefined } }
  const response = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${identity.accessToken}`,
      'Content-Type': 'application/json',
      'Linkedin-Version': identity.version,
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(body),
  })
  const payload: any = await response.json().catch(() => ({}))
  if (response.status !== 201) throw new Error(`linkedin_post_failed:${payload?.status || response.status}`)
  const postId = response.headers.get('x-restli-id')?.trim() || ''
  if (!postId) throw new Error('linkedin_post_id_missing')
  return { provider: 'linkedin', accountId: identity.account.id, channel: 'linkedin', resourceId: postId, responseStatus: response.status }
}

export async function publishSocialContent(access: ApiAccessContext, input: SocialPublishInput) {
  if (input.channel === 'facebook') return publishFacebookPagePost(access, { ...input, channel: 'facebook' })
  if (input.channel === 'instagram') return publishInstagramContent(access, { ...input, channel: 'instagram' })
  if (input.channel === 'linkedin') return publishLinkedInOrganizationPost(access, { ...input, channel: 'linkedin' })
  throw new Error('social_channel_unsupported')
}
