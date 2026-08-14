import { getNeejeeOnboardingSnapshot } from '@/lib/admin/onboarding-seed'
import { getNeejeeBrandIntelligenceSnapshot } from '@/lib/admin/brand-intelligence-seed'
import type { NeejeePilotAction, NeejeePilotControlSnapshot, NeejeePilotStage } from '@/lib/admin/neejee-pilot'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

type AnyRecord = Record<string, any>
type SnapshotKind = 'onboarding' | 'brand_intelligence' | 'pilot_control'
type PilotStatus = 'blocked' | 'review_required' | 'in_progress' | 'ready'

const TENANT_SLUG = 'neejee'
const SNAPSHOT_KEYS: Record<SnapshotKind, string> = {
  onboarding: 'snapshot.onboarding.v1',
  brand_intelligence: 'snapshot.brand_intelligence.v1',
  pilot_control: 'snapshot.pilot_control.v1',
}

function isRecord(value: unknown): value is AnyRecord {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function deepMerge<T>(base: T, overlay: unknown): T {
  if (Array.isArray(base)) return (Array.isArray(overlay) ? overlay : base) as T
  if (isRecord(base) && isRecord(overlay)) {
    const result: AnyRecord = { ...base }
    for (const [key, value] of Object.entries(overlay)) {
      if (Array.isArray(value)) result[key] = value
      else if (isRecord(value) && isRecord(result[key])) result[key] = deepMerge(result[key], value)
      else if (value !== undefined && value !== null) result[key] = value
    }
    return result as T
  }
  return ((overlay ?? base) as T)
}

function normalizeStatus(value: unknown): PilotStatus {
  const text = String(value ?? '').trim().toLowerCase()
  if (!text) return 'in_progress'
  if (text.includes('block')) return 'blocked'
  if (text.includes('review')) return 'review_required'
  if (text.includes('ready') || text.includes('approved') || text.includes('complete')) return 'ready'
  return 'in_progress'
}

async function resolveNeejeeContext() {
  const admin = createSupabaseAdminClient()
  const { data: tenant, error: tenantError } = await admin
    .from('tenants')
    .select('id,slug')
    .eq('slug', TENANT_SLUG)
    .maybeSingle()
  if (tenantError || !tenant?.id) throw new Error('neejee_tenant_not_found')

  const { data: brand, error: brandError } = await admin
    .from('brands')
    .select('id,name')
    .eq('tenant_id', tenant.id)
    .ilike('name', 'Neejee')
    .limit(1)
    .maybeSingle()
  if (brandError || !brand?.id) throw new Error('neejee_brand_not_found')

  const { data: workspace, error: workspaceError } = await admin
    .from('workspaces')
    .select('id,name,slug')
    .eq('tenant_id', tenant.id)
    .eq('brand_id', brand.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (workspaceError || !workspace?.id) throw new Error('neejee_workspace_not_found')

  return { admin, tenantId: tenant.id as string, brandId: brand.id as string, workspaceId: workspace.id as string }
}

async function readSnapshot(kind: SnapshotKind): Promise<{ value: AnyRecord | null; updatedAt?: string }> {
  const { admin, workspaceId } = await resolveNeejeeContext()
  const { data, error } = await admin
    .from('workspace_settings')
    .select('value,updated_at')
    .eq('workspace_id', workspaceId)
    .eq('key', SNAPSHOT_KEYS[kind])
    .maybeSingle()
  if (error) throw new Error(`neejee_${kind}_read_failed:${error.message}`)
  return {
    value: isRecord(data?.value) ? (data!.value as AnyRecord) : null,
    updatedAt: typeof data?.updated_at === 'string' ? data.updated_at : undefined,
  }
}

async function persistSnapshot(kind: SnapshotKind, snapshot: AnyRecord) {
  const { admin, tenantId, brandId, workspaceId } = await resolveNeejeeContext()
  const now = new Date().toISOString()
  const { error } = await admin.from('workspace_settings').upsert(
    {
      tenant_id: tenantId,
      brand_id: brandId,
      workspace_id: workspaceId,
      key: SNAPSHOT_KEYS[kind],
      value: snapshot,
      updated_at: now,
    },
    { onConflict: 'workspace_id,key', ignoreDuplicates: false },
  )
  if (error) throw new Error(`neejee_${kind}_write_failed:${error.message}`)
  return now
}

export async function getWorkspaceOnboardingSnapshotLive() {
  const base = getNeejeeOnboardingSnapshot()
  const stored = await readSnapshot('onboarding')
  const merged = stored.value ? deepMerge(base, stored.value) : base
  return deepMerge(merged, { workspace: { updatedAtLabel: stored.updatedAt ?? (merged as AnyRecord).workspace?.updatedAtLabel ?? '' } })
}

export async function saveWorkspaceOnboardingSnapshotLive(patch: unknown) {
  const current = await getWorkspaceOnboardingSnapshotLive()
  const merged = deepMerge(current, isRecord(patch) ? patch : {})
  const updatedAt = await persistSnapshot('onboarding', merged as AnyRecord)
  return deepMerge(merged, { workspace: { updatedAtLabel: updatedAt } })
}

export async function getWorkspaceBrandIntelligenceSnapshotLive() {
  const base = getNeejeeBrandIntelligenceSnapshot()
  const stored = await readSnapshot('brand_intelligence')
  const merged = stored.value ? deepMerge(base, stored.value) : base
  return deepMerge(merged, { workspace: { updatedAt: stored.updatedAt ?? (merged as AnyRecord).workspace?.updatedAt ?? '' } })
}

export async function saveWorkspaceBrandIntelligenceSnapshotLive(patch: unknown) {
  const current = await getWorkspaceBrandIntelligenceSnapshotLive()
  const merged = deepMerge(current, isRecord(patch) ? patch : {})
  const updatedAt = await persistSnapshot('brand_intelligence', merged as AnyRecord)
  return deepMerge(merged, { workspace: { updatedAt } })
}

async function buildPilotControlSnapshot(): Promise<NeejeePilotControlSnapshot> {
  const onboarding = await getWorkspaceOnboardingSnapshotLive()
  const brandIntelligence = await getWorkspaceBrandIntelligenceSnapshotLive()
  const readinessCards = Array.isArray((onboarding as AnyRecord).readinessCards) ? (onboarding as AnyRecord).readinessCards as AnyRecord[] : []
  const services = Array.isArray((onboarding as AnyRecord).services) ? (onboarding as AnyRecord).services as AnyRecord[] : []
  const integrations = Array.isArray((onboarding as AnyRecord).integrations) ? (onboarding as AnyRecord).integrations as AnyRecord[] : []
  const identityCards = Array.isArray((brandIntelligence as AnyRecord).identityCards) ? (brandIntelligence as AnyRecord).identityCards as AnyRecord[] : []
  const approvedLanguage = Array.isArray((brandIntelligence as AnyRecord).approvedLanguage) ? (brandIntelligence as AnyRecord).approvedLanguage as AnyRecord[] : []
  const prohibitedLanguage = Array.isArray((brandIntelligence as AnyRecord).prohibitedLanguage) ? (brandIntelligence as AnyRecord).prohibitedLanguage as AnyRecord[] : []
  const readinessScore = readinessCards.length ? Math.round(readinessCards.reduce((sum, card) => sum + Number(card.score ?? card.readiness ?? 0), 0) / readinessCards.length) : 0
  const blockedCards = readinessCards.filter((card) => normalizeStatus(card.status) === 'blocked')
  const pendingIntegrations = integrations.filter((item) => normalizeStatus(item.status) !== 'ready')
  const profileStatus = String((brandIntelligence as AnyRecord).profileStatus ?? 'review_required')
  const brandStatus = normalizeStatus(profileStatus)
  const onboardingStatus: PilotStatus = blockedCards.length ? 'blocked' : readinessScore >= 80 ? 'ready' : 'in_progress'
  const summaryStatus: PilotStatus = onboardingStatus === 'blocked' || brandStatus === 'blocked' ? 'blocked' : brandStatus === 'review_required' ? 'review_required' : 'in_progress'
  const activationStatus: PilotStatus = onboardingStatus === 'ready' && brandStatus === 'ready' && pendingIntegrations.length === 0 ? 'ready' : blockedCards.length || pendingIntegrations.length > 1 ? 'blocked' : 'in_progress'

  const stages: NeejeePilotStage[] = [
    { id: 'onboarding', title: 'Onboarding readiness', href: '/admin/onboarding', owner: 'Client activation', status: onboardingStatus, summary: onboardingStatus === 'ready' ? 'Core onboarding lanes are in shape for activation planning.' : 'Operational readiness still needs review before launch approval.', signals: [`${readinessCards.length} readiness lane(s)`, `${blockedCards.length} blocked lane(s)`, `${services.length} configured service track(s)`] },
    { id: 'brand-intelligence', title: 'Brand intelligence', href: '/admin/brand-intelligence', owner: 'Brand strategy', status: brandStatus, summary: brandStatus === 'ready' ? 'Voice, positioning, and language controls are approved for pilot use.' : 'Brand profile requires review before the pilot voice is treated as canonical.', signals: [`${identityCards.length} identity card(s)`, `${approvedLanguage.length} approved language cue(s)`, `${prohibitedLanguage.length} prohibited language cue(s)`] },
    { id: 'summary', title: 'Executive readiness summary', href: '/admin/summary', owner: 'Leadership operations', status: summaryStatus, summary: summaryStatus === 'blocked' ? 'Leadership summary is constrained by readiness or brand-review blockers.' : 'Decision support is ready to consolidate the pilot operating picture.', signals: [`Readiness score ${readinessScore}`, `Profile status ${profileStatus}`, `${pendingIntegrations.length} integration gap(s)`] },
    { id: 'activation', title: 'Pilot activation launch', href: '/admin/marketplace', owner: 'Growth operations', status: activationStatus, summary: activationStatus === 'ready' ? 'Activation can move toward approved marketplace execution.' : 'Activation remains staged behind readiness, integration, or brand-review controls.', signals: [`${services.length} monetization track(s)`, `${pendingIntegrations.length} pending integration(s)`, activationStatus === 'ready' ? 'Go-live eligible' : 'Hold for controlled rollout'] },
  ]

  const nextActions: NeejeePilotAction[] = []
  if (blockedCards.length) nextActions.push({ label: 'Resolve onboarding blockers', href: '/admin/onboarding', tone: 'primary', detail: `Clear ${blockedCards.length} blocked readiness lane(s) before activation approval.` })
  if (brandStatus !== 'ready') nextActions.push({ label: 'Approve brand intelligence profile', href: '/admin/brand-intelligence', tone: blockedCards.length ? 'secondary' : 'primary', detail: 'Promote the Neejee brand profile from review state to approved pilot guidance.' })
  if (pendingIntegrations.length) nextActions.push({ label: 'Close integration gaps', href: '/admin/onboarding', tone: 'secondary', detail: `${pendingIntegrations.length} integration dependency(ies) still need activation planning.` })
  nextActions.push({ label: 'Review executive summary', href: '/admin/summary', tone: 'ghost', detail: 'Use the leadership snapshot to align operations, brand, and delivery readiness.' })

  return {
    workspace: { brand: String((onboarding as AnyRecord).workspace?.brand ?? 'Neejee'), pilot: 'Neejee pilot', owner: String((onboarding as AnyRecord).workspace?.owner ?? 'Neejee founder'), updatedAt: String((brandIntelligence as AnyRecord).workspace?.updatedAt ?? (onboarding as AnyRecord).workspace?.updatedAtLabel ?? new Date().toISOString()) },
    signals: { readinessScore, blockedLanes: blockedCards.length, approvedLanguageCount: approvedLanguage.length, prohibitedLanguageCount: prohibitedLanguage.length, profileStatus, serviceCount: services.length, pendingIntegrations: pendingIntegrations.length },
    stages,
    nextActions,
    executiveBrief: [
      `Neejee is running as a controlled pilot with a readiness score of ${readinessScore} across onboarding lanes.`,
      brandStatus === 'ready' ? 'Brand intelligence is approved for guided execution.' : `Brand intelligence remains in ${profileStatus} state and should be treated as a gated input.`,
      blockedCards.length ? `${blockedCards.length} blocked onboarding lane(s) still prevent clean activation.` : 'No hard onboarding blockers are currently visible in the current workspace data.',
      pendingIntegrations.length ? `${pendingIntegrations.length} integration dependency(ies) still need operational closure before launch.` : 'Integration readiness is aligned with activation planning.',
    ],
    onboarding,
    brandIntelligence,
  }
}

export async function getWorkspacePilotControlSnapshotLive(): Promise<NeejeePilotControlSnapshot> {
  const stored = await readSnapshot('pilot_control')
  if (stored.value) return deepMerge(await buildPilotControlSnapshot(), stored.value)
  return buildPilotControlSnapshot()
}

export async function saveWorkspacePilotControlSnapshotLive(patch: unknown) {
  const current = await getWorkspacePilotControlSnapshotLive()
  const merged = deepMerge(current, isRecord(patch) ? patch : {})
  const updatedAt = await persistSnapshot('pilot_control', merged as AnyRecord)
  return deepMerge(merged, { workspace: { updatedAt } })
}
