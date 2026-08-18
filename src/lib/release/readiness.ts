import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { listCspTelemetry } from '@/lib/security/csp-telemetry'

export const RELEASE_SCHEMA_EXPECTATION = {
  migrationFileCount: 95,
  lastSourceFile: '20260818230000_privacy_unsubscribe_guard.sql',
  lastProductionMigrationName: 'privacy_unsubscribe_guard',
} as const

export const NEEJEE_RELEASE_TARGET = {
  operationalTenantId: '95c81580-1be2-49b1-84a5-a35060384a31',
  operationalWorkspaceId: '80b3bc5f-8abc-44ed-9fca-5e11c7323bda',
  coreTenantId: 'tenant_neejee',
  coreWorkspaceId: 'workspace_neejee',
  autonomyAgentKey: 'growth-executor',
} as const

export type ReleaseEvidenceState = 'go' | 'safe_lock' | 'observing' | 'pending_external' | 'human_evidence_required' | 'blocked'

export type ReleaseEvidenceItem = {
  id: string
  label: string
  state: ReleaseEvidenceState
  detail: string
  evidence?: Record<string, unknown>
}

function safeNumber(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

async function exactCount(table: string, configure?: (query: any) => any) {
  const admin = createSupabaseAdminClient()
  let query = admin.from(table).select('*', { count: 'exact', head: true })
  if (configure) query = configure(query)
  const { count, error } = await query
  if (error) throw new Error(`release_count_failed:${table}`)
  return typeof count === 'number' ? count : 0
}

export async function buildReleaseReadinessEvidence() {
  const admin = createSupabaseAdminClient()
  const now = new Date().toISOString()

  const [
    schemaResult,
    providerAccounts,
    providerReady,
    providerReadinessTotal,
    providerQaPassed,
    pendingOauthSessions,
    pendingFundingRequests,
    creditedFundingRequests,
    autonomousRuns,
    activeQueue,
    walletResult,
    autonomyResult,
    csp,
  ] = await Promise.all([
    admin.rpc('release_schema_evidence'),
    exactCount('integration_accounts', query => query
      .eq('tenant_id', NEEJEE_RELEASE_TARGET.operationalTenantId)
      .eq('workspace_id', NEEJEE_RELEASE_TARGET.operationalWorkspaceId)
      .eq('status', 'connected')),
    exactCount('provider_channel_readiness', query => query
      .eq('tenant_id', NEEJEE_RELEASE_TARGET.operationalTenantId)
      .eq('workspace_id', NEEJEE_RELEASE_TARGET.operationalWorkspaceId)
      .eq('state', 'ready')
      .gt('valid_until', now)),
    exactCount('provider_channel_readiness', query => query
      .eq('tenant_id', NEEJEE_RELEASE_TARGET.operationalTenantId)
      .eq('workspace_id', NEEJEE_RELEASE_TARGET.operationalWorkspaceId)),
    exactCount('provider_qa_runs', query => query
      .eq('tenant_id', NEEJEE_RELEASE_TARGET.operationalTenantId)
      .eq('workspace_id', NEEJEE_RELEASE_TARGET.operationalWorkspaceId)
      .eq('status', 'passed')
      .gt('valid_until', now)),
    exactCount('integration_oauth_selection_sessions', query => query
      .eq('tenant_id', NEEJEE_RELEASE_TARGET.operationalTenantId)
      .eq('workspace_id', NEEJEE_RELEASE_TARGET.operationalWorkspaceId)
      .eq('status', 'pending')
      .gt('expires_at', now)),
    exactCount('commercial_media_funding_requests', query => query
      .eq('tenant_id', NEEJEE_RELEASE_TARGET.coreTenantId)
      .eq('workspace_id', NEEJEE_RELEASE_TARGET.operationalWorkspaceId)
      .eq('status', 'submitted')),
    exactCount('commercial_media_funding_requests', query => query
      .eq('tenant_id', NEEJEE_RELEASE_TARGET.coreTenantId)
      .eq('workspace_id', NEEJEE_RELEASE_TARGET.operationalWorkspaceId)
      .eq('status', 'credited')),
    exactCount('autonomous_execution_runs', query => query
      .eq('tenant_id', NEEJEE_RELEASE_TARGET.coreTenantId)
      .eq('workspace_id', NEEJEE_RELEASE_TARGET.coreWorkspaceId)),
    exactCount('autonomous_action_queue', query => query
      .eq('tenant_id', NEEJEE_RELEASE_TARGET.coreTenantId)
      .eq('workspace_id', NEEJEE_RELEASE_TARGET.coreWorkspaceId)
      .in('status', ['pending', 'claimed', 'reconciling'])),
    admin.from('commercial_media_balance_accounts')
      .select('tenant_id,currency,available,reserved,spent,updated_at')
      .eq('tenant_id', NEEJEE_RELEASE_TARGET.coreTenantId)
      .order('currency'),
    admin.from('agent_autonomy_policies')
      .select('autonomy_level,enabled,kill_switch,updated_at')
      .eq('tenant_id', NEEJEE_RELEASE_TARGET.coreTenantId)
      .eq('agent_key', NEEJEE_RELEASE_TARGET.autonomyAgentKey)
      .maybeSingle(),
    listCspTelemetry(24 * 30),
  ])

  if (schemaResult.error) throw new Error(`release_schema_evidence_failed:${schemaResult.error.message}`)
  if (walletResult.error) throw new Error(`release_wallet_read_failed:${walletResult.error.message}`)
  if (autonomyResult.error) throw new Error(`release_autonomy_policy_read_failed:${autonomyResult.error.message}`)

  const schema = (schemaResult.data || {}) as Record<string, unknown>
  const schemaCount = safeNumber(schema.migrationCount)
  const schemaName = String(schema.lastMigrationName || '')
  const schemaVersion = String(schema.lastMigrationVersion || '')
  const schemaParity = schemaCount === RELEASE_SCHEMA_EXPECTATION.migrationFileCount
    && schemaName === RELEASE_SCHEMA_EXPECTATION.lastProductionMigrationName

  const wallets = (walletResult.data || []).map(row => ({
    currency: String(row.currency || ''),
    available: safeNumber(row.available),
    reserved: safeNumber(row.reserved),
    spent: safeNumber(row.spent),
    updatedAt: row.updated_at || null,
  }))
  const totalAvailable = wallets.reduce((sum, row) => sum + row.available, 0)
  const totalReserved = wallets.reduce((sum, row) => sum + row.reserved, 0)
  const autonomy = autonomyResult.data as any
  const killSwitch = autonomy?.kill_switch !== false
  const verifiedFundingAvailable = creditedFundingRequests > 0 && wallets.length > 0

  const machineControls: ReleaseEvidenceItem[] = [
    {
      id: 'schema_parity',
      label: 'Supabase migration parity',
      state: schemaParity ? 'go' : 'blocked',
      detail: schemaParity
        ? `Production ledger is ${schemaCount}/${RELEASE_SCHEMA_EXPECTATION.migrationFileCount} with expected tail ${schemaName}.`
        : 'Production migration ledger does not match the source-controlled release expectation.',
      evidence: { migrationCount: schemaCount, lastMigrationVersion: schemaVersion, lastMigrationName: schemaName, expectedCount: RELEASE_SCHEMA_EXPECTATION.migrationFileCount },
    },
    {
      id: 'runtime_release_identity',
      label: 'Runtime release identity',
      state: process.env.VERCEL_ENV === 'production' && Boolean(process.env.VERCEL_GIT_COMMIT_SHA) ? 'go' : 'blocked',
      detail: process.env.VERCEL_ENV === 'production' ? 'Runtime identifies itself as a Vercel production deployment.' : 'Runtime is not identified as Vercel production.',
      evidence: { environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown', gitSha: process.env.VERCEL_GIT_COMMIT_SHA || null },
    },
    {
      id: 'csp_durable_telemetry',
      label: 'Durable CSP telemetry',
      state: 'observing',
      detail: csp.totalReports > 0
        ? `${csp.totalReports} real report-only CSP violation(s) are available for enforcement review.`
        : 'Durable telemetry is operational but representative browser evidence has not accumulated; keep CSP report-only.',
      evidence: { reportCount30d: csp.totalReports, uniqueBuckets30d: csp.bucketCount, enforcementEnabled: false },
    },
    {
      id: 'autonomy_kill_switch',
      label: 'Neejee growth-executor kill switch',
      state: killSwitch ? 'safe_lock' : 'blocked',
      detail: killSwitch
        ? 'Kill switch is ON. Consequential unattended execution remains deliberately locked.'
        : 'Kill switch is OFF; unrestricted activation requires complete external evidence before this can be considered safe.',
      evidence: { autonomyLevel: autonomy?.autonomy_level ?? null, enabled: autonomy?.enabled ?? null, killSwitch, updatedAt: autonomy?.updated_at ?? null },
    },
    {
      id: 'autonomy_inert_state',
      label: 'Autonomous execution queue',
      state: activeQueue === 0 ? 'go' : 'blocked',
      detail: activeQueue === 0 ? 'No pending/claimed/reconciling autonomous actions exist.' : `${activeQueue} autonomous action(s) are active.`,
      evidence: { totalExecutionRuns: autonomousRuns, activeQueue },
    },
    {
      id: 'media_wallet_safety',
      label: 'Governed media wallet',
      state: totalReserved === 0 ? 'go' : 'blocked',
      detail: wallets.length === 0
        ? 'No Neejee media wallet has been funded; autonomous spend cannot occur.'
        : `Wallet evidence exists with ${totalAvailable} available and ${totalReserved} reserved across ${wallets.length} currency account(s).`,
      evidence: { walletCount: wallets.length, totalAvailable, totalReserved, wallets },
    },
  ]

  const activationEvidence: ReleaseEvidenceItem[] = [
    {
      id: 'provider_accounts',
      label: 'Neejee provider accounts',
      state: providerAccounts > 0 ? 'go' : 'pending_external',
      detail: providerAccounts > 0 ? `${providerAccounts} connected provider account(s) exist.` : 'No real provider account has been connected for Neejee.',
      evidence: { connectedAccounts: providerAccounts },
    },
    {
      id: 'provider_machine_readiness',
      label: 'Machine provider readiness',
      state: providerReady > 0 ? 'go' : 'pending_external',
      detail: providerReady > 0 ? `${providerReady} channel(s) have current machine READY certificates.` : 'No channel has a current machine READY certificate; adapter definitions do not count as activation evidence.',
      evidence: { readyChannels: providerReady, totalReadinessRows: providerReadinessTotal, currentPassedQaRuns: providerQaPassed },
    },
    {
      id: 'oauth_selection_sessions',
      label: 'Pending provider OAuth selection',
      state: pendingOauthSessions === 0 ? 'go' : 'pending_external',
      detail: pendingOauthSessions === 0 ? 'No unconsumed OAuth resource-selection session is pending.' : `${pendingOauthSessions} OAuth selection session(s) require operator completion.`,
      evidence: { pendingSessions: pendingOauthSessions },
    },
    {
      id: 'media_funding_verification',
      label: 'Media funding verification',
      state: verifiedFundingAvailable ? 'go' : 'pending_external',
      detail: pendingFundingRequests > 0
        ? `${pendingFundingRequests} submitted remittance request(s) await independent verification.`
        : verifiedFundingAvailable
          ? `${creditedFundingRequests} independently verified funding request(s) back the governed media wallet.`
          : 'No maker-checker credited funding request plus wallet evidence exists; autonomous spend remains unavailable.',
      evidence: { submittedFundingRequests: pendingFundingRequests, creditedFundingRequests, walletCount: wallets.length },
    },
  ]

  const externalRequirements: ReleaseEvidenceItem[] = [
    {
      id: 'supabase_leaked_password_protection',
      label: 'Supabase leaked-password protection',
      state: 'pending_external',
      detail: 'Must be enabled in Supabase Auth project settings and independently confirmed by a clean security-advisor result. Application code cannot self-attest this setting.',
    },
    {
      id: 'github_dependabot_security_alerts',
      label: 'GitHub native Dependabot security alerts',
      state: 'pending_external',
      detail: 'Repository setting must be enabled and issue #175 closed with native GitHub evidence. Dependency audit success does not substitute for this setting.',
    },
    {
      id: 'production_admin_password_acceptance',
      label: 'Production administrator mandatory password change',
      state: 'human_evidence_required',
      detail: 'Requires a real production administrator to complete the mandated password-change flow. Code coverage cannot mark this human acceptance complete.',
    },
    {
      id: 'production_admin_mfa_acceptance',
      label: 'Production administrator MFA/AAL2 acceptance',
      state: 'human_evidence_required',
      detail: 'Application enforcement is live, but a real administrator enrollment/sign-in proof is still separate human evidence.',
    },
    {
      id: 'external_provider_authority',
      label: 'External provider production authority',
      state: providerAccounts > 0 && providerReady > 0 ? 'go' : 'pending_external',
      detail: providerAccounts > 0 && providerReady > 0
        ? 'At least one provider/account/resource has machine-verifiable authority.'
        : 'Provider-side app review, consent, exact resource selection and production permissions are still required for enabled channels.',
    },
    {
      id: 'csp_enforcement_evidence',
      label: 'CSP enforcement evidence',
      state: 'pending_external',
      detail: csp.totalReports > 0
        ? 'Review representative report-only telemetry across tested user/provider/media journeys before introducing an enforcing CSP.'
        : 'Representative real browser telemetry is not yet available; CSP must remain report-only.',
    },
  ]

  const machineBlocked = machineControls.some(item => item.state === 'blocked')
  const externalPending = [...activationEvidence, ...externalRequirements].some(item => ['pending_external', 'human_evidence_required'].includes(item.state))
  const fullAutonomousReady = !machineBlocked
    && !externalPending
    && providerAccounts > 0
    && providerReady > 0
    && verifiedFundingAvailable
    && !killSwitch

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    releaseIdentity: {
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown',
      gitSha: process.env.VERCEL_GIT_COMMIT_SHA || null,
      expectedMigrationCount: RELEASE_SCHEMA_EXPECTATION.migrationFileCount,
      productionMigrationCount: schemaCount,
      productionMigrationTail: { version: schemaVersion, name: schemaName },
    },
    decisions: {
      controlledPlatformRelease: machineBlocked ? 'blocked' : 'go',
      liveProviderActivation: providerAccounts > 0 && providerReady > 0 ? 'partially_ready' : 'blocked_external_evidence',
      fullUnattendedAutonomy: fullAutonomousReady ? 'eligible_for_deliberate_release' : 'blocked',
      unrestrictedAutoSpendAutoPublish: 'not_enabled_by_design',
      cspEnforcement: 'pending_representative_telemetry',
    },
    machineControls,
    activationEvidence,
    externalRequirements,
  }
}
