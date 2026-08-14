import crypto from 'node:crypto';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export type FutureIntegrationNeed = {
  requestedCapability: string;
  proposedProviderName?: string | null;
  proposedProviderCategory?: string | null;
  reason: string;
  expectedValue?: string | null;
  accountSteps?: string[];
  requiredSecretFields?: Array<{
    key: string;
    label: string;
    sensitive?: boolean;
    required?: boolean;
  }>;
  officialDocsUrl?: string | null;
  officialAccountUrl?: string | null;
  improvementCandidateId?: string | null;
};

function digest(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

export async function registerSystemIntegrationNeed(input: FutureIntegrationNeed) {
  const capability = input.requestedCapability.trim();
  const reason = input.reason.trim();
  if (!capability || !reason) throw new Error('integration_need_required');

  const admin = createSupabaseAdminClient();
  const provider = input.proposedProviderName?.trim() || null;
  const requestId = `integration_${digest(`${capability}|${provider ?? 'unselected'}`)}`;

  const { data, error } = await admin
    .from('config_integration_requests')
    .upsert({
      request_id: requestId,
      requested_capability: capability,
      proposed_provider_name: provider,
      proposed_provider_category: input.proposedProviderCategory?.trim() || null,
      reason,
      expected_value: input.expectedValue?.trim() || null,
      required_account_steps: input.accountSteps ?? [],
      required_secret_fields: input.requiredSecretFields ?? [],
      official_docs_url: input.officialDocsUrl?.trim() || null,
      official_account_url: input.officialAccountUrl?.trim() || null,
      status: 'admin_action_required',
      discovered_by: 'ai_evolution_engine',
      improvement_candidate_id: input.improvementCandidateId ?? null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'request_id' })
    .select('request_id,status,requested_capability,proposed_provider_name,updated_at')
    .single();

  if (error) throw new Error(`integration_radar_write_failed:${error.message}`);
  return data;
}

export async function resolveIntegrationNeedAfterCredentialSetup(input: {
  requestId: string;
  providerKey: string;
  adapterAvailable: boolean;
  credentialsVerified: boolean;
}) {
  const admin = createSupabaseAdminClient();
  let status = 'credentials_pending';
  if (!input.adapterAvailable) status = 'adapter_building';
  else if (input.credentialsVerified) status = 'validation';

  const { data, error } = await admin
    .from('config_integration_requests')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('request_id', input.requestId)
    .select('request_id,status,requested_capability,proposed_provider_name')
    .maybeSingle();
  if (error || !data) throw new Error('integration_request_not_found');

  return {
    ...data,
    providerKey: input.providerKey,
    nextAction:
      status === 'adapter_building'
        ? 'Generate and validate the Oye provider adapter.'
        : status === 'validation'
          ? 'Run authenticated health, sandbox and canary validation.'
          : 'Super Admin must enter and verify the required credentials.',
  };
}
