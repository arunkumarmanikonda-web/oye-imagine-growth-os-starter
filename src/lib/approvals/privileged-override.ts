import crypto from 'node:crypto';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { ApiAccessContext } from '@/lib/auth/api-access';

function digest(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

export async function recordPrivilegedOverride(input: {
  access: ApiAccessContext;
  tenantId?: string | null;
  workspaceId?: string | null;
  actionKey: string;
  targetType: string;
  targetId: string;
  reasonCode: string;
  reasonDetail: string;
  previousState?: Record<string, unknown>;
  resultingState?: Record<string, unknown>;
  evidence?: Record<string, unknown>;
}) {
  if (input.access.membership.role_key !== 'platform_owner') {
    throw new Error('platform_owner_required');
  }
  if (input.access.assuranceLevel !== 'aal2') {
    throw new Error('privileged_override_mfa_required');
  }

  const actionKey = input.actionKey.trim();
  const targetType = input.targetType.trim();
  const targetId = input.targetId.trim();
  const reasonCode = input.reasonCode.trim();
  const reasonDetail = input.reasonDetail.trim();
  if (!actionKey || !targetType || !targetId || !reasonCode || reasonDetail.length < 12) {
    throw new Error('privileged_override_reason_required');
  }

  const createdAt = new Date().toISOString();
  const overrideId = `override_${digest([
    input.access.subject,
    actionKey,
    targetType,
    targetId,
    createdAt,
  ].join('|'))}`;
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from('core_privileged_override_events').insert({
    override_id: overrideId,
    tenant_id: input.tenantId ?? null,
    workspace_id: input.workspaceId ?? null,
    action_key: actionKey,
    target_type: targetType,
    target_id: targetId,
    reason_code: reasonCode,
    reason_detail: reasonDetail,
    actor_user_id: input.access.subject,
    actor_role_key: input.access.membership.role_key,
    assurance_level: input.access.assuranceLevel,
    previous_state: input.previousState ?? {},
    resulting_state: input.resultingState ?? {},
    evidence: input.evidence ?? {},
    created_at: createdAt,
  });
  if (error) throw new Error(`privileged_override_audit_failed:${error.message}`);
  return { overrideId, createdAt };
}
