import 'server-only'

import crypto from 'node:crypto'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import {
  assertClientActivationTransition,
  clientModulesAreEnabled,
  type BillingCadence,
  type ClientActivationState,
} from './client-activation-journey'

function activationStateFromMetadata(metadata: unknown): ClientActivationState | null {
  if (!metadata || typeof metadata !== 'object') return null
  const value = (metadata as Record<string, unknown>).activationState
  return typeof value === 'string' ? value as ClientActivationState : null
}

export function membershipActivationState(metadata: unknown) {
  return activationStateFromMetadata(metadata)
}

export function membershipIsCommerciallyGated(metadata: unknown) {
  const state = activationStateFromMetadata(metadata)
  return state !== null && state !== 'active'
}

export async function createClientActivation(input: {
  tenantId: string
  workspaceId: string
  userId: string
  selectedPlan: string
  selectedModules: string[]
  billingCadence: BillingCadence
}) {
  const admin = createSupabaseAdminClient()
  const journeyId = `activation_${crypto.randomUUID().replaceAll('-', '')}`
  const now = new Date().toISOString()
  const { data: journey, error } = await admin.from('commercial_client_activation_journeys').insert({
    journey_id: journeyId,
    tenant_id: input.tenantId,
    workspace_id: input.workspaceId,
    state: 'brand_learning',
    selected_modules: input.selectedModules,
    billing_cadence: input.billingCadence,
    activation_metadata: {
      selectedPlan: input.selectedPlan,
      createdFrom: 'self_service_signup',
      strategyDeliveryLocked: true,
    },
  }).select('*').single()
  if (error) throw new Error(`activation_journey_create_failed:${error.message}`)

  const { error: eventError } = await admin.from('commercial_client_activation_events').insert({
    journey_id: journeyId,
    tenant_id: input.tenantId,
    workspace_id: input.workspaceId,
    from_state: null,
    to_state: 'brand_learning',
    event_type: 'signup_completed_brand_learning_started',
    idempotency_key: `signup:${input.userId}:${input.workspaceId}`,
    actor_user_id: input.userId,
    evidence: { selectedPlan: input.selectedPlan, billingCadence: input.billingCadence, occurredAt: now },
  })
  if (eventError) throw new Error(`activation_event_create_failed:${eventError.message}`)
  return journey
}

export async function getClientActivation(input: { tenantId: string; workspaceId: string }) {
  const admin = createSupabaseAdminClient()
  const { data, error } = await admin
    .from('commercial_client_activation_journeys')
    .select('*')
    .eq('tenant_id', input.tenantId)
    .eq('workspace_id', input.workspaceId)
    .maybeSingle()
  if (error) throw new Error(`activation_journey_read_failed:${error.message}`)
  return data
}

export async function transitionClientActivation(input: {
  tenantId: string
  workspaceId: string
  toState: ClientActivationState
  eventType: string
  actorUserId?: string | null
  provider?: string | null
  providerEventId?: string | null
  idempotencyKey: string
  evidence?: Record<string, unknown>
  references?: Partial<{
    brand_plan_artifact_id: string
    kyc_case_id: string
    agreement_id: string
    esign_envelope_id: string
    payment_link_id: string
    recurring_mandate_id: string
    payment_id: string
    invoice_id: string
  }>
}) {
  const admin = createSupabaseAdminClient()
  const current = await getClientActivation({ tenantId: input.tenantId, workspaceId: input.workspaceId })
  if (!current) throw new Error('activation_journey_not_found')
  const fromState = current.state as ClientActivationState
  if (fromState === input.toState) return current
  assertClientActivationTransition(fromState, input.toState)

  const now = new Date().toISOString()
  const patch: Record<string, unknown> = {
    state: input.toState,
    updated_at: now,
    ...(input.references ?? {}),
  }
  if (input.toState === 'active') patch.activated_at = now
  if (input.toState === 'suspended') patch.suspended_at = now
  if (input.toState === 'cancelled') patch.cancelled_at = now

  const { data: updated, error: updateError } = await admin
    .from('commercial_client_activation_journeys')
    .update(patch)
    .eq('journey_id', current.journey_id)
    .eq('state', fromState)
    .select('*')
    .single()
  if (updateError) throw new Error(`activation_transition_failed:${updateError.message}`)

  const { error: eventError } = await admin.from('commercial_client_activation_events').insert({
    journey_id: current.journey_id,
    tenant_id: input.tenantId,
    workspace_id: input.workspaceId,
    from_state: fromState,
    to_state: input.toState,
    event_type: input.eventType,
    provider: input.provider ?? null,
    provider_event_id: input.providerEventId ?? null,
    idempotency_key: input.idempotencyKey,
    actor_user_id: input.actorUserId ?? null,
    evidence: input.evidence ?? {},
  })
  if (eventError) throw new Error(`activation_event_write_failed:${eventError.message}`)

  const { data: memberships, error: membershipReadError } = await admin
    .from('core_tenant_memberships')
    .select('membership_id,metadata')
    .eq('tenant_id', input.tenantId)
    .eq('workspace_id', input.workspaceId)
    .in('status', ['active','invited','suspended'])
  if (membershipReadError) throw new Error(`activation_membership_read_failed:${membershipReadError.message}`)

  for (const membership of memberships ?? []) {
    const metadata = membership.metadata && typeof membership.metadata === 'object' ? membership.metadata : {}
    const { error } = await admin.from('core_tenant_memberships').update({
      metadata: { ...metadata, activationState: input.toState, modulesEnabled: clientModulesAreEnabled(input.toState) },
      updated_at: now,
    }).eq('membership_id', membership.membership_id)
    if (error) throw new Error(`activation_membership_sync_failed:${error.message}`)
  }

  const entitlementState = clientModulesAreEnabled(input.toState) ? 'enabled' : 'gated'
  const { error: entitlementError } = await admin.from('core_tenant_feature_entitlements').update({
    state: entitlementState,
    config: { activationState: input.toState, activationJourneyId: current.journey_id },
    updated_at: now,
  }).eq('tenant_id', input.tenantId).eq('workspace_id', input.workspaceId)
  if (entitlementError) throw new Error(`activation_entitlement_sync_failed:${entitlementError.message}`)

  return updated
}
