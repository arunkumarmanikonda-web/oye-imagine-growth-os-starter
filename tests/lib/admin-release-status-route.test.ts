import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  requireApiAccess: vi.fn(),
  buildReleaseReadinessEvidence: vi.fn(),
}))

vi.mock('@/lib/auth/api-access', () => {
  class ApiAccessError extends Error {
    status: 401 | 403 | 503
    code: string

    constructor(status: 401 | 403 | 503, code: string, message: string) {
      super(message)
      this.name = 'ApiAccessError'
      this.status = status
      this.code = code
    }
  }

  return {
    ApiAccessError,
    requireApiAccess: mocks.requireApiAccess,
  }
})

vi.mock('@/lib/release/readiness', () => ({
  buildReleaseReadinessEvidence: mocks.buildReleaseReadinessEvidence,
}))

import { ApiAccessError } from '@/lib/auth/api-access'
import { GET } from '../../src/app/api/admin/release-status/route'

const platformOwnerAccess = {
  membership: { role_key: 'platform_owner' },
}

const evidence = {
  schemaVersion: 1,
  generatedAt: '2026-08-18T18:45:00.000Z',
  releaseIdentity: {
    environment: 'production',
    gitSha: 'abcdef123456',
    expectedMigrationCount: 93,
    productionMigrationCount: 93,
    productionMigrationTail: { version: '20260818183025', name: 'release_schema_evidence' },
  },
  decisions: {
    controlledPlatformRelease: 'go',
    liveProviderActivation: 'blocked_external_evidence',
    fullUnattendedAutonomy: 'blocked',
    unrestrictedAutoSpendAutoPublish: 'not_enabled_by_design',
    cspEnforcement: 'pending_representative_telemetry',
  },
  machineControls: [],
  activationEvidence: [],
  externalRequirements: [],
}

describe('admin release-status evidence route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.requireApiAccess.mockResolvedValue(platformOwnerAccess)
    mocks.buildReleaseReadinessEvidence.mockResolvedValue(evidence)
  })

  it('returns the authoritative release evidence for an AAL2 platform owner', async () => {
    const response = await GET()

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('private, no-store')
    expect(mocks.requireApiAccess).toHaveBeenCalledWith({ lane: 'admin' })
    expect(mocks.buildReleaseReadinessEvidence).toHaveBeenCalledTimes(1)

    const body = await response.json()
    expect(body).toMatchObject({
      ok: true,
      releaseIdentity: {
        expectedMigrationCount: 93,
        productionMigrationCount: 93,
      },
      decisions: {
        controlledPlatformRelease: 'go',
        liveProviderActivation: 'blocked_external_evidence',
        fullUnattendedAutonomy: 'blocked',
        unrestrictedAutoSpendAutoPublish: 'not_enabled_by_design',
      },
    })
    expect(body).not.toHaveProperty('commercialEvidence')
    expect(body).not.toHaveProperty('operatorActionBridge')
    expect(JSON.stringify(body)).not.toMatch(/ADMIN_PASSWORD|SUPABASE_SERVICE_ROLE_KEY|NEXT_PUBLIC_SUPABASE_ANON_KEY/)
  })

  it('rejects an authenticated admin-lane member who is not a platform owner', async () => {
    mocks.requireApiAccess.mockResolvedValue({ membership: { role_key: 'admin' } })

    const response = await GET()
    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({ ok: false, code: 'platform_owner_required' })
    expect(mocks.buildReleaseReadinessEvidence).not.toHaveBeenCalled()
  })

  it('preserves verified access errors without assembling release evidence', async () => {
    mocks.requireApiAccess.mockRejectedValue(new ApiAccessError(401, 'unauthenticated', 'Verified sign-in is required.'))

    const response = await GET()
    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ ok: false, code: 'unauthenticated' })
    expect(mocks.buildReleaseReadinessEvidence).not.toHaveBeenCalled()
  })
})
