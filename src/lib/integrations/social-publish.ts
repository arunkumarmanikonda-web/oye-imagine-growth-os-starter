import { resolveCapabilityProvider } from '@/lib/config-control/provider-vault'

export type SocialPublishInput = {
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

async function metaSecrets() {
  const provider = await resolveCapabilityProvider({ capabilityKey: 'social.publish', purpose: 'facebook', environment: 'production' })
  if (provider.providerKey !== 'meta_marketing') throw new Error('meta_provider_route_mismatch')
  return provider.secrets
}

async function verifyMetaIdentity(secrets: Record<string, string>) {
  const version = required(secrets.META_GRAPH_API_VERSION, 'meta_graph_api_version_missing')
  const token = required(secrets.META_PAGE_ACCESS_TOKEN, 'meta_page_access_token_missing')
  const pageId = required(secrets.META_FACEBOOK_PAGE_ID, 'meta_facebook_page_id_missing')
  const expectedIgId = required(secrets.META_INSTAGRAM_USER_ID, 'meta_instagram_user_id_missing')
  const query = new URLSearchParams({ fields: 'id,name,instagram_business_account', access_token: token })
  const page: any = await graphJson(`${graphUrl(version, pageId)}?${query.toString()}`)
  if (String(page.id || '') !== pageId) throw new Error('meta_page_identity_mismatch')
  const actualIgId = String(page.instagram_business_account?.id || '')
  if (!actualIgId || actualIgId !== expectedIgId) throw new Error('meta_instagram_identity_mismatch')
  return { version, token, pageId, igUserId: expectedIgId, pageName: String(page.name || '') }
}

export async function verifyMetaPublishingConnection() {
  return verifyMetaIdentity(await metaSecrets())
}

export async function publishFacebookPagePost(input: SocialPublishInput) {
  const identity = await verifyMetaPublishingConnection()
  const message = required(input.text, 'facebook_message_required')
  const body = new URLSearchParams({ message, access_token: identity.token })
  if (input.linkUrl?.trim()) body.set('link', input.linkUrl.trim())
  const created: any = await graphJson(graphUrl(identity.version, `${identity.pageId}/feed`), { method: 'POST', body })
  const postId = required(created.id, 'facebook_post_id_missing')
  const verify = new URLSearchParams({ fields: 'id,created_time,message,permalink_url', access_token: identity.token })
  const published: any = await graphJson(`${graphUrl(identity.version, postId)}?${verify.toString()}`)
  if (String(published.id || '') !== postId) throw new Error('facebook_post_verification_failed')
  return { provider: 'meta_marketing', channel: 'facebook', resourceId: postId, published }
}

async function instagramContainerStatus(identity: Awaited<ReturnType<typeof verifyMetaPublishingConnection>>, containerId: string) {
  const query = new URLSearchParams({ fields: 'id,status_code,status', access_token: identity.token })
  return graphJson(`${graphUrl(identity.version, containerId)}?${query.toString()}`)
}

async function waitForInstagramContainer(identity: Awaited<ReturnType<typeof verifyMetaPublishingConnection>>, containerId: string) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const status: any = await instagramContainerStatus(identity, containerId)
    const code = String(status.status_code || '').toUpperCase()
    if (code === 'FINISHED') return status
    if (['ERROR', 'EXPIRED'].includes(code)) throw new Error(`instagram_container_${code.toLowerCase()}`)
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  throw new Error('instagram_container_processing_timeout')
}

export async function publishInstagramContent(input: SocialPublishInput) {
  const identity = await verifyMetaPublishingConnection()
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
  return { provider: 'meta_marketing', channel: 'instagram', resourceId: mediaId, containerId, mediaType, published: media }
}

async function linkedinSecrets() {
  const provider = await resolveCapabilityProvider({ capabilityKey: 'social.publish', purpose: 'linkedin', environment: 'production' })
  if (provider.providerKey !== 'linkedin_marketing') throw new Error('linkedin_provider_route_mismatch')
  return provider.secrets
}

export async function verifyLinkedInPublishingConnection() {
  const secrets = await linkedinSecrets()
  const accessToken = required(secrets.LINKEDIN_ACCESS_TOKEN, 'linkedin_access_token_missing')
  const author = required(secrets.LINKEDIN_AUTHOR_URN, 'linkedin_author_urn_missing')
  const version = required(secrets.LINKEDIN_API_VERSION, 'linkedin_api_version_missing')
  if (!/^urn:li:organization:\d+$/.test(author)) throw new Error('linkedin_author_urn_invalid')
  if (!/^20\d{4}$/.test(version)) throw new Error('linkedin_api_version_invalid')
  return { accessToken, author, version }
}

export async function publishLinkedInOrganizationPost(input: SocialPublishInput) {
  const identity = await verifyLinkedInPublishingConnection()
  const commentary = required(input.text, 'linkedin_commentary_required')
  const body: Record<string, unknown> = {
    author: identity.author,
    commentary,
    visibility: 'PUBLIC',
    distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
  }
  if (input.linkUrl?.trim()) {
    body.content = { article: { source: input.linkUrl.trim(), title: input.title?.trim() || undefined } }
  }
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
  return { provider: 'linkedin_marketing', channel: 'linkedin', resourceId: postId, responseStatus: response.status }
}

export async function publishSocialContent(input: SocialPublishInput) {
  if (input.channel === 'facebook') return publishFacebookPagePost(input)
  if (input.channel === 'instagram') return publishInstagramContent(input)
  if (input.channel === 'linkedin') return publishLinkedInOrganizationPost(input)
  throw new Error('social_channel_unsupported')
}
