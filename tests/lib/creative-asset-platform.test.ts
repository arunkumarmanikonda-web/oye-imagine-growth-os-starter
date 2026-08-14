import { describe, expect, it } from 'vitest'
import {
  CREATIVE_ASSET_BUCKET,
  buildCreativeAssetPath,
  creativeProviderDefinitions,
  getCreativeAssetTenantFromPath,
  getCreativeProviderReadiness,
  isPublishingEligible,
} from '@/lib/creative/asset-platform'

describe('creative asset platform foundation', () => {
  it('uses a private canonical bucket name and tenant-first storage path', () => {
    const path = buildCreativeAssetPath({
      tenantId: 'tenant_neejee',
      workspaceId: 'workspace_neejee_primary',
      assetId: 'asset_123',
      fileName: 'instagram-story.webp',
    })

    expect(CREATIVE_ASSET_BUCKET).toBe('creative-assets')
    expect(path).toBe(
      'tenant_neejee/workspace_neejee_primary/asset_123/instagram-story.webp',
    )
    expect(getCreativeAssetTenantFromPath(path)).toBe('tenant_neejee')
  })

  it('rejects path traversal and nested caller-controlled path segments', () => {
    expect(() =>
      buildCreativeAssetPath({
        tenantId: '../tenant_other',
        workspaceId: 'workspace_neejee_primary',
        assetId: 'asset_123',
        fileName: 'post.webp',
      }),
    ).toThrow(/invalid path segment/)

    expect(() =>
      buildCreativeAssetPath({
        tenantId: 'tenant_neejee',
        workspaceId: 'workspace/other',
        assetId: 'asset_123',
        fileName: 'post.webp',
      }),
    ).toThrow(/invalid path segment/)
  })

  it('keeps provider credentials in environment variables and exposes configuration state only', () => {
    const readiness = getCreativeProviderReadiness({
      OPENAI_API_KEY: 'configured-secret',
      ANTHROPIC_API_KEY: '',
      FAL_KEY: 'configured-secret',
    } as NodeJS.ProcessEnv)

    expect(readiness.find((item) => item.key === 'openai_image')).toMatchObject({
      configured: true,
      credentialEnv: 'OPENAI_API_KEY',
    })
    expect(readiness.find((item) => item.key === 'anthropic')).toMatchObject({
      configured: false,
      credentialEnv: 'ANTHROPIC_API_KEY',
    })
    expect(readiness.find((item) => item.key === 'fal_video')).toMatchObject({
      configured: true,
      credentialEnv: 'FAL_KEY',
    })
    expect(JSON.stringify(readiness)).not.toContain('configured-secret')
  })

  it('defines reasoning, image and video providers without hard-coding one vendor', () => {
    expect(creativeProviderDefinitions.anthropic.capabilities).toContain('reasoning')
    expect(creativeProviderDefinitions.openai_image.capabilities).toContain('image')
    expect(creativeProviderDefinitions.openai_video.capabilities).toContain('video')
    expect(creativeProviderDefinitions.fal.capabilities).toContain('image')
    expect(creativeProviderDefinitions.fal_video.capabilities).toContain('video')
  })

  it('requires explicit approval evidence before an asset is publishing eligible', () => {
    expect(
      isPublishingEligible({
        status: 'publishing_ready',
        approvedBy: '00000000-0000-4000-8000-000000000001',
        approvedAt: '2026-08-14T00:00:00.000Z',
      }),
    ).toBe(true)

    expect(
      isPublishingEligible({
        status: 'publishing_ready',
        approvedBy: null,
        approvedAt: null,
      }),
    ).toBe(false)

    expect(
      isPublishingEligible({
        status: 'generated',
        approvedBy: '00000000-0000-4000-8000-000000000001',
        approvedAt: '2026-08-14T00:00:00.000Z',
      }),
    ).toBe(false)
  })
})
