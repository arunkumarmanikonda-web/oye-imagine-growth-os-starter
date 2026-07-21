import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export type AdminAuditInput = {
  event: string;
  actorUserId: string;
  actorEmail?: string | null;
  tenantId?: string | null;
  brandId?: string | null;
  workspaceId?: string | null;
  payload?: Record<string, unknown>;
};

function createServiceRoleClient() {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export async function logAdminAuditEvent(input: AdminAuditInput) {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase.rpc("log_admin_audit_event", {
    p_event: input.event,
    p_actor_user_id: input.actorUserId,
    p_actor_email: input.actorEmail ?? null,
    p_tenant_id: input.tenantId ?? null,
    p_brand_id: input.brandId ?? null,
    p_workspace_id: input.workspaceId ?? null,
    p_payload: input.payload ?? {},
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}