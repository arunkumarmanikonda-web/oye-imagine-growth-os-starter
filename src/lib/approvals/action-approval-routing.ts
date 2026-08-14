import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { ApiAccessContext } from '@/lib/auth/api-access';
import { resolveEvolutionTarget } from '@/lib/ai/evolution-store';

export type ActionApprovalResolution = {
  actionKey: string;
  actionFamily: string;
  makerRoleKeys: string[];
  approverRoleKeys: string[];
  clientApprovalRequired: boolean;
  assignedPartnerRequired: boolean;
  minApprovers: number;
  autoExecuteAfterApproval: boolean;
  autonomyEnvelopeRequired: boolean;
  assignedApprovers: Array<{
    userId: string;
    roleKey: string;
    responsibilityKey: string;
    isPrimary: boolean;
  }>;
  readyForApproval: boolean;
  blockingReasons: string[];
};

export async function resolveActionApproval(input: {
  access: ApiAccessContext;
  actionKey: string;
  workspaceId?: string;
}) : Promise<ActionApprovalResolution> {
  const actionKey = input.actionKey.trim();
  if (!actionKey) throw new Error('approval_action_required');
  const target = await resolveEvolutionTarget(input.access, input.workspaceId);
  const admin = createSupabaseAdminClient();
  const { data: route, error: routeError } = await admin
    .from('core_action_approval_routes')
    .select('*')
    .eq('action_key', actionKey)
    .eq('enabled', true)
    .maybeSingle();
  if (routeError || !route) throw new Error('approval_route_not_configured');

  const approverRoleKeys = Array.isArray(route.approver_role_keys) ? route.approver_role_keys : [];
  const makerRoleKeys = Array.isArray(route.maker_role_keys) ? route.maker_role_keys : [];
  let assignedApprovers: ActionApprovalResolution['assignedApprovers'] = [];
  if (approverRoleKeys.length) {
    const { data: assignments, error: assignmentError } = await admin
      .from('core_workspace_role_assignments')
      .select('user_id,role_key,responsibility_key,is_primary,status')
      .eq('tenant_id', target.tenantId)
      .eq('workspace_id', target.workspaceId)
      .eq('status', 'active')
      .in('role_key', approverRoleKeys);
    if (assignmentError) throw new Error(`approval_assignment_read_failed:${assignmentError.message}`);
    assignedApprovers = (assignments ?? []).map((row: any) => ({
      userId: row.user_id,
      roleKey: row.role_key,
      responsibilityKey: row.responsibility_key,
      isPrimary: Boolean(row.is_primary),
    }));
  }

  const blockingReasons: string[] = [];
  const minApprovers = Number(route.min_approvers ?? 0);
  if (minApprovers > 0 && assignedApprovers.length < minApprovers) {
    blockingReasons.push('Required workspace approver assignment is incomplete.');
  }
  if (route.assigned_partner_required && !assignedApprovers.some((item) => item.isPrimary)) {
    blockingReasons.push('A primary assigned partner/approver is required for this action.');
  }

  return {
    actionKey,
    actionFamily: route.action_family,
    makerRoleKeys,
    approverRoleKeys,
    clientApprovalRequired: Boolean(route.client_approval_required),
    assignedPartnerRequired: Boolean(route.assigned_partner_required),
    minApprovers,
    autoExecuteAfterApproval: Boolean(route.auto_execute_after_approval),
    autonomyEnvelopeRequired: Boolean(route.autonomy_envelope_required),
    assignedApprovers,
    readyForApproval: blockingReasons.length === 0,
    blockingReasons,
  };
}

export function makerRoleAllowed(
  resolution: ActionApprovalResolution,
  roleKey: string,
) {
  return resolution.makerRoleKeys.includes(roleKey);
}

export function approverRoleAllowed(
  resolution: ActionApprovalResolution,
  roleKey: string,
) {
  return resolution.approverRoleKeys.includes(roleKey);
}

export function actionMayAutoExecute(input: {
  resolution: ActionApprovalResolution;
  approvalCount: number;
  autonomyEnvelopeSatisfied: boolean;
  clientApprovalSatisfied?: boolean;
}) {
  const { resolution } = input;
  if (!resolution.readyForApproval) return false;
  if (!resolution.autoExecuteAfterApproval) return false;
  if (input.approvalCount < resolution.minApprovers) return false;
  if (resolution.autonomyEnvelopeRequired && !input.autonomyEnvelopeSatisfied) return false;
  if (resolution.clientApprovalRequired && !input.clientApprovalSatisfied) return false;
  return true;
}
