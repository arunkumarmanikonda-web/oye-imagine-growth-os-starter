import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { ApiAccessContext } from '@/lib/auth/api-access';
import { normalizeEvolutionEvent } from './evolution-engine';
import type {
  EvolutionEventInput,
  EvolutionEventRecord,
  EvolutionOutcomeMetric,
} from './evolution-types';

export type EvolutionTarget = {
  tenantId: string;
  brandId: string | null;
  workspaceId: string;
};

export async function resolveEvolutionTarget(
  access: ApiAccessContext,
  requestedWorkspaceId?: string,
): Promise<EvolutionTarget> {
  const admin = createSupabaseAdminClient();
  const workspaceId = requestedWorkspaceId?.trim() || access.membership.workspace_id;
  if (!workspaceId) throw new Error('evolution_workspace_required');

  const isPlatformOwner = access.membership.role_key === 'platform_owner';
  if (!isPlatformOwner && workspaceId !== access.membership.workspace_id) {
    throw new Error('evolution_workspace_denied');
  }

  const { data, error } = await admin
    .from('core_workspaces')
    .select('workspace_id,tenant_id,brand_id,status')
    .eq('workspace_id', workspaceId)
    .eq('status', 'active')
    .maybeSingle();

  if (error || !data) throw new Error('evolution_workspace_not_found');
  if (!isPlatformOwner && data.tenant_id !== access.membership.tenant_id) {
    throw new Error('evolution_tenant_denied');
  }

  return {
    tenantId: data.tenant_id,
    brandId: data.brand_id ?? null,
    workspaceId: data.workspace_id,
  };
}

function eventRow(event: EvolutionEventRecord, actorUserId: string | null) {
  return {
    event_id: event.eventId,
    tenant_id: event.tenantId,
    brand_id: event.brandId ?? null,
    workspace_id: event.workspaceId,
    activity_type: event.activityType,
    source_entity_type: event.sourceEntityType,
    source_entity_id: event.sourceEntityId,
    product_category: event.productCategory ?? null,
    vertical: event.vertical ?? null,
    channel: event.channel ?? null,
    language: event.language ?? 'en',
    intent: event.intent ?? null,
    prompt_template_key: event.promptTemplateKey ?? null,
    prompt_template_version: event.promptTemplateVersion ?? null,
    prompt_hash: event.promptHash ?? null,
    provider: event.provider ?? null,
    model: event.model ?? null,
    input_fingerprint: event.inputFingerprint ?? null,
    output_fingerprint: event.outputFingerprint ?? null,
    metadata: event.metadata,
    outcome_metrics: event.outcomeMetrics,
    reuse_scope: event.reuseScope,
    sensitivity: event.sensitivity,
    contains_personal_data: event.containsPersonalData,
    contains_client_secrets: event.containsClientSecrets,
    risk_class: event.riskClass,
    actor_user_id: actorUserId,
    occurred_at: event.occurredAt,
  };
}

export async function recordEvolutionEvent(input: {
  access: ApiAccessContext;
  workspaceId?: string;
  event: Omit<EvolutionEventInput, 'tenantId' | 'workspaceId' | 'brandId'>;
}) {
  const target = await resolveEvolutionTarget(input.access, input.workspaceId);
  const event = normalizeEvolutionEvent({
    ...input.event,
    tenantId: target.tenantId,
    brandId: target.brandId,
    workspaceId: target.workspaceId,
  });

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from('ai_evolution_events').insert(
    eventRow(event, input.access.subject),
  );
  if (error) throw new Error(`evolution_event_write_failed:${error.message}`);
  return event;
}

export async function attachEvolutionOutcomes(input: {
  access: ApiAccessContext;
  eventId: string;
  workspaceId?: string;
  metrics: EvolutionOutcomeMetric[];
  source?: string;
}) {
  const target = await resolveEvolutionTarget(input.access, input.workspaceId);
  const admin = createSupabaseAdminClient();
  const { data: event, error: readError } = await admin
    .from('ai_evolution_events')
    .select('event_id,tenant_id,workspace_id,outcome_metrics')
    .eq('event_id', input.eventId)
    .eq('tenant_id', target.tenantId)
    .eq('workspace_id', target.workspaceId)
    .maybeSingle();
  if (readError || !event) throw new Error('evolution_event_not_found');

  const existing = Array.isArray(event.outcome_metrics) ? event.outcome_metrics : [];
  const outcomeMetrics = [...existing, ...input.metrics];
  const { error: updateError } = await admin
    .from('ai_evolution_events')
    .update({
      outcome_metrics: outcomeMetrics,
      outcome_updated_at: new Date().toISOString(),
    })
    .eq('event_id', input.eventId)
    .eq('tenant_id', target.tenantId)
    .eq('workspace_id', target.workspaceId);
  if (updateError) throw new Error(`evolution_outcome_write_failed:${updateError.message}`);

  const { error: feedbackError } = await admin.from('ai_feedback_signals').insert({
    tenant_id: target.tenantId,
    workspace_id: target.workspaceId,
    event_id: input.eventId,
    signal_type: 'outcome_metric',
    signal_value: { metrics: input.metrics },
    source: input.source?.trim() || 'system',
    actor_user_id: input.access.subject,
  });
  if (feedbackError) throw new Error(`evolution_feedback_write_failed:${feedbackError.message}`);

  return { eventId: input.eventId, outcomeMetrics };
}

export async function listReusableLearningPatterns(input: {
  access: ApiAccessContext;
  workspaceId?: string;
  vertical?: string;
  productCategory?: string;
  channel?: string;
  limit?: number;
}) {
  const target = await resolveEvolutionTarget(input.access, input.workspaceId);
  const admin = createSupabaseAdminClient();
  const limit = Math.min(Math.max(input.limit ?? 20, 1), 100);

  let query = admin
    .from('ai_learning_patterns')
    .select('*')
    .eq('status', 'active')
    .or(`tenant_id.eq.${target.tenantId},reuse_scope.eq.platform_anonymized`)
    .order('confidence', { ascending: false })
    .limit(limit);

  if (input.vertical?.trim()) query = query.eq('vertical', input.vertical.trim());
  if (input.productCategory?.trim()) {
    query = query.eq('product_category', input.productCategory.trim());
  }
  if (input.channel?.trim()) query = query.eq('channel', input.channel.trim());

  const { data, error } = await query;
  if (error) throw new Error(`evolution_pattern_read_failed:${error.message}`);

  return (data ?? []).filter((row: any) => {
    if (row.tenant_id === target.tenantId) return true;
    return (
      row.reuse_scope === 'platform_anonymized' &&
      row.sensitivity !== 'confidential' &&
      row.sensitivity !== 'personal' &&
      row.sensitivity !== 'regulated'
    );
  });
}
